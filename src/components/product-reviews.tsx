'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, StarIcon } from 'lucide-react'
import { Review, ProductReviewsProps } from '@/lib/types'

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews || [])
          setAverageRating(data.averageRating || 0)
          setTotalReviews(data.totalReviews || 0)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        setReviews([])
        setAverageRating(0)
        setTotalReviews(0)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              {totalReviews > 0 ? (
                <>
                  {averageRating.toFixed(1)} out of 5 stars ({totalReviews} reviews)
                </>
              ) : (
                'No reviews yet'
              )}
            </CardDescription>
          </div>
          <Button variant="outline">Write a Review</Button>
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.user.name}</span>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Be the first to review this product!
            </p>
            <Button>Write a Review</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
