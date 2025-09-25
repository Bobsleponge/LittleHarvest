import { useState } from 'react'
import Link from 'next/link'
import Header from '../src/components/header'
import Footer from '../src/components/footer'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  date: string
  status: string
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }>
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
  paymentMethod: string
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim()) {
      setError('Please enter an order number')
      return
    }

    setIsLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await fetch('/api/orders')
      const orders = await response.json()
      
      const foundOrder = orders.find((o: Order) => 
        o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
      )

      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        setError('Order not found. Please check your order number and try again.')
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      setError('Unable to track order. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'processing': return '🔄'
      case 'shipped': return '🚚'
      case 'delivered': return '✅'
      case 'cancelled': return '❌'
      default: return '📦'
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Your order has been received and is being prepared'
      case 'processing': return 'Your order is being prepared for shipping'
      case 'shipped': return 'Your order is on its way to you'
      case 'delivered': return 'Your order has been delivered successfully'
      case 'cancelled': return 'Your order has been cancelled'
      default: return 'Order status unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-lg text-gray-600">Enter your order number to check the status of your delivery</p>
          </div>

          {/* Track Order Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., TT-2024-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
                    <p className="text-gray-600">Placed on {new Date(order.date).toLocaleDateString('en-US')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      <span className="mr-2">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">R{order.total}</p>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(order.status)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                    <p className="text-gray-600">{getStatusDescription(order.status)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="text-2xl">{item.image}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">R{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-gray-600">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Details</h4>
                    <p className="text-gray-600">
                      {new Date(order.deliveryDate).toLocaleDateString('en-US')} - {order.deliveryTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
            <p className="text-blue-800 mb-4">
              Can't find your order or have questions about your delivery? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Contact Support
              </Link>
              <Link
                href="/order"
                className="inline-block border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
              >
                Place New Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
