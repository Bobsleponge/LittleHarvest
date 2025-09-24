import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'card' | 'cash' | 'eft'
  total: number
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  items: OrderItem[]
  shippingAddress: {
    street: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  deliveryDate: string
  deliveryTime: string
  specialInstructions: string
  createdAt: string
  updatedAt: string
  notes: string
}

interface OrderFilters {
  status: string
  paymentStatus: string
  dateRange: string
  search: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'TT-2024-001',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+27 82 123 4567',
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      total: 132,
      subtotal: 120,
      deliveryFee: 25,
      tax: 15,
      discount: 28,
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'Organic Apple Puree',
          productImage: '🍎',
          quantity: 2,
          price: 45,
          total: 90
        },
        {
          id: '2',
          productId: '2',
          productName: 'Sweet Potato Mash',
          productImage: '🍠',
          quantity: 1,
          price: 42,
          total: 42
        }
      ],
      shippingAddress: {
        street: '123 Main Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        country: 'South Africa'
      },
      deliveryDate: '2024-01-29',
      deliveryTime: '10:00-12:00',
      specialInstructions: 'Please ring doorbell twice',
      createdAt: '2024-01-28T14:30:00Z',
      updatedAt: '2024-01-28T15:45:00Z',
      notes: 'Customer requested early delivery'
    },
    {
      id: '2',
      orderNumber: 'TT-2024-002',
      customerName: 'Mike Chen',
      customerEmail: 'mike@example.com',
      customerPhone: '+27 83 234 5678',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'eft',
      total: 89,
      subtotal: 89,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      items: [
        {
          id: '3',
          productId: '3',
          productName: 'Banana & Oatmeal',
          productImage: '🍌',
          quantity: 1,
          price: 48,
          total: 48
        },
        {
          id: '4',
          productId: '4',
          productName: 'Chicken & Rice',
          productImage: '🍗',
          quantity: 1,
          price: 52,
          total: 52
        }
      ],
      shippingAddress: {
        street: '456 Oak Avenue',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000',
        country: 'South Africa'
      },
      deliveryDate: '2024-01-30',
      deliveryTime: '14:00-16:00',
      specialInstructions: '',
      createdAt: '2024-01-28T12:15:00Z',
      updatedAt: '2024-01-28T12:15:00Z',
      notes: ''
    },
    {
      id: '3',
      orderNumber: 'TT-2024-003',
      customerName: 'Emma Davis',
      customerEmail: 'emma@example.com',
      customerPhone: '+27 84 345 6789',
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      total: 156,
      subtotal: 144,
      deliveryFee: 25,
      tax: 17,
      discount: 30,
      items: [
        {
          id: '5',
          productId: '1',
          productName: 'Organic Apple Puree',
          productImage: '🍎',
          quantity: 2,
          price: 45,
          total: 90
        },
        {
          id: '6',
          productId: '3',
          productName: 'Banana & Oatmeal',
          productImage: '🍌',
          quantity: 1,
          price: 48,
          total: 48
        },
        {
          id: '7',
          productId: '4',
          productName: 'Chicken & Rice',
          productImage: '🍗',
          quantity: 1,
          price: 52,
          total: 52
        }
      ],
      shippingAddress: {
        street: '789 Pine Street',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        postalCode: '4000',
        country: 'South Africa'
      },
      deliveryDate: '2024-01-29',
      deliveryTime: '09:00-11:00',
      specialInstructions: 'Leave at front door if no answer',
      createdAt: '2024-01-28T10:45:00Z',
      updatedAt: '2024-01-28T16:20:00Z',
      notes: 'Express delivery requested'
    },
    {
      id: '4',
      orderNumber: 'TT-2024-004',
      customerName: 'David Wilson',
      customerEmail: 'david@example.com',
      customerPhone: '+27 85 456 7890',
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      total: 94,
      subtotal: 94,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      items: [
        {
          id: '8',
          productId: '2',
          productName: 'Sweet Potato Mash',
          productImage: '🍠',
          quantity: 2,
          price: 42,
          total: 84
        }
      ],
      shippingAddress: {
        street: '321 Elm Street',
        city: 'Pretoria',
        province: 'Gauteng',
        postalCode: '0001',
        country: 'South Africa'
      },
      deliveryDate: '2024-01-27',
      deliveryTime: '15:00-17:00',
      specialInstructions: '',
      createdAt: '2024-01-27T16:20:00Z',
      updatedAt: '2024-01-27T17:30:00Z',
      notes: 'Delivered successfully'
    },
    {
      id: '5',
      orderNumber: 'TT-2024-005',
      customerName: 'Lisa Brown',
      customerEmail: 'lisa@example.com',
      customerPhone: '+27 86 567 8901',
      status: 'cancelled',
      paymentStatus: 'refunded',
      paymentMethod: 'card',
      total: 0,
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      items: [],
      shippingAddress: {
        street: '654 Maple Drive',
        city: 'Port Elizabeth',
        province: 'Eastern Cape',
        postalCode: '6000',
        country: 'South Africa'
      },
      deliveryDate: '',
      deliveryTime: '',
      specialInstructions: '',
      createdAt: '2024-01-27T14:10:00Z',
      updatedAt: '2024-01-27T18:45:00Z',
      notes: 'Customer cancelled due to change in plans'
    }
  ])

  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    search: ''
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filters.status === 'all' || order.status === filters.status
    const matchesPaymentStatus = filters.paymentStatus === 'all' || order.paymentStatus === filters.paymentStatus
    const matchesSearch = order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesPaymentStatus && matchesSearch
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'orderNumber':
        return a.orderNumber.localeCompare(b.orderNumber)
      case 'customerName':
        return a.customerName.localeCompare(b.customerName)
      case 'total':
        return b.total - a.total
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
        : order
    ))
  }

  const updatePaymentStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, paymentStatus: newStatus as any, updatedAt: new Date().toISOString() }
        : order
    ))
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
    }
  }

  const stats = getOrderStats()

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
            <p className="text-gray-600">Track and manage customer orders</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Export Orders
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Process Batch
            </button>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">R{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Order number, customer..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="orderNumber">Order Number</option>
                <option value="customerName">Customer Name</option>
                <option value="total">Total Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.deliveryDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="text-lg" title={item.productName}>
                            {item.productImage}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R{order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          View
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {sortedOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => setFilters({ status: 'all', paymentStatus: 'all', dateRange: 'all', search: '' })}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Order Details - {selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={() => {
                      setShowOrderModal(false)
                      setSelectedOrder(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Order Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Order Number:</span>
                          <span className="text-sm font-medium">{selectedOrder.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Payment Method:</span>
                          <span className="text-sm font-medium capitalize">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="text-sm font-medium">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Updated:</span>
                          <span className="text-sm font-medium">{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm font-medium">{selectedOrder.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm font-medium">{selectedOrder.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm font-medium">{selectedOrder.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Delivery Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Address:</span>
                          <p className="text-sm font-medium mt-1">
                            {selectedOrder.shippingAddress.street}<br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}<br />
                            {selectedOrder.shippingAddress.postalCode}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Delivery Date:</span>
                          <span className="text-sm font-medium">{selectedOrder.deliveryDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Delivery Time:</span>
                          <span className="text-sm font-medium">{selectedOrder.deliveryTime}</span>
                        </div>
                        {selectedOrder.specialInstructions && (
                          <div>
                            <span className="text-sm text-gray-600">Special Instructions:</span>
                            <p className="text-sm font-medium mt-1">{selectedOrder.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items and Totals */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{item.productImage}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">R{item.price}</p>
                              <p className="text-xs text-gray-500">Total: R{item.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Order Summary</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="text-sm font-medium">R{selectedOrder.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Delivery Fee:</span>
                          <span className="text-sm font-medium">R{selectedOrder.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tax:</span>
                          <span className="text-sm font-medium">R{selectedOrder.tax}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="text-sm font-medium text-green-600">-R{selectedOrder.discount}</span>
                          </div>
                        )}
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span className="text-md font-semibold text-gray-900">Total:</span>
                            <span className="text-md font-semibold text-gray-900">R{selectedOrder.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Notes</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowOrderModal(false)
                      setSelectedOrder(null)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
