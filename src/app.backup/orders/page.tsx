'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string | null
  totalZar: number
  createdAt: string
  deliveryDate?: string
  paymentDueDate?: string
  paidAt?: string
  items: Array<{
    id: string
    quantity: number
    product: {
      name: string
      imageUrl?: string
    }
    portionSize: {
      name: string
      measurement?: string
    }
    unitPriceZar: number
    lineTotalZar: number
  }>
  address?: {
    street: string
    city: string
    province: string
    postalCode: string
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dev-login')
      return
    }

    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 text-yellow-600" /> }
      case 'CONFIRMED': return { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4 text-blue-600" /> }
      case 'PREPARING': return { label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: <Package className="h-4 w-4 text-purple-600" /> }
      case 'READY': return { label: 'Ready', color: 'bg-orange-100 text-orange-800', icon: <Truck className="h-4 w-4 text-orange-600" /> }
      case 'OUT_FOR_DELIVERY': return { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: <Truck className="h-4 w-4 text-indigo-600" /> }
      case 'DELIVERED': return { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 text-green-600" /> }
      case 'CANCELLED': return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 text-red-600" /> }
      default: return { label: status, color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-4 w-4 text-gray-600" /> }
    }
  }

  const getPaymentStatusInfo = (paymentStatus: string | null) => {
    if (!paymentStatus) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-4 w-4 text-gray-600" /> }
    
    switch (paymentStatus) {
      case 'PENDING': return { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 text-yellow-600" /> }
      case 'PAID': return { label: 'Paid', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4 text-green-600" /> }
      case 'UNPAID': return { label: 'Unpaid', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 text-red-600" /> }
      case 'EXPIRED': return { label: 'Payment Expired', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4 text-red-600" /> }
      default: return { label: paymentStatus, color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-4 w-4 text-gray-600" /> }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isPaymentOverdue = (paymentDueDate?: string) => {
    if (!paymentDueDate) return false
    return new Date() > new Date(paymentDueDate)
  }

  if (status === 'loading' || loading) {
    return <LoadingPage />
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-modern-lg pulse-glow">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-gradient drop-shadow-lg">
              My Orders
            </h1>
            <p className="text-readable-white text-xl font-light">
              Track your orders and delivery status
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="glass border-0 shadow-modern-xl card-hover">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-readable-white mb-2">No orders yet</h3>
            <p className="text-readable-white mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 btn-modern pulse-glow shadow-modern-lg btn-text" 
              asChild
            >
              <Link href="/products">
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderStatusInfo = getOrderStatusInfo(order.status)
            const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)
            const paymentOverdue = isPaymentOverdue(order.paymentDueDate)

            return (
              <Card key={order.id} className="glass border-0 shadow-modern-xl card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-readable-white text-xl">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="text-readable-white">
                        Placed on {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={orderStatusInfo.color}>
                        {orderStatusInfo.icon}
                        <span className="ml-2">{orderStatusInfo.label}</span>
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass border-white/20 text-readable-white hover:text-gray-800 hover:bg-white/10 btn-modern shadow-modern" 
                        asChild
                      >
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-readable-white flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-readable-white">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="text-readable-white font-medium">
                              R{item.lineTotalZar}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-readable-white">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-readable-white flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment
                      </h4>
                      <div className="space-y-2">
                        <Badge className={paymentStatusInfo.color}>
                          {paymentStatusInfo.icon}
                          <span className="ml-2">{paymentStatusInfo.label}</span>
                        </Badge>
                        {paymentOverdue && (
                          <p className="text-sm text-red-600 font-medium">
                            Payment overdue
                          </p>
                        )}
                        {order.paymentDueDate && !paymentOverdue && (
                          <p className="text-sm text-readable-white">
                            Due: {formatDate(order.paymentDueDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-readable-white flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        Delivery
                      </h4>
                      <div className="space-y-2">
                        {order.deliveryDate ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-readable-white" />
                            <span className="text-readable-white">
                              {formatDate(order.deliveryDate)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-readable-white">Delivery date TBD</p>
                        )}
                        {order.address && (
                          <div className="flex items-start text-sm">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-readable-white" />
                            <div className="text-readable-white">
                              <p>{order.address.street}</p>
                              <p>{order.address.city}, {order.address.province}</p>
                              <p>{order.address.postalCode}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-white/20 pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-readable-white">Total</span>
                      <span className="text-2xl font-bold text-gradient">
                        R{order.totalZar.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}