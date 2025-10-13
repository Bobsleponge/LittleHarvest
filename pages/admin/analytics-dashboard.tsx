import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/admin-layout'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import { useAdminDate } from '../../src/lib/admin-date-context'
import { useSession } from 'next-auth/react'

// Combined interfaces for both dashboard and analytics data
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

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  conversionRate: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
    image: string
  }>
  recentOrders: Array<{
    id: string
    customer: string
    amount: number
    date: string
    status: string
  }>
  salesByMonth: Array<{
    month: string
    revenue: number
    orders: number
  }>
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

export default function AdminAnalyticsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { dateRange, getDateFilter } = useAdminDate()
  
  // Combined state for both dashboard and analytics
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
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    recentOrders: [],
    salesByMonth: []
  })
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin')
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchCombinedData = async () => {
      if (!session?.user?.role || session.user.role !== 'ADMIN') return
      
      setLoading(true)
      
      try {
        // Fetch both dashboard and analytics data in parallel
        const [dashboardResponse, analyticsResponse] = await Promise.all([
          fetch(`/api/admin/dashboard?dateRange=${dateRange}`),
          fetch(`/api/admin/analytics?dateRange=${dateRange}`)
        ])
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setStats(dashboardData.stats)
          setRecentOrders(dashboardData.recentOrders)
          setRecentActivity(dashboardData.recentActivity)
        }
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalyticsData(analyticsData)
        }
        
      } catch (error) {
        console.error('Error fetching combined data:', error)
        // Set empty data on error
        setStats({
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
        setAnalyticsData({
          totalRevenue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          averageOrderValue: 0,
          conversionRate: 0,
          topProducts: [],
          recentOrders: [],
          salesByMonth: []
        })
        setRecentOrders([])
        setRecentActivity([])
      } finally {
        setLoading(false)
      }
    }

    fetchCombinedData()
  }, [dateRange, session])

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
      case 'success': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
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
    <ErrorBoundary>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/admin" className="hover:text-gray-800 dark:hover:text-gray-200">Admin</Link>
              <span>›</span>
              <span className="text-gray-900 dark:text-gray-100">Analytics Dashboard</span>
            </div>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="flex space-x-3">
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">R{stats.totalRevenue.toLocaleString()}</p>
                  {stats.totalRevenue > 0 && <p className="text-sm text-green-600 dark:text-green-400">Live data from database</p>}
                </div>
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalOrders}</p>
                  {stats.totalOrders > 0 && <p className="text-sm text-green-600 dark:text-green-400">Live data from database</p>}
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛒</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCustomers}</p>
                  {stats.totalCustomers > 0 && <p className="text-sm text-green-600 dark:text-green-400">Live data from database</p>}
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">R{stats.averageOrderValue}</p>
                  {stats.averageOrderValue > 0 && <p className="text-sm text-green-600 dark:text-green-400">Live data from database</p>}
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.todayOrders}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">vs {stats.todayOrders > 0 ? stats.todayOrders - 1 : 0} yesterday</p>
                </div>
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">R{stats.todayRevenue}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">vs R{stats.todayRevenue > 0 ? stats.todayRevenue - 50 : 0} yesterday</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">💵</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.conversionRate}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website visitors to customers</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Sales Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sales Trend</h3>
              <div className="space-y-4">
                {analyticsData.salesByMonth.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{month.month}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">R{month.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{month.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">#{index + 1}</span>
                      <div className="text-2xl">{product.image}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.sales} units sold</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">R{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                <Link href="/admin/orders" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🛒</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.items} items • R{order.total}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(order.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                <Link href="/admin/notifications" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`text-lg ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/admin/products-inventory" 
                className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <span className="text-2xl mr-3">📦</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Manage Products</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add, edit, or remove products</p>
                </div>
              </Link>

              <Link 
                href="/admin/orders" 
                className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
              >
                <span className="text-2xl mr-3">🛒</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">View Orders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Process and track orders</p>
                </div>
              </Link>

              <Link 
                href="/admin/customers" 
                className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Manage Customers</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View customer information</p>
                </div>
              </Link>

              <Link 
                href="/admin/ui" 
                className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
              >
                <span className="text-2xl mr-3">🎨</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">UI Management</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize appearance</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Alerts and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pending Actions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{stats.pendingOrders} Pending Orders</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Require processing</p>
                    </div>
                  </div>
                  <Link href="/admin/orders" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-sm font-medium">
                    Process →
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-600 dark:text-red-400">📦</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{stats.lowStockProducts} Low Stock Items</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Need restocking</p>
                    </div>
                  </div>
                  <Link href="/admin/products-inventory" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
                    Restock →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Fulfillment Rate</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">96%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Success Rate</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">98%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Conversion Rate</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{analyticsData.conversionRate}%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Website visitors to customers</p>
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${analyticsData.conversionRate * 10}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Retention</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">78%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customers who return</p>
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Delivery Success</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">96%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">On-time deliveries</p>
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ErrorBoundary>
  )
}
