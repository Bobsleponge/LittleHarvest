import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
  todayOrders: number
  todayRevenue: number
  conversionRate: number
  averageOrderValue: number
}

interface RecentOrder {
  id: string
  customerName: string
  customerEmail: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'customer' | 'product' | 'inventory'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'info'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
    conversionRate: 0,
    averageOrderValue: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalProducts: 24,
        totalOrders: 156,
        totalRevenue: 12450,
        totalCustomers: 89,
        pendingOrders: 8,
        lowStockProducts: 3,
        todayOrders: 12,
        todayRevenue: 890,
        conversionRate: 3.2,
        averageOrderValue: 79.8
      })
      
      setRecentOrders([
        {
          id: 'TT-2024-001',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@example.com',
          total: 132,
          status: 'processing',
          date: '2024-01-28T14:30:00Z',
          items: 3
        },
        {
          id: 'TT-2024-002',
          customerName: 'Mike Chen',
          customerEmail: 'mike@example.com',
          total: 89,
          status: 'pending',
          date: '2024-01-28T12:15:00Z',
          items: 2
        },
        {
          id: 'TT-2024-003',
          customerName: 'Emma Davis',
          customerEmail: 'emma@example.com',
          total: 156,
          status: 'shipped',
          date: '2024-01-28T10:45:00Z',
          items: 4
        },
        {
          id: 'TT-2024-004',
          customerName: 'David Wilson',
          customerEmail: 'david@example.com',
          total: 94,
          status: 'delivered',
          date: '2024-01-27T16:20:00Z',
          items: 2
        }
      ])
      
      setRecentActivity([
        {
          id: '1',
          type: 'order',
          message: 'New order #TT-2024-001 received from Sarah Johnson',
          timestamp: '2024-01-28T14:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          type: 'inventory',
          message: 'Sweet Potato Mash is running low (5 units remaining)',
          timestamp: '2024-01-28T12:15:00Z',
          status: 'warning'
        },
        {
          id: '3',
          type: 'customer',
          message: 'New customer registration: Emma Davis',
          timestamp: '2024-01-28T10:45:00Z',
          status: 'info'
        },
        {
          id: '4',
          type: 'product',
          message: 'Product "Organic Apple Puree" stock updated',
          timestamp: '2024-01-28T09:20:00Z',
          status: 'success'
        }
      ])
      
      setLoading(false)
    }, 1000)
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒'
      case 'customer': return '👥'
      case 'product': return '📦'
      case 'inventory': return '📋'
      default: return '📝'
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">R{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-sm text-green-600">+8.2% from last month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalCustomers}</p>
                <p className="text-sm text-green-600">+15.3% from last month</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-orange-600">R{stats.averageOrderValue}</p>
                <p className="text-sm text-green-600">+4.1% from last month</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
                <p className="text-sm text-gray-500">vs {stats.todayOrders - 2} yesterday</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">R{stats.todayRevenue}</p>
                <p className="text-sm text-gray-500">vs R{stats.todayRevenue - 120} yesterday</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-sm text-gray-500">Website visitors to customers</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-emerald-600 hover:text-emerald-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🛒</div>
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.items} items • R{order.total}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/admin/notifications" className="text-emerald-600 hover:text-emerald-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`text-lg ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/products" 
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="font-medium text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">Add, edit, or remove products</p>
              </div>
            </Link>

            <Link 
              href="/admin/orders" 
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">🛒</span>
              <div>
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-600">Process and track orders</p>
              </div>
            </Link>

            <Link 
              href="/admin/customers" 
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="font-medium text-gray-900">Manage Customers</p>
                <p className="text-sm text-gray-600">View customer information</p>
              </div>
            </Link>

            <Link 
              href="/admin/analytics" 
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View sales and performance</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Alerts and Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-600">⚠️</span>
                  <div>
                    <p className="font-medium text-gray-900">{stats.pendingOrders} Pending Orders</p>
                    <p className="text-sm text-gray-600">Require processing</p>
                  </div>
                </div>
                <Link href="/admin/orders" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                  Process →
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-red-600">📦</span>
                  <div>
                    <p className="font-medium text-gray-900">{stats.lowStockProducts} Low Stock Items</p>
                    <p className="text-sm text-gray-600">Need restocking</p>
                  </div>
                </div>
                <Link href="/admin/inventory" className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Restock →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Fulfillment Rate</span>
                <span className="text-sm font-semibold text-green-600">96%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="text-sm font-semibold text-blue-600">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Delivery Success Rate</span>
                <span className="text-sm font-semibold text-purple-600">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
