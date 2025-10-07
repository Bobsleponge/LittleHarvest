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

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  status: 'active' | 'inactive'
  address: string
  city: string
  notes?: string
  preferredDeliveryTime?: string
  allergies?: string[]
  children?: {
    name: string
    age: number
    allergies: string[]
  }[]
}

export default function AdminCustomersPage() {
  const { getDateFilter } = useAdminDate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
        const [showCustomerModal, setShowCustomerModal] = useState(false)
        const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
        const [isEditing, setIsEditing] = useState(false)
        const [editFormData, setEditFormData] = useState<Customer | null>(null)
        const [sortBy, setSortBy] = useState('name')
        const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch customer data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/customers')
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        
        const data = await response.json()
        
        // Transform API data to match our Customer interface
        const transformedCustomers: Customer[] = (data.customers || []).map((customer: any) => ({
          id: customer.id,
          name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer',
          email: customer.email || '',
          phone: customer.phone || '',
          joinDate: customer.createdAt || new Date().toISOString(),
          totalOrders: customer.totalOrders || 0,
          totalSpent: customer.totalSpent || 0,
          lastOrderDate: customer.lastOrderDate || customer.createdAt || new Date().toISOString(),
          status: customer.status === 'ACTIVE' ? 'active' : 'inactive',
          address: customer.address || '',
          city: customer.city || '',
          notes: customer.notes || '',
          preferredDeliveryTime: customer.preferredDeliveryTime || '',
          allergies: customer.allergies || [],
          children: customer.children || []
        }))
        
        setCustomers(transformedCustomers)
      } catch (error) {
        console.error('Error fetching customers:', error)
        // Set empty array on error
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers
    .filter(customer => {
      const matchesFilter = filter === 'all' || customer.status === filter
      const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) ||
                           customer.email.toLowerCase().includes(search.toLowerCase()) ||
                           customer.city.toLowerCase().includes(search.toLowerCase())
      
      // Apply date filtering based on join date
      const { startDate, endDate } = getDateFilter()
      let matchesDate = true
      if (startDate && endDate) {
        const joinDate = new Date(customer.joinDate)
        matchesDate = joinDate >= startDate && joinDate <= endDate
      }
      
      return matchesFilter && matchesSearch && matchesDate
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Customer]
      let bValue: any = b[sortBy as keyof Customer]
      
      if (sortBy === 'totalSpent' || sortBy === 'totalOrders') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortBy === 'joinDate' || sortBy === 'lastOrderDate') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id))
    }
  }

  const handleBulkStatusUpdate = (newStatus: 'active' | 'inactive') => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer =>
        selectedCustomers.includes(customer.id)
          ? { ...customer, status: newStatus }
          : customer
      )
    )
    setSelectedCustomers([])
    setShowBulkActions(false)
  }

        const handleViewCustomer = (customer: Customer) => {
          setSelectedCustomer(customer)
          setEditFormData(customer)
          setIsEditing(false)
          setShowCustomerModal(true)
        }

        const handleEditCustomer = (customer: Customer) => {
          setSelectedCustomer(customer)
          setEditFormData({ ...customer })
          setIsEditing(true)
          setShowCustomerModal(true)
        }

        const handleSaveCustomer = () => {
          if (editFormData) {
            handleUpdateCustomer(editFormData)
          }
        }

        const handleCancelEdit = () => {
          setIsEditing(false)
          setEditFormData(null)
          setSelectedCustomer(null)
          setShowCustomerModal(false)
        }

        const handleFormChange = (field: string, value: any) => {
          if (editFormData) {
            setEditFormData({
              ...editFormData,
              [field]: value
            })
          }
        }

        const handleUpdateCustomer = async (updatedCustomer: Customer) => {
          try {
            const response = await fetch(`/api/customers/${updatedCustomer.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedCustomer),
            })

            if (response.ok) {
              setCustomers(prevCustomers =>
                prevCustomers.map(customer =>
                  customer.id === updatedCustomer.id ? updatedCustomer : customer
                )
              )
              setShowCustomerModal(false)
              setSelectedCustomer(null)
            } else {
              console.error('Failed to update customer')
            }
          } catch (error) {
            console.error('Error updating customer:', error)
          }
        }

  const exportCustomers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Address', 'City', 'Status', 'Total Orders', 'Total Spent', 'Join Date', 'Last Order'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.status,
        customer.totalOrders,
        customer.totalSpent,
        customer.joinDate,
        customer.lastOrderDate
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageOrderValue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / 
                           customers.reduce((sum, customer) => sum + customer.totalOrders, 0)

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customers...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Customers</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
            <p className="text-gray-600">Manage your customer base and relationships</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportCustomers}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Bulk Actions ({selectedCustomers.length})
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Add Customer
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedCustomers.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedCustomers.length} customer(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('active')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('inactive')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Mark Inactive
                </button>
                <button
                  onClick={() => setSelectedCustomers([])}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search customers by name, email, or city..."
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
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="name">Sort by Name</option>
                <option value="totalSpent">Sort by Total Spent</option>
                <option value="totalOrders">Sort by Orders</option>
                <option value="joinDate">Sort by Join Date</option>
                <option value="lastOrderDate">Sort by Last Order</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                {customers.length > 0 && <p className="text-sm text-green-600">Live data from database</p>}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.status === 'active').length}
                </p>
                {customers.filter(c => c.status === 'active').length > 0 && <p className="text-sm text-green-600">Live data from database</p>}
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">R{totalRevenue.toLocaleString()}</p>
                {totalRevenue > 0 && <p className="text-sm text-green-600">Live data from database</p>}
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-600">R{Math.round(averageOrderValue)}</p>
                {averageOrderValue > 0 && <p className="text-sm text-green-600">Live data from database</p>}
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          Joined {formatDate(customer.joinDate)}
                        </div>
                        {customer.children && customer.children.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {customer.children.length} child{customer.children.length > 1 ? 'ren' : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{customer.address}</div>
                        <div className="text-sm text-gray-500">{customer.city}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.totalOrders}</div>
                        <div className="text-sm text-gray-500">
                          Last: {formatDate(customer.lastOrderDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R{customer.totalSpent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewCustomer(customer)}
                                className="text-emerald-600 hover:text-emerald-900 font-medium"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleEditCustomer(customer)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                Edit
                              </button>
                              <Link
                                href={`/admin/orders?customer=${customer.email}`}
                                className="text-purple-600 hover:text-purple-900 font-medium"
                              >
                                Orders
                              </Link>
                            </div>
                          </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
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

        {/* Customer Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {customers
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 3)
                .map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-emerald-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600">R{customer.totalSpent}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {customers
                .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())
                .slice(0, 3)
                .map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">
                        Last order: {formatDate(customer.lastOrderDate)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">R{customer.totalSpent}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

              {/* Customer Details Modal */}
              {showCustomerModal && selectedCustomer && editFormData && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                  <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {isEditing ? 'Edit Customer' : 'Customer Details'}
                        </h3>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-2xl">&times;</span>
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{editFormData.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{editFormData.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editFormData.phone}
                                onChange={(e) => handleFormChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{editFormData.phone}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            {isEditing ? (
                              <select
                                value={editFormData.status}
                                onChange={(e) => handleFormChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(editFormData.status)}`}>
                                {editFormData.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.address}
                                onChange={(e) => handleFormChange('address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{editFormData.address}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.city}
                                onChange={(e) => handleFormChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            ) : (
                              <p className="mt-1 text-sm text-gray-900">{editFormData.city}</p>
                            )}
                          </div>
                        </div>

                        {/* Order Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700">Total Orders</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{editFormData.totalOrders}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700">Total Spent</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">R{editFormData.totalSpent}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700">Last Order</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(editFormData.lastOrderDate)}</p>
                          </div>
                        </div>

                        {/* Preferences */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Time</label>
                            {isEditing ? (
                              <select
                                value={editFormData.preferredDeliveryTime || ''}
                                onChange={(e) => handleFormChange('preferredDeliveryTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="">Not specified</option>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                              </select>
                            ) : (
                              <p className="mt-1 text-sm text-gray-900 capitalize">{editFormData.preferredDeliveryTime || 'Not specified'}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(editFormData.joinDate)}</p>
                          </div>
                        </div>

                        {/* Allergies */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Allergies</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.allergies?.join(', ') || ''}
                              onChange={(e) => handleFormChange('allergies', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
                              placeholder="Enter allergies separated by commas"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{editFormData.allergies?.join(', ') || 'None'}</p>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          {isEditing ? (
                            <textarea
                              value={editFormData.notes || ''}
                              onChange={(e) => handleFormChange('notes', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Add notes about this customer..."
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{editFormData.notes || 'No notes'}</p>
                          )}
                        </div>

                        {/* Children Info */}
                        {editFormData.children && editFormData.children.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                            <div className="space-y-2">
                              {editFormData.children.map((child, index) => (
                                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{child.name}</p>
                                      <p className="text-sm text-gray-600">Age: {child.age} months</p>
                                    </div>
                                    {child.allergies && child.allergies.length > 0 && (
                                      <div className="text-right">
                                        <p className="text-xs text-red-600">Allergies:</p>
                                        <p className="text-xs text-red-600">{child.allergies.join(', ')}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            {isEditing ? 'Cancel' : 'Close'}
                          </button>
                          {!isEditing && (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                            >
                              Edit Customer
                            </button>
                          )}
                          {isEditing && (
                            <button
                              onClick={handleSaveCustomer}
                              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                            >
                              Save Changes
                            </button>
                          )}
                          <Link
                            href={`/admin/orders?customer=${editFormData.email}`}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            View Orders
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </>
              )}
      </div>
    </AdminLayout>
  )
}
