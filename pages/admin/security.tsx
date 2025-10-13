import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/admin-layout'
import ErrorBoundary from '../../src/components/ErrorBoundary'
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
  X,
  Monitor,
  Cpu,
  HardDrive,
  Zap
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_access' | 'suspicious_activity' | 'data_export' | 'session_revoked' | 'ip_blocked' | 'ip_unblocked' | 'alert_resolved' | 'unauthorized_access' | 'system_error' | 'performance_issue' | 'engine_activity' | 'threat_detected'
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
  source?: string
  category?: string
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

// Engine Monitor Interfaces
interface EngineStatus {
  status: string
  initialized: boolean
  lastActivity: string
  incidentsLast24h: number
  threatIntelligenceEntries: number
  activePlaybooks: number
  version: string
  uptime: number
  canBeControlled?: boolean
  lastAction?: {
    action: 'start' | 'stop' | 'restart'
    timestamp: string
    userId: string
    userEmail: string
    reason?: string
  }
}

interface SystemMetrics {
  performance: {
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    cacheHitRate: number
  }
  security: {
    eventsLastHour: number
    blockedIPsLast24h: number
    activeIncidents: number
    resolvedIncidents: number
  }
  health: {
    status: string
    metrics: {
      averageResponseTime: number
      errorRate: number
      cacheHitRate: number
    }
    alerts: string[]
  }
}

interface RecentActivity {
  events: Array<{
    id: string
    type: string
    severity: string
    ipAddress: string
    userEmail: string
    details: string
    createdAt: string
    incidentId?: string
    incidentTitle?: string
    incidentStatus?: string
  }>
  incidents: Array<{
    incidentId: string
    title: string
    type: string
    severity: string
    status: string
    riskScore: number
    createdAt: string
  }>
  blockedIPs: Array<{
    ipAddress: string
    reason: string
    blockedBy: string
    createdAt: string
  }>
}

interface PendingAction {
  id: string
  type: string
  description: string
  priority: string
  timestamp: string
  requiresApproval: boolean
  details?: Record<string, any>
  decision?: {
    approved: boolean
    reason: string
    confidence: number
    requiresHumanApproval: boolean
    actionTaken: string
  }
  status?: 'auto_approved' | 'pending_approval'
}

interface ResourceUsage {
  memory: {
    used: number
    total: number
    external: number
    rss: number
  }
  cpu: {
    user: number
    system: number
  }
  process: {
    pid: number
    uptime: number
    platform: string
    nodeVersion: string
  }
  database: {
    connectionCount: number
    queryCount: number
  }
}

interface DashboardData {
  engineStatus: EngineStatus
  systemMetrics: SystemMetrics
  recentActivity: RecentActivity
  pendingActions: {
    pendingApprovals: PendingAction[]
    totalPending: number
  }
  resourceUsage: ResourceUsage
  timestamp: string
}

