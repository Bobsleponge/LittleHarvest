import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'
import { useColorSettings } from '../../src/lib/ui-settings-context'

// Utility function to format dates consistently
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

interface Notification {
  id: string
  type: 'new_order' | 'low_stock' | 'out_of_stock' | 'order_status_change' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  data?: any // Additional data for the notification
}

interface Product {
  id: string
  name: string
  stock: number
  minStock: number
  maxStock: number
  status: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: any[]
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const colorSettings = useColorSettings()

  // Fetch data and generate notifications
  useEffect(() => {
    fetchDataAndGenerateNotifications()
  }, [])

  const fetchDataAndGenerateNotifications = async () => {
    setIsLoading(true)
    
    try {
      // Fetch products data
      const productsResponse = await fetch('/api/products')
      const productsData = await productsResponse.json()
      setProducts(productsData.products || [])

      // Fetch orders data
      const ordersResponse = await fetch('/api/orders')
      const ordersData = await ordersResponse.json()
      setOrders(ordersData.orders || [])

      // Generate notifications based on real data
      const generatedNotifications = generateNotifications(productsData.products || [], ordersData.orders || [])
      setNotifications(generatedNotifications)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to empty notifications
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateNotifications = (productsData: Product[], ordersData: Order[]): Notification[] => {
    const notifications: Notification[] = []

    // Generate stock alerts from products
    productsData.forEach(product => {
      if (product.stock === 0) {
        notifications.push({
          id: `out-of-stock-${product.id}`,
          type: 'out_of_stock',
          title: 'Out of Stock Alert',
          message: `${product.name} is completely out of stock`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          action: {
            label: 'Restock Now',
            onClick: () => handleViewInventory(product.id)
          },
          data: { productId: product.id, productName: product.name }
        })
      } else if (product.stock <= product.minStock) {
        notifications.push({
          id: `low-stock-${product.id}`,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${product.name} is running low (${product.stock} units remaining, minimum: ${product.minStock})`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium',
          action: {
            label: 'View Inventory',
            onClick: () => handleViewInventory(product.id)
          },
          data: { productId: product.id, productName: product.name, currentStock: product.stock, minStock: product.minStock }
        })
      }
    })

    // Generate order notifications
    ordersData.forEach(order => {
      // New orders (pending status)
      if (order.status === 'pending') {
        notifications.push({
          id: `new-order-${order.id}`,
          type: 'new_order',
          title: 'New Order Received',
          message: `Order #${order.orderNumber} from ${order.customerName} for R${order.total}`,
          timestamp: order.date,
          read: false,
          priority: 'high',
          action: {
            label: 'View Order',
            onClick: () => handleViewOrder(order.id)
          },
          data: { orderId: order.id, orderNumber: order.orderNumber, customerName: order.customerName, total: order.total }
        })
      }

      // Orders that need attention (processing for more than 2 hours)
      if (order.status === 'processing') {
        const orderTime = new Date(order.date)
        const now = new Date()
        const hoursDiff = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff > 2) {
          notifications.push({
            id: `processing-delay-${order.id}`,
            type: 'order_status_change',
            title: 'Order Processing Delay',
            message: `Order #${order.orderNumber} has been processing for ${Math.floor(hoursDiff)} hours`,
            timestamp: order.date,
            read: false,
            priority: 'medium',
            action: {
              label: 'Check Order',
              onClick: () => handleViewOrder(order.id)
            },
            data: { orderId: order.id, orderNumber: order.orderNumber, processingHours: Math.floor(hoursDiff) }
          })
        }
      }
    })

    // Sort notifications by priority and timestamp (newest first)
    return notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority]
      const bPriority = priorityOrder[b.priority]
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.type === filter
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order': return '📦'
      case 'low_stock': return '⚠️'
      case 'out_of_stock': return '🚨'
      case 'order_status_change': return '⏰'
      case 'system': return '⚙️'
      default: return '🔔'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_order': return 'bg-blue-100 text-blue-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'order_status_change': return 'bg-purple-100 text-purple-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const refreshNotifications = () => {
    fetchDataAndGenerateNotifications()
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // If there's an action, execute it
    if (notification.action?.onClick) {
      notification.action.onClick()
    }
  }

  const handleViewOrder = (orderId: string) => {
    // Mark notification as read
    markAsRead(`new-order-${orderId}`)
    markAsRead(`processing-delay-${orderId}`)
    
    // Navigate to orders page with highlight
    window.location.href = `/admin/orders?highlight=${orderId}`
  }

  const handleViewInventory = (productId: string) => {
    // Mark stock notifications as read
    markAsRead(`low-stock-${productId}`)
    markAsRead(`out-of-stock-${productId}`)
    
    // Navigate to products page
    window.location.href = '/admin/products-inventory'
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length
  const todayCount = notifications.filter(n => {
    const today = new Date().toDateString()
    const notificationDate = new Date(n.timestamp).toDateString()
    return today === notificationDate
  }).length

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: colorSettings.primary }}
            ></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Notifications</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Real-time alerts from your orders and inventory</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshNotifications}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highPriorityCount}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">{todayCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === 'all' ? { backgroundColor: colorSettings.primary } : {}}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread' 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === 'unread' ? { backgroundColor: colorSettings.primary } : {}}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('new_order')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'new_order' 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === 'new_order' ? { backgroundColor: colorSettings.primary } : {}}
            >
              New Orders ({notifications.filter(n => n.type === 'new_order').length})
            </button>
            <button
              onClick={() => setFilter('low_stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'low_stock' 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === 'low_stock' ? { backgroundColor: colorSettings.primary } : {}}
            >
              Stock Alerts ({notifications.filter(n => n.type === 'low_stock' || n.type === 'out_of_stock').length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-emerald-500' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{formatDateTime(notification.timestamp)}</span>
                    <div className="flex space-x-2">
                      {notification.action && (
                        <>
                          {notification.action.href ? (
                            <Link
                              href={notification.action.href}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {notification.action.label}
                            </Link>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                notification.action?.onClick?.()
                              }}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </>
                      )}
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissNotification(notification.id)
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'unread' 
                ? "No unread notifications at the moment." 
                : "No notifications found for the selected filter."}
            </p>
            <button
              onClick={() => setFilter('all')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              View All Notifications
            </button>
          </div>
        )}

        {/* Notification Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About These Notifications</h3>
          <p className="text-blue-800 text-sm mb-3">
            These notifications are generated in real-time based on your actual orders and inventory data:
          </p>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• <strong>New Orders:</strong> Automatically generated when customers place new orders</li>
            <li>• <strong>Stock Alerts:</strong> Triggered when product inventory falls below minimum levels</li>
            <li>• <strong>Out of Stock:</strong> Critical alerts when products are completely out of stock</li>
            <li>• <strong>Processing Delays:</strong> Alerts for orders that have been processing for extended periods</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}