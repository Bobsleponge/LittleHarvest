'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Copy, 
  MapPin, 
  Package,
  AlertTriangle,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { getBankDetails, formatCurrency, formatDate } from '@/lib/order-utils'

interface OrderConfirmationProps {
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string | null
    totalZar: number
    createdAt: string
    deliveryDate?: string
    paymentDueDate?: string
    address?: {
      street: string
      city: string
      province: string
      postalCode: string
      country: string
    }
    items: Array<{
      id: string
      quantity: number
      unitPriceZar: number
      lineTotalZar: number
      product: {
        name: string
        imageUrl?: string
        ageGroup: { name: string }
        texture: { name: string }
      }
      portionSize: {
        name: string
        measurement: string
      }
    }>
    notes?: string
  }
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const [copied, setCopied] = useState(false)
  const bankDetails = getBankDetails()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const isPaymentOverdue = order.paymentDueDate && new Date() > new Date(order.paymentDueDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-600 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your order has been placed successfully
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Order #{order.orderNumber}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Instructions */}
            {order.paymentStatus === 'PENDING' && (
              <Card className="shadow-lg border-amber-200">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <CreditCard className="h-5 w-5" />
                    Payment Required
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    Complete your payment to confirm your order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isPaymentOverdue && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Payment deadline has passed. Please contact us immediately.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bank:</span>
                        <span className="font-medium">{bankDetails.bankName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Account Name:</span>
                        <span className="font-medium">{bankDetails.accountName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{bankDetails.accountNumber}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(bankDetails.accountNumber)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Branch Code:</span>
                        <span className="font-mono font-medium">{bankDetails.branchCode}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reference:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{order.orderNumber}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(order.orderNumber)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-semibold text-lg text-emerald-600">
                          {formatCurrency(order.totalZar)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Important Instructions</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      {bankDetails.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your order will be confirmed once payment is verified. 
                      You have 24 hours to complete payment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your order details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.portionSize.name} ({item.portionSize.measurement})
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.product.ageGroup.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.product.texture.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Qty: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPriceZar)} each
                        </p>
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(item.lineTotalZar)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-emerald-600">
                      {formatCurrency(order.totalZar)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <Badge 
                    variant={order.paymentStatus === 'PENDING' ? 'secondary' : 
                           order.paymentStatus === 'PAID' ? 'default' : 'destructive'}
                  >
                    {order.paymentStatus || 'UNKNOWN'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Date:</span>
                  <span className="text-sm">{formatDate(order.createdAt)}</span>
                </div>
                {order.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivery:</span>
                    <span className="text-sm">{formatDate(order.deliveryDate)}</span>
                  </div>
                )}
                {order.paymentDueDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Due:</span>
                    <span className={`text-sm ${isPaymentOverdue ? 'text-red-600' : ''}`}>
                      {formatDate(order.paymentDueDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {order.address && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{order.address.street}</p>
                    <p>{order.address.city}</p>
                    <p>{order.address.province} {order.address.postalCode}</p>
                    <p>{order.address.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/orders/${order.id}`}>
                    View Order Details
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/orders">
                    View All Orders
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {order.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
