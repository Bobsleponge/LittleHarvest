import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../src/lib/auth'
import { FileValidator } from '../../src/lib/file-validation'
import { VirusScanner } from '../../src/lib/virus-scanning'
import { logger } from '../../src/lib/logger'
import { getClientIP } from '../../src/lib/security-utils'
import { withCSRFProtection } from '../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS, getRateLimitKey } from '../../src/lib/rate-limit'
import { withSecurityHeaders, addFileUploadSecurityHeaders } from '../../src/lib/helmet-security'
import { validationSchemas, validateWithJoi } from '../../src/lib/joi-validation'
import { fileTypeFromBuffer } from 'file-type'

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
}

interface UploadResult {
  success: boolean
  fileUrl?: string
  error?: string
  fileId?: string
  scanResult?: any
}

const handler = async function (req: NextApiRequest, res: NextApiResponse<UploadResult>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      })
    }

    // Log upload attempt
    const clientIP = getClientIP(req)
    logger.info('File upload attempt', {
      userId: session.user.id,
      userEmail: session.user.email,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent']
    })

    // Configure formidable
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => {
        // Basic MIME type filtering
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        return allowedTypes.includes(mimetype || '')
      },
      filename: (name, ext, part, form) => {
        // Generate secure filename
        return FileValidator.generateSecureFilename(`${name}${ext}`)
      }
    })

    // Parse the form
    const [fields, files] = await form.parse(req)
    
    // Get the uploaded file
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    if (!uploadedFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      })
    }

    const filePath = uploadedFile.filepath
    const originalName = uploadedFile.originalFilename || 'unknown'
    const mimeType = uploadedFile.mimetype || 'application/octet-stream'
    const size = uploadedFile.size || 0

    // Enhanced file validation using file-type
    const fileBuffer = await fs.readFile(filePath)
    const detectedType = await fileTypeFromBuffer(fileBuffer)
    
    if (!detectedType) {
      await fs.unlink(filePath).catch(() => {})
      return res.status(400).json({ 
        success: false, 
        error: 'Unable to detect file type' 
      })
    }

    // Validate detected type matches declared type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(detectedType.mime)) {
      await fs.unlink(filePath).catch(() => {})
      return res.status(400).json({ 
        success: false, 
        error: `File type mismatch. Detected: ${detectedType.mime}, Declared: ${mimeType}` 
      })
    }

    // Validate file using Joi schema
    const fileValidation = validateWithJoi(validationSchemas.fileUpload)({
      file: {
        name: originalName,
        size: size,
        type: detectedType.mime
      }
    })

    if (!fileValidation.success) {
      await fs.unlink(filePath).catch(() => {})
      return res.status(400).json({ 
        success: false, 
        error: `File validation failed: ${Object.values(fileValidation.errors || {}).flat().join(', ')}` 
      })
    }

    // Virus scanning
    const scanResult = await VirusScanner.scanFile(filePath)
    if (!scanResult.isClean) {
      // Quarantine the file
      await VirusScanner.quarantineFile(filePath, scanResult.threats.join(', '))
      
      logger.error('Malicious file detected', {
        userId: session.user.id,
        fileName: originalName,
        threats: scanResult.threats,
        fileHash: scanResult.fileHash,
        ipAddress: clientIP
      })

      return res.status(400).json({ 
        success: false, 
        error: `File rejected: ${scanResult.threats.join(', ')}` 
      })
    }

    // Generate final secure filename
    const secureFilename = FileValidator.generateSecureFilename(originalName)
    const finalPath = path.join(uploadDir, secureFilename)
    
    // Move file to final location
    await fs.rename(filePath, finalPath)

    // Generate file URL
    const fileUrl = `/uploads/${secureFilename}`
    const fileId = secureFilename.replace(/\.[^/.]+$/, '') // Remove extension for ID

    // Log successful upload
    logger.info('File upload successful', {
      userId: session.user.id,
      fileName: originalName,
      secureFileName: secureFilename,
      fileSize: size,
      fileHash: scanResult.fileHash,
      scanTime: scanResult.scanTime,
      ipAddress: clientIP
    })

    // Log security event
    await logger.logSecurityEvent('file_upload_blocked', {
      userId: session.user.id,
      userEmail: session.user.email,
      ipAddress: clientIP,
      severity: 'low',
      details: `File uploaded: ${originalName} -> ${secureFilename}`,
      metadata: {
        fileSize: size,
        fileType: mimeType,
        scanResult: scanResult
      }
    })

    return res.status(200).json({
      success: true,
      fileUrl,
      fileId,
      scanResult: {
        scanTime: scanResult.scanTime,
        fileHash: scanResult.fileHash,
        threatsFound: scanResult.threats.length
      }
    })

  } catch (error) {
    logger.error('File upload error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}

export default withSecurityHeaders(withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.UPLOAD,
  (req) => getRateLimitKey(req, req.user?.id)
)(handler)))
