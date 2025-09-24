import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

interface DatabaseTable {
  name: string
  records: number
  size: string
  lastUpdated: string
  description: string
}

interface Backup {
  id: string
  name: string
  size: string
  createdAt: string
  type: 'full' | 'incremental'
  status: 'completed' | 'failed' | 'running'
}

export default function AdminDatabasePage() {
  const [tables] = useState<DatabaseTable[]>([
    {
      name: 'User',
      records: 89,
      size: '2.4 MB',
      lastUpdated: '2024-01-28 14:30:00',
      description: 'Customer and admin user accounts'
    },
    {
      name: 'Product',
      records: 24,
      size: '1.8 MB',
      lastUpdated: '2024-01-28 12:15:00',
      description: 'Product catalog and inventory'
    },
    {
      name: 'Order',
      records: 156,
      size: '3.2 MB',
      lastUpdated: '2024-01-28 14:30:00',
      description: 'Customer orders and transactions'
    },
    {
      name: 'OrderItem',
      records: 312,
      size: '2.1 MB',
      lastUpdated: '2024-01-28 14:30:00',
      description: 'Individual items within orders'
    },
    {
      name: 'Profile',
      records: 89,
      size: '1.2 MB',
      lastUpdated: '2024-01-28 10:45:00',
      description: 'User profile information'
    },
    {
      name: 'Review',
      records: 45,
      size: '0.8 MB',
      lastUpdated: '2024-01-27 16:20:00',
      description: 'Product reviews and ratings'
    }
  ])

  const [backups] = useState<Backup[]>([
    {
      id: '1',
      name: 'backup_2024_01_28_full.sql',
      size: '12.4 MB',
      createdAt: '2024-01-28 02:00:00',
      type: 'full',
      status: 'completed'
    },
    {
      id: '2',
      name: 'backup_2024_01_27_incremental.sql',
      size: '2.1 MB',
      createdAt: '2024-01-27 02:00:00',
      type: 'incremental',
      status: 'completed'
    },
    {
      id: '3',
      name: 'backup_2024_01_26_full.sql',
      size: '11.8 MB',
      createdAt: '2024-01-26 02:00:00',
      type: 'full',
      status: 'completed'
    }
  ])

  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<any[]>([])

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

  const executeQuery = () => {
    // Simulate query execution
    setQueryResult([
      { id: 1, name: 'Sample Result 1', value: 'Test Data' },
      { id: 2, name: 'Sample Result 2', value: 'Test Data' }
    ])
  }

  const totalRecords = tables.reduce((sum, table) => sum + table.records, 0)
  const totalSize = tables.reduce((sum, table) => {
    const size = parseFloat(table.size)
    return sum + size
  }, 0)

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
            <p className="text-gray-600">Monitor and manage your database</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Create Backup
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Optimize Database
            </button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
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
                <p className="text-2xl font-bold text-emerald-600">{totalRecords.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-purple-600">{totalSize.toFixed(1)} MB</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Database Tables */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Tables</h3>
            <div className="space-y-3">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTable === table.name
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTable(table.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{table.name}</h4>
                    <span className="text-sm text-gray-500">{table.records} records</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{table.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Size: {table.size}</span>
                    <span>Updated: {table.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Backups */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backups</h3>
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{backup.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{backup.size}</span>
                    <span>{backup.createdAt}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                      {backup.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SQL Query Interface */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SQL Query Interface</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SQL Query</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                placeholder="Enter your SQL query here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={executeQuery}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Execute Query
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Clear
              </button>
            </div>
            
            {queryResult.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Query Results</h4>
                <div className="overflow-x-auto">
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

        {/* Database Health */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <p className="text-sm text-gray-600">Performance Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2ms</div>
              <p className="text-sm text-gray-600">Average Query Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
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
              <span className="text-sm text-yellow-700">75% Used</span>
            </div>
          </div>
        </div>
    </AdminLayout>
  )
}
