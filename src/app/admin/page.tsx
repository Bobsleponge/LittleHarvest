'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'
import { DashboardStats } from '@/lib/types'
import { MetricsDashboard } from '@/components/admin/metrics-dashboard'

interface RecentOrder {
  id: string
  status: string
  totalZar: number
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface RecentProduct {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=5'),
        fetch('/api/admin/products?limit=5')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData.orders || [])
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setRecentProducts(productsData.products || [])
      }

      // Mock system alerts
      setSystemAlerts([
        {
          id: '1',
          type: 'warning',
          message: 'Low inventory on 3 products',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'info',
          message: 'New customer registration: john@example.com',
          timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: '3',
          type: 'error',
          message: 'Payment gateway connection timeout',
          timestamp: new Date(Date.now() - 600000).toISOString()
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-purple-100 text-purple-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card shadow-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/admin/products/new">
                <Package className="h-6 w-6 mb-2" />
                Add Product
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Manage Orders
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/admin/customers">
                <Users className="h-6 w-6 mb-2" />
                View Customers
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/admin/media">
                <Upload className="h-6 w-6 mb-2" />
                Upload Media
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            System Alerts
          </CardTitle>
          <CardDescription>Recent system notifications and issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Recent Products</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/orders">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">R{Number(order.totalZar).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Products Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Products</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/products">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.slug}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No products yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Recent orders and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">{order.user.name}</p>
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <p className="text-lg font-semibold mt-1">R{Number(order.totalZar).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-4">Orders will appear here once customers start placing them.</p>
                  <Button asChild>
                    <Link href="/admin/orders">View All Orders</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">Slug: {product.slug}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                  <p className="text-gray-500 mb-4">Start building your product catalog by adding your first product.</p>
                  <Button asChild>
                    <Link href="/admin/products/new">Add First Product</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}