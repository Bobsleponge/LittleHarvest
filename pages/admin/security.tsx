import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Download, 
  Ban, 
  Users, 
  Clock, 
  MapPin, 
  Filter,
  Search,
  RefreshCw,
  Settings,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  X
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_access' | 'suspicious_activity' | 'data_export' | 'session_revoked' | 'ip_blocked' | 'ip_unblocked' | 'alert_resolved'
  user?: string
  userEmail?: string
  ip?: string
  ipAddress?: string
  timestamp?: string
  createdAt?: string
  location?: string
  status: 'success' | 'warning' | 'danger'
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: string
}

interface ActiveSession {
  id: string
  user: string
  ip: string
  lastActivity: string
  location: string
  userAgent: string
  isCurrent: boolean
}

interface SecurityAlert {
  id: string
  type: 'failed_login' | 'suspicious_ip' | 'data_breach' | 'unusual_activity'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp?: string
  createdAt?: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

interface BlockedIP {
  id: string
  ip?: string
  ipAddress?: string
  reason: string
  blockedAt?: string
  createdAt?: string
  blockedBy: string
}

export default function AdminSecurityPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [showBlockedIPs, setShowBlockedIPs] = useState(false)
  const [newIPToBlock, setNewIPToBlock] = useState('')
  const [blockReason, setBlockReason] = useState('')

