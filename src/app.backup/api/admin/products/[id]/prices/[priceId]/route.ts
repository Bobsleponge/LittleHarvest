import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cache, cacheKeys } from '@/lib/cache'

const priceUpdateSchema = z.object({
  portionSizeId: z.string().min(1, 'Portion size is required'),
  amountZar: z.number().min(0, 'Price must be positive'),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; priceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = priceUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { portionSizeId, amountZar } = validation.data

    // Check if price exists
    const existingPrice = await prisma.price.findUnique({
      where: { id: params.priceId },
    })

    if (!existingPrice) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 })
    }

    // Check if another price already exists for this product and portion size
    const conflictingPrice = await prisma.price.findFirst({
      where: {
        productId: params.id,
        portionSizeId: portionSizeId,
        id: { not: params.priceId },
      },
    })

    if (conflictingPrice) {
      return NextResponse.json(
        { error: 'Price already exists for this portion size' },
        { status: 400 }
      )
    }

    // Update price
    const price = await prisma.price.update({
      where: { id: params.priceId },
      data: {
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
    console.error('Error updating product price:', error)
    return NextResponse.json(
      { error: 'Failed to update product price' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; priceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if price exists
    const existingPrice = await prisma.price.findUnique({
      where: { id: params.priceId },
    })

    if (!existingPrice) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 })
    }

    // Delete price
    await prisma.price.delete({
      where: { id: params.priceId },
    })

    // Invalidate product cache to ensure price changes are reflected on user pages
    cache.delete(cacheKeys.products({}))
    cache.delete(cacheKeys.product(params.id))

    return NextResponse.json({ message: 'Price deleted successfully' })
  } catch (error) {
    console.error('Error deleting product price:', error)
    return NextResponse.json(
      { error: 'Failed to delete product price' },
      { status: 500 }
    )
  }
}
