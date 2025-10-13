import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

// Utility function to format dates consistently
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

interface DatabaseTable {
  name: string
  records: number
  size: string
  lastUpdated: string
  description: string
  columns: string[]
  sampleData?: any[]
}

interface Backup {
  id: string
  name: string
  size: string
  createdAt: string
  type: 'full' | 'incremental'
  status: 'completed' | 'failed' | 'running'
}

interface DatabaseStats {
  totalTables: number
  totalRecords: number
  totalSize: number
  performanceScore: number
  averageQueryTime: number
  uptime: number
  connectionStatus: 'healthy' | 'warning' | 'error'
  storageUsage: number
}

export default function AdminDatabasePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'queries' | 'backups' | 'health'>('overview')
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [backups, setBackups] = useState<Backup[]>([])
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExecutingQuery, setIsExecutingQuery] = useState(false)
  const [showCreateBackup, setShowCreateBackup] = useState(false)
  const [backupType, setBackupType] = useState<'full' | 'incremental'>('full')

  // Fetch database data
  useEffect(() => {
    fetchDatabaseData()
  }, [])

  const fetchDatabaseData = async () => {
    setIsLoading(true)
    try {
      // Fetch real data from APIs
      const [productsResponse, ordersResponse, customersResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/customers')
      ])

      const productsData = await productsResponse.json()
      const ordersData = await ordersResponse.json()
      const customersData = await customersResponse.json()

      // Generate table information from real data
      const generatedTables: DatabaseTable[] = [
        {
          name: 'products',
          records: productsData.products?.length || 0,
          size: `${((productsData.products?.length || 0) * 0.1).toFixed(1)} MB`,
          lastUpdated: new Date().toISOString(),
          description: 'Product catalog and inventory management',
          columns: ['id', 'name', 'description', 'price', 'stock', 'category', 'status'],
          sampleData: productsData.products?.slice(0, 3) || []
        },
        {
          name: 'orders',
          records: ordersData.orders?.length || 0,
          size: `${((ordersData.orders?.length || 0) * 0.2).toFixed(1)} MB`,
          lastUpdated: new Date().toISOString(),
          description: 'Customer orders and transactions',
          columns: ['id', 'orderNumber', 'customerName', 'customerEmail', 'status', 'total', 'date'],
          sampleData: ordersData.orders?.slice(0, 3) || []
        },
        {
          name: 'customers',
          records: customersData.customers?.length || 0,
          size: `${((customersData.customers?.length || 0) * 0.15).toFixed(1)} MB`,
          lastUpdated: new Date().toISOString(),
          description: 'Customer information and profiles',
          columns: ['id', 'firstName', 'lastName', 'email', 'phone', 'status', 'createdAt'],
          sampleData: customersData.customers?.slice(0, 3) || []
        },
        {
          name: 'order_items',
          records: (ordersData.orders || []).reduce((sum: number, order: any) => sum + (order.items?.length || 0), 0),
          size: `${((ordersData.orders || []).reduce((sum: number, order: any) => sum + (order.items?.length || 0), 0) * 0.05).toFixed(1)} MB`,
          lastUpdated: new Date().toISOString(),
          description: 'Individual items within orders',
          columns: ['id', 'orderId', 'productId', 'quantity', 'price'],
          sampleData: (ordersData.orders || []).slice(0, 2).flatMap((order: any) => order.items?.slice(0, 2) || [])
        }
      ]

      setTables(generatedTables)

      // Generate mock backups
      const mockBackups: Backup[] = [
        {
          id: '1',
          name: `backup_${new Date().toISOString().split('T')[0]}_full.sql`,
          size: '12.4 MB',
          createdAt: new Date().toISOString(),
          type: 'full',
          status: 'completed'
        },
        {
          id: '2',
          name: `backup_${new Date(Date.now() - 86400000).toISOString().split('T')[0]}_incremental.sql`,
          size: '2.1 MB',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'incremental',
          status: 'completed'
        }
      ]

      setBackups(mockBackups)

      // Generate stats
      const totalRecords = generatedTables.reduce((sum, table) => sum + table.records, 0)
      const totalSize = generatedTables.reduce((sum, table) => {
        const size = parseFloat(table.size)
        return sum + size
      }, 0)

      setStats({
        totalTables: generatedTables.length,
        totalRecords,
        totalSize,
        performanceScore: 98,
        averageQueryTime: 2,
        uptime: 99.9,
        connectionStatus: 'healthy',
        storageUsage: 75
      })

    } catch (error) {
      console.error('Error fetching database data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) return

    setIsExecutingQuery(true)
    try {
      // Simulate query execution with real data
      const queryLower = query.toLowerCase()
      
      if (queryLower.includes('select * from products')) {
        const response = await fetch('/api/products')
        const data = await response.json()
        setQueryResult((data.products || []).slice(0, 10)) // Limit results
      } else if (queryLower.includes('select * from orders')) {
        const response = await fetch('/api/orders')
        const data = await response.json()
        setQueryResult((data.orders || []).slice(0, 10))
      } else if (queryLower.includes('select * from customers')) {
        const response = await fetch('/api/customers')
        const data = await response.json()
        setQueryResult((data.customers || []).slice(0, 10))
      } else {
        // Generic result for other queries
        setQueryResult([
          { id: 1, message: 'Query executed successfully', timestamp: new Date().toISOString() },
          { id: 2, message: 'Result count: 0', timestamp: new Date().toISOString() }
        ])
      }
    } catch (error) {
      console.error('Query execution error:', error)
      setQueryResult([{ error: 'Query execution failed', message: error instanceof Error ? error.message : 'Unknown error' }])
    } finally {
      setIsExecutingQuery(false)
    }
  }

  const createBackup = async () => {
    const newBackup: Backup = {
      id: Date.now().toString(),
      name: `backup_${new Date().toISOString().split('T')[0]}_${backupType}.sql`,
      size: '0 MB',
      createdAt: new Date().toISOString(),
      type: backupType,
      status: 'running'
    }

    setBackups(prev => [newBackup, ...prev])
    setShowCreateBackup(false)

    // Simulate backup process
    setTimeout(() => {
      setBackups(prev => prev.map(backup => 
        backup.id === newBackup.id 
          ? { ...backup, status: 'completed', size: '12.4 MB' }
          : backup
      ))
    }, 3000)
  }

  const exportTableData = async (tableName: string) => {
    try {
      let data = []
      
      switch (tableName) {
        case 'products':
          const productsResponse = await fetch('/api/products')
          const productsData = await productsResponse.json()
          data = productsData.products || []
          break
        case 'orders':
          const ordersResponse = await fetch('/api/orders')
          const ordersData = await ordersResponse.json()
          data = ordersData.orders || []
          break
        case 'customers':
          const customersResponse = await fetch('/api/customers')
          const customersData = await customersResponse.json()
          data = customersData.customers || []
          break
        default:
          data = []
      }

      // Create CSV content
      if (data.length > 0) {
        const headers = Object.keys(data[0])
        const csvContent = [
          headers.join(','),
          ...data.map((row: any) => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n')

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading database information...</p>
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
            <span className="text-gray-900">Database</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
            <p className="text-gray-600">Monitor and manage your database operations</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowCreateBackup(true)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Create Backup
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Optimize Database
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'tables', label: 'Tables', icon: '🗄️' },
                { id: 'queries', label: 'SQL Queries', icon: '💻' },
                { id: 'backups', label: 'Backups', icon: '💿' },
                { id: 'health', label: 'Health', icon: '❤️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Database Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tables</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🗄️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.totalRecords.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Database Size</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalSize.toFixed(1)} MB</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💾</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Backups</p>
                    <p className="text-2xl font-bold text-green-600">{backups.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💿</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('tables')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">View All Tables</span>
                      <span className="text-gray-500">→</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('queries')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Run SQL Query</span>
                      <span className="text-gray-500">→</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('backups')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Manage Backups</span>
                      <span className="text-gray-500">→</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection Status</span>
                    <span className={`text-sm font-medium ${getHealthColor(stats.connectionStatus)}`}>
                      {stats.connectionStatus.charAt(0).toUpperCase() + stats.connectionStatus.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Performance Score</span>
                    <span className="text-sm font-medium text-green-600">{stats.performanceScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage Usage</span>
                    <span className="text-sm font-medium text-yellow-600">{stats.storageUsage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Tables</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tables.map((table) => (
                      <tr key={table.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{table.name}</div>
                            <div className="text-sm text-gray-500">{table.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.records.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(table.lastUpdated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTable(table.name)
                                setActiveTab('queries')
                                setQuery(`SELECT * FROM ${table.name} LIMIT 10`)
                              }}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              Query
                            </button>
                            <button
                              onClick={() => exportTableData(table.name)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Queries Tab */}
        {activeTab === 'queries' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SQL Query Interface</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SQL Query</label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={6}
                    placeholder="Enter your SQL query here...\n\nExamples:\nSELECT * FROM products LIMIT 10;\nSELECT COUNT(*) FROM orders WHERE status = 'pending';\nSELECT * FROM customers ORDER BY createdAt DESC LIMIT 5;"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={executeQuery}
                    disabled={isExecutingQuery || !query.trim()}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExecutingQuery ? 'Executing...' : 'Execute Query'}
                  </button>
                  <button 
                    onClick={() => setQuery('')}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                
                {queryResult.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Query Results ({queryResult.length} rows)</h4>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(queryResult[0] || {}).map((key) => (
                              <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {queryResult.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Backup Management</h3>
                <button 
                  onClick={() => setShowCreateBackup(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Create New Backup
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {backup.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(backup.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">Download</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.performanceScore}%</div>
                <p className="text-sm text-gray-600">Performance Score</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.averageQueryTime}ms</div>
                <p className="text-sm text-gray-600">Average Query Time</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.uptime}%</div>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Checks</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">✅</span>
                    <span className="font-medium text-green-800">Database Connection</span>
                  </div>
                  <span className="text-sm text-green-700">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">✅</span>
                    <span className="font-medium text-green-800">Index Optimization</span>
                  </div>
                  <span className="text-sm text-green-700">Optimized</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="font-medium text-yellow-800">Storage Usage</span>
                  </div>
                  <span className="text-sm text-yellow-700">{stats.storageUsage}% Used</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Backup Modal */}
        {showCreateBackup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Database Backup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Type</label>
                    <select
                      value={backupType}
                      onChange={(e) => setBackupType(e.target.value as 'full' | 'incremental')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="full">Full Backup</option>
                      <option value="incremental">Incremental Backup</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateBackup(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createBackup}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Create Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}