  // Fetch data on component mount
  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true)
      
      const [eventsResponse, sessionsResponse, alertsResponse, blockedIPsResponse] = await Promise.all([
        fetch('/api/admin/security/events'),
        fetch('/api/admin/security/sessions'),
        fetch('/api/admin/security/alerts'),
        fetch('/api/admin/security/blocked-ips')
      ])

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setSecurityEvents(eventsData.events || [])
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setActiveSessions(sessionsData.sessions || [])
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setSecurityAlerts(alertsData.alerts || [])
      }

      if (blockedIPsResponse.ok) {
        const blockedIPsData = await blockedIPsResponse.json()
        setBlockedIPs(blockedIPsData.blockedIPs || [])
      }

    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Helper functions
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <Lock className="h-4 w-4 text-green-600" />
      case 'logout': return <Unlock className="h-4 w-4 text-gray-600" />
      case 'failed_login': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'password_change': return <Settings className="h-4 w-4 text-blue-600" />
      case 'admin_access': return <Shield className="h-4 w-4 text-purple-600" />
      case 'suspicious_activity': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'data_export': return <Download className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'danger': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // Filter functions
  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      (event.userEmail || event.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.ipAddress || event.ip || '').includes(searchTerm) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || event.type === filterType
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity
    
    return matchesSearch && matchesType && matchesSeverity
  })

  const unresolvedAlerts = securityAlerts.filter(alert => !alert.resolved)
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === 'critical')

  // Action handlers
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/admin/security/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        setActiveSessions(sessions => sessions.filter(s => s.id !== sessionId))
        // Refresh data to get updated events
        fetchSecurityData()
      }
    } catch (error) {
      console.error('Error revoking session:', error)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/security/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, resolved: true })
      })

      if (response.ok) {
        setSecurityAlerts(alerts => 
          alerts.map(alert => 
            alert.id === alertId ? { ...alert, resolved: true } : alert
          )
        )
        // Refresh data to get updated events
        fetchSecurityData()
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const handleBlockIP = async () => {
    if (newIPToBlock && blockReason) {
      try {
        const response = await fetch('/api/admin/security/blocked-ips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ipAddress: newIPToBlock, 
            reason: blockReason 
          })
        })

        if (response.ok) {
          setNewIPToBlock('')
          setBlockReason('')
          setShowBlockedIPs(false)
          // Refresh data to get updated blocked IPs and events
          fetchSecurityData()
        }
      } catch (error) {
        console.error('Error blocking IP:', error)
      }
    }
  }

  const handleUnblockIP = async (ipId: string) => {
    try {
      const response = await fetch('/api/admin/security/blocked-ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipId })
      })

      if (response.ok) {
        setBlockedIPs(prev => prev.filter(ip => ip.id !== ipId))
        // Refresh data to get updated events
        fetchSecurityData()
      }
    } catch (error) {
      console.error('Error unblocking IP:', error)
    }
  }

  const handleExportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Type,User,IP,Location,Timestamp,Status,Severity,Details\n" +
      securityEvents.map(event => 
        `${event.id},${event.type},${event.user},${event.ip},${event.location},${event.timestamp},${event.status},${event.severity},${event.details || ''}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `security_logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <p className="text-gray-600">Monitor security events and manage access controls</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/security-incidents"
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Incident Management</span>
            </Link>
            <button 
              onClick={fetchSecurityData}
              disabled={refreshing}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleExportLogs}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Logs</span>
            </button>
            <button 
              onClick={() => setShowBlockedIPs(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Ban className="h-4 w-4" />
              <span>Block IP</span>
            </button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Critical Security Alerts</h3>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">{alert.title}</p>
                    <p className="text-sm text-red-700">{alert.description}</p>
                  </div>
                  <button 
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{activeSessions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Currently online</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">
                  {securityEvents.filter(e => e.type === 'failed_login').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-blue-600">{securityEvents.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total events</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threat Level</p>
                <p className={`text-2xl font-bold ${criticalAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalAlerts.length > 0 ? 'High' : 'Low'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Current status</p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${criticalAlerts.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                {criticalAlerts.length > 0 ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Sessions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <span className="text-sm text-gray-500">{activeSessions.length} sessions</span>
            </div>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">{session.user}</p>
                      {session.isCurrent && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{session.ip}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{session.lastActivity}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{session.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                    </button>
                    {!session.isCurrent && (
                      <button 
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <X className="h-4 w-4" />
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
              <span className="text-sm text-gray-500">{unresolvedAlerts.length} unresolved</span>
            </div>
            <div className="space-y-4">
              {unresolvedAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <span className={`font-medium ${
                        alert.severity === 'critical' ? 'text-red-800' :
                        alert.severity === 'high' ? 'text-orange-800' :
                        alert.severity === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {alert.title}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                </div>
                  <p className={`text-sm mb-2 ${
                    alert.severity === 'critical' ? 'text-red-700' :
                    alert.severity === 'high' ? 'text-orange-700' :
                    alert.severity === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-orange-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {alert.timestamp || alert.createdAt}
                    </p>
                    <button 
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Resolve
                    </button>
              </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Events Log */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Events Log</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Events</option>
                <option value="login">Logins</option>
                <option value="failed_login">Failed Logins</option>
                <option value="admin_access">Admin Access</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="data_export">Data Export</option>
              </select>
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-2 text-gray-600">Loading security events...</span>
            </div>
          ) : (
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
                      Severity
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No security events found
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                            {getEventIcon(event.type)}
                            <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.userEmail || event.user || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.ipAddress || event.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.timestamp || new Date(event.createdAt || Date.now()).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Blocked IPs Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Blocked IP Addresses</h3>
            <button 
              onClick={() => setShowBlockedIPs(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Ban className="h-4 w-4" />
              <span>Block New IP</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blockedIPs.map((blockedIP) => (
                  <tr key={blockedIP.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {blockedIP.ipAddress || blockedIP.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blockedIP.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blockedIP.blockedAt || blockedIP.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blockedIP.blockedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleUnblockIP(blockedIP.id)}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Enable 2FA for all admin accounts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Strong Passwords</p>
                  <p className="text-sm text-gray-600">Enforce strong password policies</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">IP Whitelisting</p>
                  <p className="text-sm text-gray-600">Consider restricting admin access to known IPs</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Session Timeout</p>
                  <p className="text-sm text-gray-600">Auto-logout after 30 minutes of inactivity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">HTTPS Enabled</p>
                  <p className="text-sm text-gray-600">All admin traffic is encrypted</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Regular Backups</p>
                  <p className="text-sm text-gray-600">Ensure daily backups are running</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block IP Modal */}
        {showBlockedIPs && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Block IP Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={newIPToBlock}
                    onChange={(e) => setNewIPToBlock(e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Suspicious activity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => {
                    setShowBlockedIPs(false)
                    setNewIPToBlock('')
                    setBlockReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBlockIP}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Block IP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
