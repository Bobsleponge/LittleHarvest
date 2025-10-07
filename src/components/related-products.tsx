'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Product, RelatedProductsProps } from '@/lib/types'

// Memoized Related Product Card
const RelatedProductCard = memo(({ product }: { product: Product }) => {
  const handleAddToCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          portionSizeId: product.prices?.[0]?.portionSize?.id,
          quantity: 1,
        }),
      })
      
      if (response.ok) {
        // Could add toast notification here
        console.log('Added to cart successfully')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }, [product.id, product.prices])

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 card-hover">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              width={200}
              height={150}
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {product.ageGroup?.name}
            </Badge>
          </div>
          <CardTitle className="text-sm font-semibold line-clamp-2">
            <Link href={`/products/${product.slug}`} className="hover:text-emerald-600 transition-colors">
              {product.name}
            </Link>
          </CardTitle>
          <div className="flex items-center justify-between pt-1">
            <div className="text-sm font-bold text-emerald-600">
              R{product.prices?.[0]?.amountZar || 0}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 h-7 px-2"
            >
              <ShoppingCart className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

RelatedProductCard.displayName = 'RelatedProductCard'

export const RelatedProducts = memo(({ currentProductId, ageGroupId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Memoize the API URL
  const apiUrl = useMemo(() => 
    `/api/products/related?ageGroup=${ageGroupId}&exclude=${currentProductId}`,
    [ageGroupId, currentProductId]
  )

  const fetchRelatedProducts = useCallback(async () => {
    try {
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    fetchRelatedProducts()
  }, [fetchRelatedProducts])

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-48 bg-muted rounded-md" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
})

RelatedProducts.displayName = 'RelatedProducts'
