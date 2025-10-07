import { useState } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: {
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'TT-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 132,
      items: [
        {
          id: '1',
          name: 'Organic Apple Puree',
          quantity: 2,
          price: 45,
          image: '🍎'
        },
        {
          id: '2',
          name: 'Sweet Potato Mash',
          quantity: 1,
          price: 42,
          image: '🍠'
        }
      ],
      deliveryAddress: '123 Main St, Cape Town, 8001',
      deliveryDate: '2024-01-16',
      deliveryTime: 'morning'
    },
    {
      id: '2',
      orderNumber: 'TT-2024-002',
      date: '2024-01-20',
      status: 'shipped',
      total: 89,
      items: [
        {
          id: '3',
          name: 'Banana & Oatmeal',
          quantity: 1,
          price: 48,
          image: '🍌'
        },
        {
          id: '4',
          name: 'Carrot & Pea Mix',
          quantity: 1,
          price: 44,
          image: '🥕'
        }
      ],
      deliveryAddress: '456 Oak Ave, Cape Town, 8002',
      deliveryDate: '2024-01-22',
      deliveryTime: 'afternoon'
    },
    {
      id: '3',
      orderNumber: 'TT-2024-003',
      date: '2024-01-25',
      status: 'processing',
      total: 156,
      items: [
        {
          id: '5',
          name: 'Chicken & Rice',
          quantity: 2,
          price: 52,
          image: '🍗'
        },
        {
          id: '6',
          name: 'Mixed Berry Blend',
          quantity: 1,
          price: 46,
          image: '🫐'
        }
      ],
      deliveryAddress: '789 Pine St, Cape Town, 8003',
      deliveryDate: '2024-01-27',
      deliveryTime: 'evening'
    }
  ])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TT</span>
                </div>
                <span className="font-bold text-2xl text-gray-800">Little Harvest</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-gray-600 hover:text-gray-800 font-semibold">Products</Link>
              <Link href="/cart" className="text-gray-600 hover:text-gray-800 font-semibold">Cart</Link>
              <Link href="/orders" className="text-emerald-600 font-semibold">Orders</Link>
              <Link href="/dev-login" className="text-gray-600 hover:text-gray-800 font-semibold">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your baby food orders</p>
        </div>

        {orders.length === 0 ? (
          /* No Orders */
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link 
              href="/products"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">Placed on {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-1">R{order.total}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Items ({order.items.length})</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="text-2xl">{item.image}</div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-medium">R{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Delivery Schedule</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.deliveryDate).toLocaleDateString()} - {order.deliveryTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="p-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.status === 'delivered' && 'Order completed successfully!'}
                      {order.status === 'shipped' && 'Your order is on its way!'}
                      {order.status === 'processing' && 'We\'re preparing your order...'}
                      {order.status === 'pending' && 'Your order is being reviewed...'}
                    </div>
                    <div className="flex space-x-3">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View Details
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/products"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Shop More Products
            </Link>
            <Link 
              href="/cart"
              className="border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
            >
              View Cart
            </Link>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
