import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema, validateFormData } from '@/lib/validations'
import { cache, cacheKeys } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const products = await prisma.product.findMany({
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          include: {
            portionSize: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })

    const total = await prisma.product.count()

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received product creation request:', body)
    
    // Validate input data
    const validation = validateFormData(productSchema, body)
    if (!validation.success) {
      console.error('Validation failed:', validation.errors)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const {
      name,
      slug,
      description,
      ageGroupId,
      textureId,
      imageUrl,
      contains,
      mayContain,
      isActive,
    } = validation.data!

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        ageGroupId,
        textureId,
        imageUrl: imageUrl || null,
        contains: contains || '',
        mayContain: mayContain || '',
        isActive,
      },
      include: {
        ageGroup: true,
        texture: true,
      },
    })

    // Invalidate product cache to ensure new products appear on user pages
    cache.delete(cacheKeys.products({}))

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}