export default function AdminSecurityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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

  // Engine Monitor State
  const [activeTab, setActiveTab] = useState<'overview' | 'engine-monitor'>('overview')
  const [engineData, setEngineData] = useState<DashboardData | null>(null)
  const [engineLoading, setEngineLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAction, setSelectedAction] = useState<PendingAction | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [approving, setApproving] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      router.push('/admin')
    }
  }, [session, status, router])

  // Fetch data on component mount
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || session.user.role !== 'ADMIN') return
    
    fetchSecurityData()
    if (activeTab === 'engine-monitor') {
      fetchEngineData(true) // Initial load, show loading spinner
    }
  }, [activeTab, status, session])

  // Auto-refresh engine data
  useEffect(() => {
    if (activeTab === 'engine-monitor' && autoRefresh) {
      const interval = setInterval(() => fetchEngineData(false), 5000)
      return () => clearInterval(interval)
    }
  }, [activeTab, autoRefresh])

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true)
      
      const [eventsResponse, sessionsResponse, alertsResponse, blockedIPsResponse, comprehensiveEventsResponse, engineResponse] = await Promise.all([
        fetch('/api/admin/security/events'),
        fetch('/api/admin/security/sessions'),
        fetch('/api/admin/security/alerts'),
        fetch('/api/admin/security/blocked-ips'),
        fetch('/api/admin/security/comprehensive-events'),
        fetch('/api/admin/security/engine-status', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
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

      if (comprehensiveEventsResponse.ok) {
        const comprehensiveData = await comprehensiveEventsResponse.json()
        // Merge comprehensive events with existing security events
        const allEvents = [...(comprehensiveData.events || []), ...securityEvents]
        // Remove duplicates and sort by timestamp
        const uniqueEvents = allEvents.filter((event, index, self) => 
          index === self.findIndex(e => e.id === event.id)
        ).sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime())
        setSecurityEvents(uniqueEvents)
      }

      if (engineResponse.ok) {
        const engineData = await engineResponse.json()
        setEngineData(engineData)
      }

    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch engine monitor data
  const fetchEngineData = async (isInitialLoad = false) => {
    try {
      // Only show loading spinner on initial load, not during auto-refresh
      if (isInitialLoad) {
        setEngineLoading(true)
      } else {
        setIsRefreshing(true)
      }
      
      const response = await fetch('/api/admin/security/engine-status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch engine status`)
      }
      const result = await response.json()
      setEngineData(result)
    } catch (error) {
      console.error('Error fetching engine data:', error)
      setEngineData(null) // Set to null to show error state
    } finally {
      if (isInitialLoad) {
        setEngineLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  // Handle action approval
  const handleActionApproval = async (approved: boolean) => {
    if (!selectedAction) return

    setApproving(true)
    try {
      const response = await fetch('/api/admin/security/approve-action', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionId: selectedAction.id,
          action: selectedAction.type,
          approved,
          reason: approvalReason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process approval')
      }

      // Refresh data
      await fetchEngineData()
      setSelectedAction(null)
      setApprovalReason('')
    } catch (error) {
      console.error('Error processing approval:', error)
    } finally {
      setApproving(false)
    }
  }

  // Engine control functions
  const handleEngineControl = async (action: 'start' | 'stop' | 'restart', reason?: string) => {
    try {
      const response = await fetch('/api/admin/security/engine-control', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        const result = await response.json()
        // Refresh engine data to get updated status
        fetchEngineData()
        // Show success message
        alert(`Security engine ${action} successful: ${result.message}`)
      } else {
        const error = await response.json()
        alert(`Failed to ${action} security engine: ${error.error}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing engine:`, error)
      alert(`Failed to ${action} security engine`)
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

  // Engine Monitor Helper Functions
  const getEngineStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy': return 'text-red-600 bg-red-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Security Center...</p>
        </div>
      </div>
    )
  }

  // Redirect if not admin
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return null
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
            <span className="text-gray-900 dark:text-gray-100">Security</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Security Center</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor security events and manage access controls</p>
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
                onClick={() => activeTab === 'overview' ? fetchSecurityData() : fetchEngineData(false)}
                disabled={refreshing || engineLoading}
                aria-label={refreshing || engineLoading ? "Refreshing data..." : "Refresh security data"}
                className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${(refreshing || engineLoading) ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {activeTab === 'overview' && (
                <>
                  <button 
                    onClick={handleExportLogs}
                    aria-label="Export security logs to CSV file"
                    className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Logs</span>
                  </button>
                  <button 
                    onClick={() => setShowBlockedIPs(true)}
                    aria-label="Open IP blocking form"
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    <Ban className="h-4 w-4" />
                    <span>Block IP</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                aria-pressed={activeTab === 'overview'}
                aria-label="Switch to Security Overview tab"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('engine-monitor')}
                aria-pressed={activeTab === 'engine-monitor'}
                aria-label="Switch to Engine Monitor tab"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'engine-monitor'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Engine Monitor</span>
                  {engineData?.pendingActions?.totalPending && engineData.pendingActions.totalPending > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {engineData.pendingActions.totalPending}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{activeSessions.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently online</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">
                  {securityEvents.filter(e => e.type === 'failed_login' || e.category === 'auth_error').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 24 hours</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Events</p>
                <p className="text-2xl font-bold text-blue-600">{securityEvents.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total events</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threat Level</p>
                <p className={`text-2xl font-bold ${criticalAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalAlerts.length > 0 ? 'High' : 'Low'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current status</p>
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

        {/* Engine Monitor Integration - Quick Stats */}
        {engineData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engine Status</p>
                  <p className={`text-2xl font-bold ${engineData.engineStatus?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {engineData.engineStatus?.status || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Security Engine</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${engineData.engineStatus?.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Monitor className={`h-6 w-6 ${engineData.engineStatus?.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Incidents (24h)</p>
                  <p className="text-2xl font-bold text-orange-600">{engineData.engineStatus?.incidentsLast24h || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Security incidents</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                  <p className="text-2xl font-bold text-yellow-600">{engineData.pendingActions?.totalPending || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className={`text-2xl font-bold ${(engineData.systemMetrics?.performance?.errorRate || 0) < 0.05 ? 'text-green-600' : 'text-red-600'}`}>
                    {(engineData.systemMetrics?.performance?.errorRate || 0) < 0.05 ? 'Good' : 'Issues'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Performance</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${(engineData.systemMetrics?.performance?.errorRate || 0) < 0.05 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Activity className={`h-6 w-6 ${(engineData.systemMetrics?.performance?.errorRate || 0) < 0.05 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

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
                <option value="unauthorized_access">Unauthorized Access</option>
                <option value="admin_access">Admin Access</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="data_export">Data Export</option>
                <option value="system_error">System Errors</option>
                <option value="performance_issue">Performance Issues</option>
                <option value="engine_activity">Engine Activity</option>
                <option value="threat_detected">Threat Detection</option>
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
                    Source
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.source === 'api_access' ? 'bg-blue-100 text-blue-800' :
                        event.source === 'authentication' ? 'bg-red-100 text-red-800' :
                        event.source === 'system' ? 'bg-gray-100 text-gray-800' :
                        event.source === 'engine_monitor' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.source || 'unknown'}
                      </span>
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
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {event.details || 'No details'}
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
          </>
        )}

        {/* Engine Monitor Tab Content */}
        {activeTab === 'engine-monitor' && (
          <>
            {engineLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading engine data...</span>
              </div>
            ) : engineData ? (
              <>
                {/* Engine Status Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Engine Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getEngineStatusColor(engineData.engineStatus.status)}`}>
                          {engineData.engineStatus.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span className="text-gray-900">{engineData.engineStatus.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="text-gray-900">{Math.floor(engineData.engineStatus.uptime / 3600)}h {Math.floor((engineData.engineStatus.uptime % 3600) / 60)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Threat Intel:</span>
                        <span className="text-gray-900">{engineData.engineStatus.threatIntelligenceEntries} entries</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Playbooks:</span>
                        <span className="text-gray-900">{engineData.engineStatus.activePlaybooks} active</span>
                      </div>
                      {engineData.engineStatus.lastAction && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-600 mb-2">Last Action:</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Action:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                engineData.engineStatus.lastAction.action === 'stop' ? 'bg-red-100 text-red-800' :
                                engineData.engineStatus.lastAction.action === 'start' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {engineData.engineStatus.lastAction.action.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">By:</span>
                              <span className="text-gray-900 text-xs">{engineData.engineStatus.lastAction.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time:</span>
                              <span className="text-gray-900 text-xs">
                                {new Date(engineData.engineStatus.lastAction.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {engineData.engineStatus.lastAction.reason && (
                              <div className="mt-2">
                                <span className="text-gray-600 text-xs">Reason:</span>
                                <div className="text-gray-900 text-xs mt-1 p-2 bg-gray-50 rounded">
                                  {engineData.engineStatus.lastAction.reason}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Engine Control Buttons */}
                    {engineData.engineStatus.canBeControlled && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Engine Control</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEngineControl('stop', 'Manual stop by admin')}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span>Stop</span>
                          </button>
                          <button
                            onClick={() => handleEngineControl('restart', 'Manual restart by admin')}
                            className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>Restart</span>
                          </button>
                          <button
                            onClick={() => handleEngineControl('start', 'Manual start by admin')}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Start</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Autonomous Scope Information */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">AI Autonomous Scope</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-green-700 mb-2">✓ Auto-Approved Actions</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• IP blocking & threat response</div>
                            <div>• User suspension & access control</div>
                            <div>• Security rule updates</div>
                            <div>• Intrusion prevention</div>
                            <div>• DDoS mitigation</div>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-yellow-700 mb-2">⚠ Requires Approval</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• System configuration changes</div>
                            <div>• Database migrations</div>
                            <div>• Service restarts</div>
                            <div>• Application deployments</div>
                            <div>• Network configuration</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <strong>Security Priority:</strong> The AI will automatically protect the system from threats while keeping system changes under your control.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Response:</span>
                        <span className="text-gray-900">{engineData.systemMetrics.performance.averageResponseTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">P95 Response:</span>
                        <span className="text-gray-900">{engineData.systemMetrics.performance.p95ResponseTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Error Rate:</span>
                        <span className="text-gray-900">{engineData.systemMetrics.performance.errorRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cache Hit:</span>
                        <span className="text-gray-900">{engineData.systemMetrics.performance.cacheHitRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health:</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getEngineStatusColor(engineData.systemMetrics.health.status)}`}>
                          {engineData.systemMetrics.health.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Events (1h):</span>
                        <span className="text-gray-900">{engineData.systemMetrics.security.eventsLastHour}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blocked IPs (24h):</span>
                        <span className="text-gray-900">{engineData.systemMetrics.security.blockedIPsLast24h}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Incidents:</span>
                        <span className="text-gray-900">{engineData.systemMetrics.security.activeIncidents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolved:</span>
                        <span className="text-gray-900">{engineData.systemMetrics.security.resolvedIncidents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Incidents (24h):</span>
                        <span className="text-gray-900">{engineData.engineStatus.incidentsLast24h}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource Usage */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Resource Usage</h3>
                    <div className="flex items-center space-x-4">
                      {isRefreshing && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Refreshing...</span>
                        </div>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="mr-2"
                        />
                        Auto-refresh (5s)
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Memory Usage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Used:</span>
                          <span>{engineData.resourceUsage.memory.used} MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span>{engineData.resourceUsage.memory.total} MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>External:</span>
                          <span>{engineData.resourceUsage.memory.external} MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>RSS:</span>
                          <span>{engineData.resourceUsage.memory.rss} MB</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Process Info</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>PID:</span>
                          <span>{engineData.resourceUsage.process.pid}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Platform:</span>
                          <span>{engineData.resourceUsage.process.platform}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Node:</span>
                          <span>{engineData.resourceUsage.process.nodeVersion}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Uptime:</span>
                          <span>{Math.floor(engineData.resourceUsage.process.uptime / 3600)}h</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Database</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Connections:</span>
                          <span>{engineData.resourceUsage.database.connectionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tables:</span>
                          <span>{engineData.resourceUsage.database.queryCount}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Health Alerts</h4>
                      <div className="space-y-1">
                        {engineData.systemMetrics.health.alerts.length > 0 ? (
                          engineData.systemMetrics.health.alerts.map((alert, index) => (
                            <div key={index} className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                              {alert}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-green-600">No alerts</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Actions Display */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Security Actions ({engineData.pendingActions.pendingApprovals.length})
                  </h3>
                  <div className="space-y-4">
                    {engineData.pendingActions.pendingApprovals.map((action, index) => (
                      <div key={action.id} className={`border rounded-lg p-4 ${
                        action.status === 'auto_approved' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{action.description}</h4>
                            <p className="text-sm text-gray-600">Type: {action.type.replace('_', ' ')}</p>
                            {action.decision && (
                              <div className="mt-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  action.status === 'auto_approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {action.status === 'auto_approved' ? 'AUTO-APPROVED' : 'REQUIRES APPROVAL'}
                                </span>
                                <span className="ml-2 text-xs text-gray-600">
                                  Confidence: {(action.decision.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              action.priority === 'high' ? 'bg-red-100 text-red-800' :
                              action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {action.priority.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(action.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Smart Decision Information */}
                        {action.decision && (
                          <div className="mb-3 p-3 bg-gray-50 rounded">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">AI Decision:</h5>
                            <div className="text-sm text-gray-600">
                              <div className="mb-1">
                                <span className="font-medium">Reason:</span> {action.decision.reason}
                              </div>
                              <div className="mb-1">
                                <span className="font-medium">Action Taken:</span> {action.decision.actionTaken}
                              </div>
                              <div>
                                <span className="font-medium">Confidence:</span> {(action.decision.confidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        )}
                          
                          {/* Action Details */}
                          {action.details && (
                            <div className="mb-3 p-3 bg-gray-50 rounded">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Details:</h5>
                              <div className="text-sm text-gray-600">
                                {Object.entries(action.details).map(([key, value]) => (
                                  <div key={key} className="flex justify-between mb-1">
                                    <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                    <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Approval/Denial Buttons - Only show for actions requiring approval */}
                          {action.status === 'pending_approval' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedAction({
                                    id: action.id,
                                    type: action.type,
                                    description: action.description,
                                    priority: action.priority,
                                    timestamp: action.timestamp,
                                    requiresApproval: action.requiresApproval,
                                    details: action.details,
                                    decision: action.decision,
                                    status: action.status
                                  })
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAction({
                                    id: action.id,
                                    type: action.type,
                                    description: action.description,
                                    priority: action.priority,
                                    timestamp: action.timestamp,
                                    requiresApproval: action.requiresApproval,
                                    details: action.details,
                                    decision: action.decision,
                                    status: action.status
                                  })
                                  // Set a flag to indicate this is a denial
                                  setApprovalReason('DENY')
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                ✗ Deny
                              </button>
                            </div>
                          )}
                          
                          {/* Auto-approved indicator */}
                          {action.status === 'auto_approved' && (
                            <div className="flex items-center space-x-2 text-green-700">
                              <span className="text-sm font-medium">✓ Automatically approved by AI</span>
                              <span className="text-xs text-gray-500">
                                Confidence: {(action.decision?.confidence || 0) * 100}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {engineData?.recentActivity?.events?.length > 0 ? (
                        engineData.recentActivity.events.map((event, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{event.type.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-600">{event.details}</p>
                                <p className="text-xs text-gray-500">
                                  {event.ipAddress} • {event.userEmail || 'Anonymous'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                  {event.severity}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(event.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {event.incidentId && (
                              <p className="text-xs text-blue-600 mt-1">
                                → Incident: {event.incidentId} ({event.incidentStatus})
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent events</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {engineData?.recentActivity?.incidents?.length > 0 ? (
                        engineData.recentActivity.incidents.map((incident, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{incident.title}</h4>
                                <p className="text-sm text-gray-600">{incident.incidentId}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                  {incident.severity}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getEngineStatusColor(incident.status)}`}>
                                  {incident.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Risk: {incident.riskScore}/100</span>
                              <span className="text-xs text-gray-500">
                                {new Date(incident.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent incidents</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Blocked IPs */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Blocked IPs</h3>
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
                            Blocked By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {engineData?.recentActivity?.blockedIPs?.length > 0 ? (
                          engineData.recentActivity.blockedIPs.map((blocked, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {blocked.ipAddress}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {blocked.reason}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {blocked.blockedBy}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(blocked.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                              No blocked IPs
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="mt-6 text-center text-sm text-gray-500">
                  Last updated: {new Date(engineData.timestamp).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Engine Data</h2>
                <p className="text-gray-600 mb-4">Unable to fetch engine status</p>
                <button
                  onClick={() => fetchEngineData(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}
          </>
        )}

        {/* Action Approval Modal */}
        {selectedAction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Security Action</h3>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{selectedAction.description}</h4>
                  <p className="text-sm text-gray-600 mb-2">Type: {selectedAction.type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600 mb-2">Priority: {selectedAction.priority}</p>
                  
                  {selectedAction.details && (
                    <div className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600 mb-2">Action Details:</p>
                      <div className="text-sm text-gray-700">
                        {Object.entries(selectedAction.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between mb-1">
                            <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                            <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (optional):
                    </label>
                    <textarea
                      value={approvalReason}
                      onChange={(e) => setApprovalReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter reason for approval/rejection..."
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleActionApproval(true)}
                    disabled={approving}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {approving ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleActionApproval(false)}
                    disabled={approving}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {approving ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAction(null)
                      setApprovalReason('')
                    }}
                    disabled={approving}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </ErrorBoundary>
  )
}
