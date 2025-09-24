'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading'
import { getOrderStatusInfo, getPaymentStatusInfo, formatCurrency, formatDate } from '@/lib/order-utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalZar: number
  createdAt: string
  deliveryDate?: string
  paymentDueDate?: string
  address?: {
    street: string
    city: string
    province: string
    postalCode: string
  }
  items: Array<{
    id: string
    quantity: number
    product: {
      name: string
      imageUrl?: string
      ageGroup: { name: string }
      texture: { name: string }
    }
    portionSize: {
      name: string
      grams: number
    }
    unitPriceZar: number
    lineTotalZar: number
  }>
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'PAID':
      case 'CONFIRMED':
      case 'PREPARING':
      case 'READY':
      case 'OUT_FOR_DELIVERY':
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'UNPAID':
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'UNPAID':
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredOrders = (statusFilter?: string) => {
    if (!statusFilter) return orders
    return orders.filter(order => order.status === statusFilter)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Error Loading Orders</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchOrders}>
              Try Again
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
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                My Orders
              </h1>
              <p className="text-muted-foreground">
                Track and manage your orders
              </p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/products">
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="PENDING">Pending ({filteredOrders('PENDING').length})</TabsTrigger>
              <TabsTrigger value="CONFIRMED">Confirmed ({filteredOrders('CONFIRMED').length})</TabsTrigger>
              <TabsTrigger value="DELIVERED">Delivered ({filteredOrders('DELIVERED').length})</TabsTrigger>
              <TabsTrigger value="CANCELLED">Cancelled ({filteredOrders('CANCELLED').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>

            <TabsContent value="PENDING" className="space-y-4">
              {filteredOrders('PENDING').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>

            <TabsContent value="CONFIRMED" className="space-y-4">
              {filteredOrders('CONFIRMED').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>

            <TabsContent value="DELIVERED" className="space-y-4">
              {filteredOrders('DELIVERED').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>

            <TabsContent value="CANCELLED" className="space-y-4">
              {filteredOrders('CANCELLED').map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const orderStatusInfo = getOrderStatusInfo(order.status)
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)
  const isPaymentOverdue = order.paymentDueDate && new Date() > new Date(order.paymentDueDate)

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              Order #{order.orderNumber}
            </CardTitle>
            <CardDescription>
              Placed on {formatDate(order.createdAt)}
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge 
              variant={orderStatusInfo.color === 'green' ? 'default' : 
                     orderStatusInfo.color === 'red' ? 'destructive' : 
                     orderStatusInfo.color === 'yellow' ? 'secondary' : 'outline'}
              className="mb-2"
            >
              {orderStatusInfo.label}
            </Badge>
            <div className="text-lg font-semibold text-emerald-600">
              {formatCurrency(order.totalZar)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Payment Status */}
          <div className="flex items-center gap-2">
            {getPaymentStatusIcon(order.paymentStatus)}
            <div>
              <p className="text-sm font-medium">Payment</p>
              <Badge 
                variant={paymentStatusInfo.color === 'green' ? 'default' : 
                       paymentStatusInfo.color === 'red' ? 'destructive' : 
                       paymentStatusInfo.color === 'yellow' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {paymentStatusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Delivery Date */}
          {order.deliveryDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Delivery</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.deliveryDate)}
                </p>
              </div>
            </div>
          )}

          {/* Payment Due */}
          {order.paymentDueDate && order.paymentStatus === 'PENDING' && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Payment Due</p>
                <p className={`text-xs ${isPaymentOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {formatDate(order.paymentDueDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Items Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Items ({order.items.length})</h4>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${order.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{item.quantity}x</span>
                <span>{item.product.name}</span>
                <span className="text-muted-foreground">
                  ({item.portionSize.name})
                </span>
                <span className="text-emerald-600 font-medium ml-auto">
                  {formatCurrency(item.lineTotalZar)}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{order.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Delivery Address</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
