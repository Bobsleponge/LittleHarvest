'use client'

import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ApiError } from '@/components/error-boundary'
import { LoadingGrid } from '@/components/ui/loading'
import { Product } from '@/lib/types'

interface ProductGridProps {
  searchParams: {
    age?: string
    texture?: string
    search?: string
    page?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }
}

// Memoized Product Card Component
const ProductCard = memo(({ product }: { product: Product }) => {
  const handleAddToCart = useCallback(async () => {
    // Add to cart logic here
    console.log('Adding to cart:', product.id)
  }, [product.id])

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 card-hover">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </Link>
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.ageGroup?.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.texture?.name}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold line-clamp-2">
            <Link href={`/products/${product.slug}`} className="hover:text-emerald-600 transition-colors">
              {product.name}
            </Link>
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </CardDescription>
          <div className="flex items-center justify-between pt-2">
            <div className="text-lg font-bold text-emerald-600">
              From R{product.prices?.[0]?.amountZar || 0}
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'

export const ProductGrid = memo(({ searchParams }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Memoize the API URL to prevent unnecessary re-fetches
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()
    
    if (searchParams.age) params.append('age', searchParams.age)
    if (searchParams.texture) params.append('texture', searchParams.texture)
    if (searchParams.search) params.append('search', searchParams.search)
    if (searchParams.page) params.append('page', searchParams.page)
    if (searchParams.sort) params.append('sort', searchParams.sort)
    if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice)
    if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice)

    return `/api/products?${params.toString()}`
  }, [searchParams])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (loading) {
    return <LoadingGrid count={6} />
  }

  if (error) {
    return (
      <ApiError 
        error={error} 
        onRetry={() => {
          setError('')
          setLoading(true)
          // Re-fetch products
          const params = new URLSearchParams()
          if (searchParams.age) params.append('age', searchParams.age)
          if (searchParams.texture) params.append('texture', searchParams.texture)
          if (searchParams.search) params.append('search', searchParams.search)
          if (searchParams.page) params.append('page', searchParams.page)

          fetch(`/api/products?${params.toString()}`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch products')
              return response.json()
            })
            .then(data => {
              setProducts(data.products || [])
              setLoading(false)
            })
            .catch(err => {
              setError(err instanceof Error ? err.message : 'An error occurred')
              setLoading(false)
            })
        }}
      />
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
        <Button variant="outline" asChild>
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
})

ProductGrid.displayName = 'ProductGrid'
