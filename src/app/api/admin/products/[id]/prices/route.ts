import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cache, cacheKeys } from '@/lib/cache'

const priceSchema = z.object({
  portionSizeId: z.string().min(1, 'Portion size is required'),
  amountZar: z.number().min(0, 'Price must be positive'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prices = await prisma.price.findMany({
      where: { productId: params.id },
      include: {
        portionSize: true,
      },
      orderBy: { amountZar: 'asc' },
    })

    return NextResponse.json({ prices })
  } catch (error) {
    console.error('Error fetching product prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product prices' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = priceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { portionSizeId, amountZar } = validation.data

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if price already exists for this product and portion size
    const existingPrice = await prisma.price.findFirst({
      where: {
        productId: params.id,
        portionSizeId: portionSizeId,
      },
    })

    if (existingPrice) {
      return NextResponse.json(
        { error: 'Price already exists for this portion size' },
        { status: 400 }
      )
    }

    // Create new price
    const price = await prisma.price.create({
      data: {
        productId: params.id,
        portionSizeId,
        amountZar,
      },
      include: {
        portionSize: true,
      },
    })

    // Invalidate product cache to ensure price changes are reflected on user pages
    cache.delete(cacheKeys.products({}))
    cache.delete(cacheKeys.product(params.id))

    return NextResponse.json({ price })
  } catch (error) {
    console.error('Error creating product price:', error)
    return NextResponse.json(
      { error: 'Failed to create product price' },
      { status: 500 }
    )
  }
}
