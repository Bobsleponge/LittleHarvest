import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema, validateFormData } from '@/lib/validations'
import { cache, cacheKeys } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          include: {
            portionSize: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If slug is being updated, check for conflicts
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugConflict = await prisma.product.findUnique({
        where: { slug: body.slug },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Validate input data
    const validation = validateFormData(productSchema, body)
    if (!validation.success) {
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

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        ageGroupId,
        textureId,
        imageUrl: imageUrl || null,
        contains: contains || '',
        mayContain: mayContain || '',
        isActive: isActive ?? true,
      },
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          include: {
            portionSize: true,
          },
        },
      },
    })

    // Invalidate product cache to ensure changes are reflected on user pages
    cache.delete(cacheKeys.products({}))
    cache.delete(cacheKeys.product(params.id))

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete product (this will cascade delete related prices due to foreign key constraints)
    await prisma.product.delete({
      where: { id: params.id },
    })

    // Invalidate product cache to ensure changes are reflected on user pages
    cache.delete(cacheKeys.products({}))
    cache.delete(cacheKeys.product(params.id))

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
