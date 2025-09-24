import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_access'
  user: string
  ip: string
  timestamp: string
  location: string
  status: 'success' | 'warning' | 'danger'
}

export default function AdminSecurityPage() {
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      user: 'admin@tinytastes.co.za',
      ip: '192.168.1.100',
      timestamp: '2024-01-28 14:30:00',
      location: 'Cape Town, South Africa',
      status: 'success'
    },
    {
      id: '2',
      type: 'failed_login',
      user: 'unknown@example.com',
      ip: '203.45.67.89',
      timestamp: '2024-01-28 13:45:00',
      location: 'Unknown',
      status: 'danger'
    },
    {
      id: '3',
      type: 'admin_access',
      user: 'admin@tinytastes.co.za',
      ip: '192.168.1.100',
      timestamp: '2024-01-28 12:15:00',
      location: 'Cape Town, South Africa',
      status: 'success'
    },
    {
      id: '4',
      type: 'password_change',
      user: 'manager@tinytastes.co.za',
      ip: '192.168.1.101',
      timestamp: '2024-01-27 16:20:00',
      location: 'Cape Town, South Africa',
      status: 'success'
    },
    {
      id: '5',
      type: 'logout',
      user: 'admin@tinytastes.co.za',
      ip: '192.168.1.100',
      timestamp: '2024-01-27 18:00:00',
      location: 'Cape Town, South Africa',
      status: 'success'
    }
  ])

  const [activeUsers] = useState([
    { user: 'admin@tinytastes.co.za', ip: '192.168.1.100', lastActivity: '2024-01-28 14:30:00', location: 'Cape Town, SA' },
    { user: 'manager@tinytastes.co.za', ip: '192.168.1.101', lastActivity: '2024-01-28 10:15:00', location: 'Cape Town, SA' }
  ])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔑'
      case 'logout': return '🚪'
      case 'failed_login': return '❌'
      case 'password_change': return '🔒'
      case 'admin_access': return '👑'
      default: return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'danger': return 'bg-red-100 text-red-800'
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
            <span className="text-gray-900">Security</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Center</h1>
            <p className="text-gray-600">Monitor security events and manage access</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Export Logs
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
              Block IP
            </button>
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">
                  {securityEvents.filter(e => e.type === 'failed_login').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-blue-600">{securityEvents.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threat Level</p>
                <p className="text-2xl font-bold text-green-600">Low</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Sessions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
            <div className="space-y-4">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.user}</p>
                    <p className="text-sm text-gray-600">{user.ip} • {user.location}</p>
                    <p className="text-xs text-gray-500">Last activity: {user.lastActivity}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="font-medium text-red-800">Failed Login Attempt</span>
                </div>
                <p className="text-sm text-red-700">
                  Multiple failed login attempts from IP 203.45.67.89
                </p>
                <p className="text-xs text-red-600 mt-1">2 hours ago</p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600">🔔</span>
                  <span className="font-medium text-yellow-800">Password Changed</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Password changed for manager@tinytastes.co.za
                </p>
                <p className="text-xs text-yellow-600 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Events Log */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Events Log</h3>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="all">All Events</option>
                <option value="login">Logins</option>
                <option value="failed_login">Failed Logins</option>
                <option value="admin_access">Admin Access</option>
              </select>
              <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securityEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getEventIcon(event.type)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Enable 2FA for all admin accounts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="font-medium text-gray-900">Strong Passwords</p>
                  <p className="text-sm text-gray-600">Enforce strong password policies</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600">⚠️</span>
                <div>
                  <p className="font-medium text-gray-900">IP Whitelisting</p>
                  <p className="text-sm text-gray-600">Consider restricting admin access to known IPs</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="font-medium text-gray-900">Session Timeout</p>
                  <p className="text-sm text-gray-600">Auto-logout after 30 minutes of inactivity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="font-medium text-gray-900">HTTPS Enabled</p>
                  <p className="text-sm text-gray-600">All admin traffic is encrypted</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600">⚠️</span>
                <div>
                  <p className="font-medium text-gray-900">Regular Backups</p>
                  <p className="text-sm text-gray-600">Ensure daily backups are running</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  )
}
