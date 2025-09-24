'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Package,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/order-utils'

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
    grams: number
  }
  unitPrice: number
  lineTotal: number
}

interface Address {
  id: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (session) {
      fetchCheckoutData()
    } else {
      router.push('/auth/signin')
    }
  }, [session, router])

  const fetchCheckoutData = async () => {
    try {
      setLoading(true)
      
      // Fetch cart items and addresses in parallel
      const [cartResponse, addressesResponse] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/profile')
      ])

      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        setCartItems(cartData.items || [])
      }

      if (addressesResponse.ok) {
        const profileData = await addressesResponse.json()
        setAddresses(profileData.profile?.addresses || [])
        
        // Set default address if available
        const defaultAddress = profileData.profile?.addresses?.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      }

      // Set default delivery date (tomorrow)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDeliveryDate(tomorrow.toISOString().split('T')[0])

    } catch (err) {
      setError('Failed to load checkout data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAddressId || !deliveryDate) {
      setError('Please select a delivery address and date')
      return
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          deliveryDate,
          notes: notes.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const orderData = await response.json()
      
      // Redirect to order confirmation page
      router.push(`/orders/${orderData.order.id}/confirmation`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const shipping = subtotal > 200 ? 0 : 50
    const total = subtotal + shipping
    
    return { subtotal, shipping, total }
  }

  const { subtotal, shipping, total } = calculateTotals()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Button asChild>
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Checkout
              </h1>
              <p className="text-muted-foreground">
                Complete your order
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription>
                    Select your delivery address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No delivery addresses found. Please add an address in your profile.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{address.street}</p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.province} {address.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.country}
                              </p>
                            </div>
                            {address.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/profile">
                        Manage Addresses
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Date */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Delivery Date
                  </CardTitle>
                  <CardDescription>
                    When would you like your order delivered?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Orders are typically delivered within 2-3 business days
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                  <CardDescription>
                    Any special instructions for your order?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g., Leave at front door, call when arriving, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Cart Items */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Order Summary
                  </CardTitle>
                  <CardDescription>
                    Review your items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.portionSize.name} ({item.portionSize.grams}g)
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.product.ageGroup.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm text-emerald-600 font-semibold">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge variant="outline" className="text-green-600">
                          Free
                        </Badge>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-emerald-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !selectedAddressId || !deliveryDate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You will be redirected to payment instructions after placing your order.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}