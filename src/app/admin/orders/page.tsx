'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Download,
  RefreshCw,
  Calendar,
  User,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalZar: number
  createdAt: string
  deliveryDate?: string
  paymentDueDate?: string
  paidAt?: string
  user: {
    id: string
    name: string
    email: string
  }
  address?: {
    street: string
    city: string
    province: string
  }
  items: Array<{
    id: string
    quantity: number
    product: {
      name: string
    }
    portionSize: {
      name: string
    }
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-purple-100 text-purple-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳'
      case 'confirmed': return '✅'
      case 'preparing': return '👨‍🍳'
      case 'ready': return '📦'
      case 'out_for_delivery': return '🚚'
      case 'delivered': return '🎉'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'unpaid': return <XCircle className="h-4 w-4 text-red-600" />
      case 'expired': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const isPaymentOverdue = (paymentDueDate?: string) => {
    if (!paymentDueDate) return false
    return new Date() > new Date(paymentDueDate)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          paymentStatus: newPaymentStatus
        })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder.order } : order
        ))
      } else {
        alert('Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    }
  }

  const markAsPaid = async (orderId: string) => {
    await updatePaymentStatus(orderId, 'PAID')
  }

  const markAsUnpaid = async (orderId: string) => {
    await updatePaymentStatus(orderId, 'UNPAID')
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle>Search & Filter Orders</CardTitle>
          <CardDescription>Find orders quickly by customer or order details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="gradient-card shadow-modern card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {order.user.name}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          R{order.totalZar.toFixed(2)}
                        </div>
                        {order.paymentDueDate && (
                          <div className={`flex items-center ${isPaymentOverdue(order.paymentDueDate) ? 'text-red-600' : ''}`}>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Due: {new Date(order.paymentDueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.product.name} ({item.portionSize.name})</span>
                          <span className="font-medium">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.address && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address:</h4>
                      <p className="text-sm text-gray-600">
                        {order.address.street}, {order.address.city}, {order.address.province}
                      </p>
                    </div>
                  )}

                  {/* Delivery Date */}
                  {order.deliveryDate && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Date:</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-3">
                  {/* Order Status */}
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getStatusIcon(order.status)}</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center space-x-2">
                    {getPaymentStatusIcon(order.paymentStatus)}
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Payment Actions */}
                  {order.paymentStatus === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => markAsPaid(order.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Paid
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => markAsUnpaid(order.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Mark Unpaid
                      </Button>
                    </div>
                  )}

                  {/* Order Status Update */}
                  <Select
                    value={order.status}
                    onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PREPARING">Preparing</SelectItem>
                      <SelectItem value="READY">Ready</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="gradient-card shadow-modern">
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here once customers start placing them.'
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status.toLowerCase() === 'pending').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status.toLowerCase() === 'delivered').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">🎉</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  R{orders.reduce((sum, o) => sum + o.totalZar, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
