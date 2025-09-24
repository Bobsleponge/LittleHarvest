import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // For now, return mock data since we don't have a reviews table
    // In a real app, you would query the reviews table here
    const mockReviews = [
      {
        id: '1',
        rating: 5,
        comment: 'My little one absolutely loves this! The texture is perfect for her age.',
        user: { name: 'Sarah M.' },
        createdAt: new Date('2024-01-15').toISOString(),
      },
      {
        id: '2',
        rating: 4,
        comment: 'Great quality and fresh ingredients. Would definitely order again.',
        user: { name: 'Mike D.' },
        createdAt: new Date('2024-01-10').toISOString(),
      },
      {
        id: '3',
        rating: 5,
        comment: 'Perfect portion size and my baby finished the whole thing!',
        user: { name: 'Emma L.' },
        createdAt: new Date('2024-01-08').toISOString(),
      },
    ]

    const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
    const totalReviews = mockReviews.length

    return NextResponse.json({
      reviews: mockReviews,
      averageRating,
      totalReviews,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const { rating, comment } = await request.json()

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comment must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // For now, return success since we don't have a reviews table
    // In a real app, you would create the review here
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
