import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

// Utility function to format dates consistently (avoiding hydration mismatch)
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
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
  paymentMethod: string
}

export default function AdminOrdersPage() {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'TT-2024-001',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      date: '2024-01-15',
      status: 'delivered',
      total: 132,
      items: [
        { id: '1', name: 'Organic Apple Puree', quantity: 2, price: 45, image: '🍎' },
        { id: '2', name: 'Sweet Potato Mash', quantity: 1, price: 42, image: '🍠' }
      ],
      deliveryAddress: '123 Main St, Cape Town, 8001',
      deliveryDate: '2024-01-16',
      deliveryTime: 'morning',
      paymentMethod: 'card'
    },
    {
      id: '2',
      orderNumber: 'TT-2024-002',
      customerName: 'Mike Chen',
      customerEmail: 'mike@example.com',
      date: '2024-01-20',
      status: 'shipped',
      total: 89,
      items: [
        { id: '3', name: 'Banana & Oatmeal', quantity: 1, price: 48, image: '🍌' },
        { id: '4', name: 'Carrot & Pea Mix', quantity: 1, price: 44, image: '🥕' }
      ],
      deliveryAddress: '456 Oak Ave, Cape Town, 8002',
      deliveryDate: '2024-01-22',
      deliveryTime: 'afternoon',
      paymentMethod: 'cash'
    },
    {
      id: '3',
      orderNumber: 'TT-2024-003',
      customerName: 'Emma Davis',
      customerEmail: 'emma@example.com',
      date: '2024-01-25',
      status: 'processing',
      total: 156,
      items: [
        { id: '5', name: 'Chicken & Rice', quantity: 2, price: 52, image: '🍗' },
        { id: '6', name: 'Mixed Berry Blend', quantity: 1, price: 46, image: '🫐' }
      ],
      deliveryAddress: '789 Pine St, Cape Town, 8003',
      deliveryDate: '2024-01-27',
      deliveryTime: 'evening',
      paymentMethod: 'card'
    },
    {
      id: '4',
      orderNumber: 'TT-2024-004',
      customerName: 'David Wilson',
      customerEmail: 'david@example.com',
      date: '2024-01-28',
      status: 'pending',
      total: 94,
      items: [
        { id: '1', name: 'Organic Apple Puree', quantity: 1, price: 45, image: '🍎' },
        { id: '3', name: 'Banana & Oatmeal', quantity: 1, price: 48, image: '🍌' }
      ],
      deliveryAddress: '321 Elm St, Cape Town, 8004',
      deliveryDate: '2024-01-30',
      deliveryTime: 'morning',
      paymentMethod: 'card'
    }
  ])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

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

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Updating order ${orderId} to ${newStatus}`)
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Orders</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">Manage customer orders and deliveries</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Export Orders
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Process Orders
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by number, customer name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.customerName} • {order.customerEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} mb-2`}>
                      <span className="mr-1">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">R{order.total}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Schedule</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.deliveryDate)} - {order.deliveryTime}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                    <p className="text-sm text-gray-600 capitalize">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="p-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.status === 'delivered' && 'Order completed successfully!'}
                    {order.status === 'shipped' && 'Order is on its way to customer!'}
                    {order.status === 'processing' && 'Order is being prepared...'}
                    {order.status === 'pending' && 'Order is awaiting processing...'}
                  </div>
                  <div className="flex space-x-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Process Order
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setSearch('')
                setFilter('all')
              }}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
