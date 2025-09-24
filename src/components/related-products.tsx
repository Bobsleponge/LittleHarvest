'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Product, RelatedProductsProps } from '@/lib/types'

export function RelatedProducts({ currentProductId, ageGroupId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products/related?ageGroup=${ageGroupId}&exclude=${currentProductId}`)
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
    }

    fetchRelatedProducts()
  }, [currentProductId, ageGroupId])

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
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Heart className="h-4 w-4" />
                  </Button>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="text-lg font-semibold">
                    R{Math.min(...product.prices.map(p => Number(p.amountZar))).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/products/${product.slug}`}>
                      View
                    </Link>
                  </Button>
                  <Button 
                    size="sm"
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
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
