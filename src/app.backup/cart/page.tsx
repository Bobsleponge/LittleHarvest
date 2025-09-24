'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner, LoadingButton } from '@/components/ui/loading'

interface CartItem {
  id: string
  productId: string
  portionSizeId: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    imageUrl: string | null
    ageGroup: {
      name: string
    }
    texture: {
      name: string
    }
  }
  portionSize: {
    name: string
    measurement: string
  }
  unitPrice: number
  lineTotal: number
}

export default function CartPage() {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchCartItems()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchCartItems()
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        await fetchCartItems()
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setUpdating(null)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = subtotal > 200 ? 0 : 50 // Free shipping over R200
  const total = subtotal + shipping

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your cart and continue shopping.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="h-20 w-20 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to add items to your cart.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-full bg-muted rounded-md flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            <Link 
                              href={`/products/${item.product.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.product.ageGroup.name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.product.texture.name}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                        >
                          {updating === item.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {item.portionSize.name} ({item.portionSize.measurement})
                          </p>
                          <p className="text-lg font-semibold">
                            R{item.unitPrice.toFixed(2)} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id || item.quantity <= 1}
                          >
                            {updating === item.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1
                              updateQuantity(item.id, newQuantity)
                            }}
                            className="w-16 text-center"
                            min="1"
                            disabled={updating === item.id}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                          >
                            {updating === item.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="text-right mt-2">
                        <p className="text-lg font-bold">
                          R{item.lineTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `R${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {subtotal < 200 && (
                  <p className="text-sm text-muted-foreground">
                    Add R{(200 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
