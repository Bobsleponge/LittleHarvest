import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'
import { useAdminDate } from '../../src/lib/admin-date-context'

// Utility function to format dates consistently (avoiding hydration mismatch)
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: OrderItem[]
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
  paymentMethod: string
}

export default function AdminOrdersPage() {
  const { getDateFilter } = useAdminDate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  // Handle customer filtering from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const customerEmail = urlParams.get('customer')
    if (customerEmail) {
      setSearch(customerEmail)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      
      if (data.orders) {
        // Transform API data to match frontend format
        const transformedOrders = data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          date: order.createdAt,
          status: order.status.toLowerCase(),
          total: order.totalZar,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.unitPriceZar,
            image: item.product.imageUrl || '🍎'
          })),
          deliveryAddress: order.address ? 
            `${order.address.street}, ${order.address.city}, ${order.address.province} ${order.address.postalCode}` : 
            'No address provided',
          deliveryDate: order.deliveryDate || order.createdAt,
          deliveryTime: '9:00 AM - 5:00 PM',
          paymentMethod: 'Credit Card'
        }))
        setOrders(transformedOrders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the order in the local state
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        ))
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id))
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const promises = selectedOrders.map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      )

      await Promise.all(promises)

      // Update local state
      setOrders(orders.map(order =>
        selectedOrders.includes(order.id)
          ? { ...order, status: newStatus as any }
          : order
      ))

      setSelectedOrders([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error updating bulk orders:', error)
      alert('Failed to update some orders')
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Order Number', 'Customer Name', 'Email', 'Date', 'Status', 'Total', 'Items'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.date,
        order.status,
        order.total,
        order.items.map(item => `${item.name} (${item.quantity})`).join('; ')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const closeOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(search.toLowerCase())
    
    // Apply date filtering
    const { startDate, endDate } = getDateFilter()
    let matchesDate = true
    if (startDate && endDate) {
      const orderDate = new Date(order.date)
      matchesDate = orderDate >= startDate && orderDate <= endDate
    }
    
    return matchesFilter && matchesSearch && matchesDate
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
            <p className="text-gray-600">Manage and track customer orders</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportOrders}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Bulk Actions ({selectedOrders.length})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedOrders.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedOrders.length} order(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('processing')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Mark Processing
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('shipped')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Mark Shipped
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('delivered')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
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

        {/* Orders List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.customerName} • {order.customerEmail}
                    </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">R{order.total}</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Placed on {formatDate(order.date)}</p>
                      <p>Payment: {order.paymentMethod}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="text-gray-600">
                        {formatDate(order.deliveryDate)} - {order.deliveryTime}
                      </p>
                      <p className="text-gray-500">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Items ({order.items.length})</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {order.items.map(item => (
                        <p key={item.id}>{item.name} × {item.quantity}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewDetails(order)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Clear Filters */}
        {(search || filter !== 'all') && (
          <div className="text-center mt-8">
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

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Order Details - #{selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Order Status and Actions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)} {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">R{selectedOrder.total}</span>
                    </div>
                    <div className="flex space-x-2">
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'processing')
                            closeOrderDetails()
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Start Processing
                        </button>
                      )}
                      {selectedOrder.status === 'processing' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'shipped')
                            closeOrderDetails()
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {selectedOrder.status === 'shipped' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'delivered')
                            closeOrderDetails()
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Customer Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-xl mr-2">👤</span>
                      Customer Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Order Date:</span>
                        <p className="text-gray-900">{formatDate(selectedOrder.date)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                        <p className="text-gray-900">{selectedOrder.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-xl mr-2">🚚</span>
                      Delivery Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Delivery Date:</span>
                        <p className="text-gray-900">{formatDate(selectedOrder.deliveryDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Delivery Time:</span>
                        <p className="text-gray-900">{selectedOrder.deliveryTime}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Address:</span>
                        <p className="text-gray-900">{selectedOrder.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-xl mr-2">📦</span>
                    Order Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{item.image}</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">R{item.price}</p>
                          <p className="text-sm text-gray-600">R{item.price * item.quantity} total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-gray-900">R{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-xl mr-2">⏰</span>
                    Order Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-600">{formatDate(selectedOrder.date)}</p>
                      </div>
                    </div>
                    {selectedOrder.status !== 'pending' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Processing Started</p>
                          <p className="text-xs text-gray-600">Order is being prepared</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                          <p className="text-xs text-gray-600">On its way to customer</p>
                        </div>
                      </div>
                    ) : null}
                    {selectedOrder.status === 'delivered' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                          <p className="text-xs text-gray-600">Successfully delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeOrderDetails}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Print order details
                      window.print()
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Print Order
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
