import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { ImageOptimizer } from '@/lib/image-utils'
import { withRateLimit, RATE_LIMITS, getRateLimitKey } from '@/lib/rate-limit'
import { logger, perfLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  return perfLogger.timeAsync('upload:image', async () => {
    const session = await getServerSession(authOptions)
    
    try {

      if (!session?.user?.id || session.user.role !== 'ADMIN') {
        logger.warn('Unauthorized upload attempt', { userId: session?.user?.id })
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      logger.info('Image upload initiated', { userId: session.user.id })

      // Apply rate limiting
      const rateLimitCheck = withRateLimit(
        RATE_LIMITS.UPLOAD,
        (req) => getRateLimitKey(req, session.user.id)
      )
      
      const rateLimitResponse = rateLimitCheck(request)
      if (rateLimitResponse) {
        logger.logSecurityEvent('rate_limit_exceeded', { 
          userId: session.user.id, 
          endpoint: 'upload:image' 
        })
        return rateLimitResponse
      }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      logger.logSecurityEvent('file_upload_blocked', { 
        userId: session.user.id,
        fileType: file.type,
        reason: 'invalid_type'
      })
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      logger.logSecurityEvent('file_upload_blocked', { 
        userId: session.user.id,
        fileSize: file.size,
        reason: 'file_too_large'
      })
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create upload directory:', error)
      return NextResponse.json(
        { error: 'Failed to create upload directory' },
        { status: 500 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `product-${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Validate image
    const isValidImage = await ImageOptimizer.validateImage(filePath)
    if (!isValidImage) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      )
    }

    // Generate optimized version
    const optimizedFileName = fileName.replace(/\.[^/.]+$/, '.webp')
    const optimizedPath = join(uploadDir, optimizedFileName)
    
    try {
      await ImageOptimizer.optimizeImage(filePath, optimizedPath, {
        width: 800,
        height: 600,
        quality: 85,
        format: 'webp',
      })

      // Clean up original file
      await unlink(filePath)

      // Return the optimized URL
      const fileUrl = `/uploads/${optimizedFileName}`

      logger.info('Image upload successful', { 
        userId: session.user.id,
        fileName: optimizedFileName,
        optimized: true,
        originalSize: file.size,
        optimizedSize: (await stat(join(uploadDir, optimizedFileName))).size
      })

      return NextResponse.json({ 
        success: true, 
        fileUrl,
        fileName: optimizedFileName,
        optimized: true
      })
    } catch (optimizationError) {
      console.error('Image optimization failed:', optimizationError)
      
      // Fallback to original file
      const fileUrl = `/uploads/${fileName}`
      
      return NextResponse.json({ 
        success: true, 
        fileUrl,
        fileName,
        optimized: false
      })
    }
    } catch (error) {
      logger.error('Error uploading file', { 
        userId: session?.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, error as Error)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }
  }, { endpoint: 'upload:image' })
}
