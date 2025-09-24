import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')
    const exclude = searchParams.get('exclude')
    const limit = parseInt(searchParams.get('limit') || '4')

    if (!ageGroup) {
      return NextResponse.json(
        { error: 'Age group parameter is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      isActive: true,
      ageGroupId: ageGroup,
    }

    // Exclude specific product
    if (exclude) {
      where.id = { not: exclude }
    }

    // Fetch related products
    const products = await prisma.product.findMany({
      where,
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          where: { isActive: true },
          include: {
            portionSize: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.imageUrl,
      ageGroup: product.ageGroup,
      texture: product.texture,
      prices: product.prices.map(price => ({
        amountZar: Number(price.amountZar),
        portionSize: price.portionSize,
      })),
    }))

    return NextResponse.json({ products: transformedProducts })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    )
  }
}
