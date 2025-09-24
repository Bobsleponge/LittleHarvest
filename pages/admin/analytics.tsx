import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

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

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [analyticsData] = useState<AnalyticsData>({
    totalRevenue: 12450,
    totalOrders: 156,
    totalCustomers: 89,
    averageOrderValue: 79.8,
    conversionRate: 3.2,
    topProducts: [
      { name: 'Organic Apple Puree', sales: 45, revenue: 2025, image: '🍎' },
      { name: 'Sweet Potato Mash', sales: 38, revenue: 1596, image: '🍠' },
      { name: 'Banana & Oatmeal', sales: 32, revenue: 1536, image: '🍌' },
      { name: 'Chicken & Rice', sales: 28, revenue: 1456, image: '🍗' },
      { name: 'Carrot & Pea Mix', sales: 25, revenue: 1100, image: '🥕' }
    ],
    recentOrders: [
      { id: 'TT-2024-001', customer: 'Sarah Johnson', amount: 132, date: '2024-01-15', status: 'delivered' },
      { id: 'TT-2024-002', customer: 'Mike Chen', amount: 89, date: '2024-01-20', status: 'shipped' },
      { id: 'TT-2024-003', customer: 'Emma Davis', amount: 156, date: '2024-01-25', status: 'processing' },
      { id: 'TT-2024-004', customer: 'David Wilson', amount: 94, date: '2024-01-28', status: 'pending' }
    ],
    salesByMonth: [
      { month: 'Oct 2023', revenue: 8500, orders: 98 },
      { month: 'Nov 2023', revenue: 9200, orders: 112 },
      { month: 'Dec 2023', revenue: 11800, orders: 134 },
      { month: 'Jan 2024', revenue: 12450, orders: 156 }
    ]
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <span className="text-gray-900">Analytics</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your business performance and insights</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
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
                <p className="text-3xl font-bold text-emerald-600">R{analyticsData.totalRevenue.toLocaleString()}</p>
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
                <p className="text-3xl font-bold text-blue-600">{analyticsData.totalOrders}</p>
                <p className="text-sm text-green-600">+8.2% from last month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-purple-600">{analyticsData.totalCustomers}</p>
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
                <p className="text-3xl font-bold text-orange-600">R{analyticsData.averageOrderValue}</p>
                <p className="text-sm text-green-600">+4.1% from last month</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
            <div className="space-y-4">
              {analyticsData.salesByMonth.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">R{month.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{month.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-emerald-600">#{index + 1}</span>
                    <div className="text-2xl">{product.image}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} units sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">R{product.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-emerald-600 hover:text-emerald-700 font-medium">
              View All Orders
            </Link>
          </div>
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R{order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{analyticsData.conversionRate}%</div>
              <p className="text-sm text-gray-600">Website visitors to customers</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${analyticsData.conversionRate * 10}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Retention</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">78%</div>
              <p className="text-sm text-gray-600">Customers who return</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Success</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">96%</div>
              <p className="text-sm text-gray-600">On-time deliveries</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
