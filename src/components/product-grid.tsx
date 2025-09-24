'use client'

import { useState, useEffect } from 'react'
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

export function ProductGrid({ searchParams }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (searchParams.age) params.append('age', searchParams.age)
        if (searchParams.texture) params.append('texture', searchParams.texture)
        if (searchParams.search) params.append('search', searchParams.search)
        if (searchParams.page) params.append('page', searchParams.page)
        if (searchParams.sort) params.append('sort', searchParams.sort)
        if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice)
        if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice)

        const response = await fetch(`/api/products?${params.toString()}`)
        
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
    }

    fetchProducts()
  }, [searchParams])

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
        <Card key={product.id} className="group gradient-card shadow-modern card-hover overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0 glass hover:scale-110 transition-all duration-300">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0 glass hover:scale-110 transition-all duration-300">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Rating stars */}
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-white ml-1">(4.8)</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <Badge variant="secondary">{product.ageGroup.name}</Badge>
              </div>
              <CardDescription className="line-clamp-2 mb-3">
                {product.description}
              </CardDescription>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{product.texture.name}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Allergens */}
              {product.contains && product.contains.trim() && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contains:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.contains.split(',').map((allergen) => (
                      <Badge key={allergen.trim()} variant="destructive" className="text-xs">
                        {allergen.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

                      {/* Price Range */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="text-lg font-semibold">
                            R{Math.min(...product.prices.map(p => Number(p.amountZar))).toFixed(2)}
                          </p>
                          {product.prices.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {product.prices[0].portionSize?.measurement || product.prices[0].portionSize?.name}
                            </p>
                          )}
                        </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="btn-modern" asChild>
                    <Link href={`/products/${product.slug}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                  <Button 
                    size="sm"
                    className="btn-modern gradient-bg hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      const smallestPrice = product.prices[0]
                      if (smallestPrice) {
                        fetch('/api/cart', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            productId: product.id,
                            portionSizeId: smallestPrice.portionSize.id,
                            quantity: 1,
                          }),
                        }).then(response => {
                          if (response.ok) {
                            alert('Added to cart!')
                          } else {
                            alert('Failed to add to cart')
                          }
                        }).catch(() => {
                          alert('Failed to add to cart')
                        })
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
