import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDetails } from '@/components/product-details'
import { ProductReviews } from '@/components/product-reviews'
import { RelatedProducts } from '@/components/related-products'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
      isActive: true,
    },
    include: {
      ageGroup: true,
      texture: true,
      prices: {
        where: { isActive: true },
        include: {
          portionSize: true,
        },
        orderBy: {
          portionSize: {
            name: 'asc',
          },
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-foreground">Products</Link></li>
          <li>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-muted-foreground text-lg">No Image Available</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => {
              // Add smallest portion size to cart
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
            }}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.ageGroup.name}</Badge>
              <Badge variant="outline">{product.texture.name}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {product.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Available Sizes</CardTitle>
              <CardDescription>Choose the perfect portion size for your little one</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.prices.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{price.portionSize.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {price.portionSize.measurement || price.portionSize.name} portion
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold">R{Number(price.amountZar).toFixed(2)}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          fetch('/api/cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              productId: product.id,
                              portionSizeId: price.portionSize.id,
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
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergens */}
          {(product.contains && product.contains.trim()) || (product.mayContain && product.mayContain.trim()) ? (
            <Card>
              <CardHeader>
                <CardTitle>Allergen Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.contains && product.contains.trim() && (
                  <div>
                    <p className="font-medium text-destructive mb-2">Contains:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.contains.split(',').map((allergen) => (
                        <Badge key={allergen.trim()} variant="destructive">
                          {allergen.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.mayContain && product.mayContain.trim() && (
                  <div>
                    <p className="font-medium text-orange-600 mb-2">May contain:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.mayContain.split(',').map((allergen) => (
                        <Badge key={allergen.trim()} variant="outline" className="border-orange-600 text-orange-600">
                          {allergen.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Product Details Component */}
      <ProductDetails product={product} />

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      <RelatedProducts 
        currentProductId={product.id}
        ageGroupId={product.ageGroupId}
      />
    </div>
  )
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  })

  return products.map((product) => ({
    slug: product.slug,
  }))
}
