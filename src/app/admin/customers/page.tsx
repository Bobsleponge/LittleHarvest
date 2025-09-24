'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  lastLoginAt?: string
  address?: {
    street: string
    city: string
    province: string
    postalCode: string
  }
  orders?: Array<{
    id: string
    totalZar: number
    status: string
    createdAt: string
  }>
  totalOrders?: number
  totalSpent?: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'customer': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer base and their information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Customers
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
          <CardDescription>Find customers by name, email, or phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="gradient-card shadow-modern card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription>{customer.email}</CardDescription>
                  </div>
                </div>
                <Badge className={getRoleColor(customer.role)}>
                  {customer.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {customer.email}
                </div>
                {customer.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <div>{customer.address.street}</div>
                      <div>{customer.address.city}, {customer.address.province}</div>
                      <div>{customer.address.postalCode}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ShoppingCart className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                  <p className="text-lg font-semibold">{customer.totalOrders || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-600">Spent</span>
                  </div>
                  <p className="text-lg font-semibold">R{customer.totalSpent?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-1 pt-2 border-t text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined: {new Date(customer.createdAt).toLocaleDateString()}
                </div>
                {customer.lastLoginAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last login: {new Date(customer.lastLoginAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/admin/customers/${customer.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card className="gradient-card shadow-modern">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Customers will appear here once they register.'
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.lastLoginAt && 
                    new Date(c.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => 
                    new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  R{customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
