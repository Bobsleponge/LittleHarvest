import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderConfirmation } from '@/components/order-confirmation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, CreditCard, MapPin, Package } from 'lucide-react'
import Link from 'next/link'
import { getOrderStatusInfo, getPaymentStatusInfo, formatCurrency, formatDate } from '@/lib/order-utils'

interface OrderPageProps {
  params: {
    orderId: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    notFound()
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.orderId,
      userId: session.user.id,
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              ageGroup: {
                select: {
                  name: true
                }
              },
              texture: {
                select: {
                  name: true
                }
              }
            }
          },
          portionSize: {
            select: {
              id: true,
              name: true,
              measurement: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  const orderStatusInfo = getOrderStatusInfo(order.status)
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-muted-foreground">
                Order #{order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      Order Status
                    </CardTitle>
                    <CardDescription>
                      Current status of your order
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={orderStatusInfo.color === 'green' ? 'default' : 
                           orderStatusInfo.color === 'red' ? 'destructive' : 
                           orderStatusInfo.color === 'yellow' ? 'secondary' : 'outline'}
                    className="text-sm"
                  >
                    {orderStatusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {orderStatusInfo.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.deliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Date:</span>
                      <span>{formatDate(order.deliveryDate)}</span>
                    </div>
                  )}
                  {order.paymentDueDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Due:</span>
                      <span className={new Date() > order.paymentDueDate ? 'text-red-600' : ''}>
                        {formatDate(order.paymentDueDate)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Payment Status
                    </CardTitle>
                    <CardDescription>
                      Payment information and instructions
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={paymentStatusInfo.color === 'green' ? 'default' : 
                           paymentStatusInfo.color === 'red' ? 'destructive' : 
                           paymentStatusInfo.color === 'yellow' ? 'secondary' : 'outline'}
                    className="text-sm"
                  >
                    {paymentStatusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {paymentStatusInfo.description}
                </p>
                
                {order.paymentStatus === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Payment Required</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Please make payment within 24 hours to confirm your order.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Amount Due:</span>
                        <span className="font-semibold text-yellow-800">
                          {formatCurrency(order.totalZar)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Reference:</span>
                        <span className="font-mono text-yellow-800">
                          {order.orderNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Order Items
                </CardTitle>
                <CardDescription>
                  Items in your order
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
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/orders">
                    View All Orders
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
                {order.paymentStatus === 'PENDING' && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/orders/${order.id}/payment`}>
                      View Payment Details
                    </Link>
                  </Button>
                )}
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
