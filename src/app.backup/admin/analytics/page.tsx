'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { LoadingPage } from '@/components/ui/loading'

interface AnalyticsData {
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  orders: {
    total: number
    monthly: number
    growth: number
  }
  customers: {
    total: number
    monthly: number
    growth: number
  }
  products: {
    total: number
    active: number
    inactive: number
  }
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      // Mock analytics data for now
      const mockData: AnalyticsData = {
        revenue: {
          total: 45678.90,
          monthly: 12345.67,
          growth: 15.2
        },
        orders: {
          total: 234,
          monthly: 67,
          growth: 8.5
        },
        customers: {
          total: 156,
          monthly: 23,
          growth: 12.3
        },
        products: {
          total: 45,
          active: 42,
          inactive: 3
        },
        topProducts: [
          { id: '1', name: 'Chicken Pasta Primitive', sales: 45, revenue: 2345.67 },
          { id: '2', name: 'Beef Butternut Lentil', sales: 38, revenue: 1987.34 },
          { id: '3', name: 'Turkey Rice Broccoli', sales: 32, revenue: 1654.89 },
          { id: '4', name: 'Lamb Mash Potato Peas', sales: 28, revenue: 1456.78 },
          { id: '5', name: 'Fish Vegetable Medley', sales: 25, revenue: 1234.56 }
        ],
        recentActivity: [
          { id: '1', type: 'order', description: 'New order #12345 placed by John Doe', timestamp: new Date().toISOString() },
          { id: '2', type: 'customer', description: 'New customer registration: jane@example.com', timestamp: new Date(Date.now() - 300000).toISOString() },
          { id: '3', type: 'product', description: 'Product "Chicken Pasta Primitive" updated', timestamp: new Date(Date.now() - 600000).toISOString() },
          { id: '4', type: 'order', description: 'Order #12344 marked as delivered', timestamp: new Date(Date.now() - 900000).toISOString() },
          { id: '5', type: 'customer', description: 'Customer profile updated: mike@example.com', timestamp: new Date(Date.now() - 1200000).toISOString() }
        ]
      }
      
      setAnalytics(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'customer': return <Users className="h-4 w-4 text-green-500" />
      case 'product': return <Package className="h-4 w-4 text-purple-500" />
      default: return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your business performance and growth</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="gradient-card shadow-modern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{analytics.revenue.total.toFixed(2)}</div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(analytics.revenue.growth)}
                  <span className={getGrowthColor(analytics.revenue.growth)}>
                    {analytics.revenue.growth > 0 ? '+' : ''}{analytics.revenue.growth}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-modern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.orders.total}</div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(analytics.orders.growth)}
                  <span className={getGrowthColor(analytics.orders.growth)}>
                    {analytics.orders.growth > 0 ? '+' : ''}{analytics.orders.growth}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-modern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.customers.total}</div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(analytics.customers.growth)}
                  <span className={getGrowthColor(analytics.customers.growth)}>
                    {analytics.customers.growth > 0 ? '+' : ''}{analytics.customers.growth}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-modern">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.products.active}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.products.inactive} inactive
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Your best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R{product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest events and updates in your store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-card shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  R{analytics.revenue.monthly.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Current month performance
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {analytics.orders.monthly}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Orders this month
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {analytics.customers.monthly}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Registered this month
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
