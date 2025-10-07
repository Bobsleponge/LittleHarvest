'use client'

import { useState, useEffect } from 'react'
import { useSession, SessionProvider } from 'next-auth/react'
import AdminLayout from '../../components/admin/admin-layout'
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Clock, 
  Users, 
  TrendingUp,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  FileText,
  Zap,
  Brain,
  Target,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  X
} from 'lucide-react'

interface SecurityIncident {
  id: string
  incidentId: string
  title: string
  description: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'
  priority: 'p1' | 'p2' | 'p3' | 'p4'
  riskScore: number
  source: string
  affectedSystems: string[]
  indicators: string[]
  timeline: Array<{
    timestamp: string
    action: string
    actor: string
    details: string
  }>
  evidence: string[]
  actions: string[]
  lessons: string[]
  assignedTo?: string
  reportedBy: string
  reportedAt: string
  detectedAt: string
  containedAt?: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  events: any[]
  comments: any[]
}

interface SecurityEvent {
  id: string
  type: string
  severity: string
  status: string
  ipAddress: string
  userEmail?: string
  createdAt: string
  incidentId?: string
}

interface AnalysisResult {
  analysis: {
    riskScore: number
    severity: string
    threatType: string
    indicators: string[]
    recommendedActions: string[]
    shouldCreateIncident: boolean
    confidence: number
  }
  incident?: SecurityIncident
  recommendations: {
    immediate: string[]
    followUp: string[]
    playbook?: string
  }
}

export default function SecurityIncidentsPage() {
  return (
    <SessionProvider>
      <SecurityIncidentsPageContent />
    </SessionProvider>
  )
}

function SecurityIncidentsPageContent() {
  const { data: session } = useSession()
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'incidents' | 'events' | 'analysis'>('incidents')
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all'
  })
  const [showEventDetails, setShowEventDetails] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const [incidentsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/admin/security/incidents?status=${filters.status}&severity=${filters.severity}&type=${filters.type}`),
        fetch('/api/admin/security/events')
      ])

      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json()
        setIncidents(incidentsData.incidents || [])
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }
    } catch (error) {
      console.error('Error fetching security data:', error)
      setError('Failed to load security data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const showEventDetailsModal = (event: SecurityEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const analyzeEvent = async (event: SecurityEvent) => {
    try {
      setAnalyzing(true)
      setSelectedEvent(event)

      const response = await fetch('/api/admin/security/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id })
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result)
        setActiveTab('analysis')
      } else {
        setError('Failed to analyze event')
      }
    } catch (error) {
      console.error('Error analyzing event:', error)
      setError('Failed to analyze event')
    } finally {
      setAnalyzing(false)
    }
  }

  const createIncidentFromAnalysis = async () => {
    if (!selectedEvent || !analysisResult) return

    try {
      setAnalyzing(true)

      const response = await fetch('/api/admin/security/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: selectedEvent.id, 
          createIncident: true 
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result)
        await fetchData() // Refresh incidents
        setActiveTab('incidents')
      } else {
        setError('Failed to create incident')
      }
    } catch (error) {
      console.error('Error creating incident:', error)
      setError('Failed to create incident')
    } finally {
      setAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50'
      case 'investigating': return 'text-yellow-600 bg-yellow-50'
      case 'contained': return 'text-blue-600 bg-blue-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <Shield className="h-4 w-4" />
      case 'medium': return <Activity className="h-4 w-4" />
      case 'low': return <Eye className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />
      case 'investigating': return <Search className="h-4 w-4" />
      case 'contained': return <Pause className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Incident Management</h1>
            <p className="text-gray-600">Intelligent security incident detection, analysis, and response</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'open').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Auto-Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.incidentId).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="ml-2 text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'incidents', label: 'Incidents', count: incidents.length },
              { id: 'events', label: 'Security Events', count: events.length },
              { id: 'analysis', label: 'Analysis', count: analysisResult ? 1 : 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="contained">Contained</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {incident.incidentId}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                          {getSeverityIcon(incident.severity)}
                          <span className="ml-1">{incident.severity.toUpperCase()}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {getStatusIcon(incident.status)}
                          <span className="ml-1">{incident.status.toUpperCase()}</span>
                        </span>
                      </div>
                      
                      <h4 className="text-md font-medium text-gray-900 mb-2">{incident.title}</h4>
                      <p className="text-gray-600 mb-4">{incident.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Risk Score: {incident.riskScore}/100</span>
                        <span>Type: {incident.type.replace('_', ' ')}</span>
                        <span>Priority: {incident.priority.toUpperCase()}</span>
                        <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                      </div>

                      {incident.indicators.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Indicators:</p>
                          <div className="flex flex-wrap gap-2">
                            {incident.indicators.map((indicator, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {incidents.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                  <p className="text-gray-600">No security incidents match your current filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
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
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {event.type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.ipAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.userEmail || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.incidentId ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Analyzed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => showEventDetailsModal(event)}
                              className="text-gray-600 hover:text-gray-900"
                              title="View Event Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => analyzeEvent(event)}
                              disabled={analyzing || !!event.incidentId}
                              className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                              title="Analyze Event"
                            >
                              {analyzing && selectedEvent?.id === event.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Brain className="h-4 w-4" />
                              )}
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

        {/* Analysis Tab */}
        {activeTab === 'analysis' && analysisResult && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Analysis Results</h3>
              
              {selectedEvent && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Analyzed Event</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {selectedEvent.type}
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span> {selectedEvent.severity}
                      </div>
                      <div>
                        <span className="font-medium">IP Address:</span> {selectedEvent.ipAddress}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {new Date(selectedEvent.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Risk Assessment</h5>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysisResult.analysis.riskScore}/100
                  </p>
                  <p className="text-sm text-blue-700">
                    Confidence: {analysisResult.analysis.confidence}%
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h5 className="font-medium text-orange-900 mb-2">Threat Type</h5>
                  <p className="text-lg font-semibold text-orange-600">
                    {analysisResult.analysis.threatType.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-orange-700">
                    Severity: {analysisResult.analysis.severity}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">Recommendation</h5>
                  <p className="text-lg font-semibold text-green-600">
                    {analysisResult.analysis.shouldCreateIncident ? 'Create Incident' : 'Monitor Only'}
                  </p>
                  <p className="text-sm text-green-700">
                    {analysisResult.analysis.shouldCreateIncident ? 'High Risk Detected' : 'Low Risk Event'}
                  </p>
                </div>
              </div>

              {analysisResult.analysis.indicators.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">Indicators of Compromise</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.analysis.indicators.map((indicator, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Immediate Actions</h5>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.immediate.map((action, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Follow-up Actions</h5>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.followUp.map((action, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <Target className="h-4 w-4 text-blue-500 mr-2" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {analysisResult.analysis.shouldCreateIncident && !analysisResult.incident && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={createIncidentFromAnalysis}
                    disabled={analyzing}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {analyzing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span>Create Security Incident</span>
                  </button>
                </div>
              )}

              {analysisResult.incident && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="ml-2 text-green-800 font-medium">
                        Incident Created: {analysisResult.incident.incidentId}
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      The incident has been automatically created and initial response actions have been executed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Security Event Details</h3>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Event Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Event Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Event ID:</span> {selectedEvent.id}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedEvent.type.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Severity:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedEvent.severity)}`}>
                        {selectedEvent.severity.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedEvent.status}
                    </div>
                    <div>
                      <span className="font-medium">IP Address:</span> {selectedEvent.ipAddress}
                    </div>
                    <div>
                      <span className="font-medium">User Email:</span> {selectedEvent.userEmail || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedEvent.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Incident Status:</span> 
                      {selectedEvent.incidentId ? (
                        <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Linked to Incident
                        </span>
                      ) : (
                        <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Not Analyzed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Metadata */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Event Metadata</h4>
                  <div className="text-sm text-gray-700">
                    <p><span className="font-medium">Raw Event Data:</span></p>
                    <pre className="mt-2 bg-white p-3 rounded border text-xs overflow-x-auto">
                      {JSON.stringify(selectedEvent, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setShowEventDetails(false)
                        analyzeEvent(selectedEvent)
                      }}
                      disabled={analyzing || !!selectedEvent.incidentId}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {analyzing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                      <span>Analyze Event</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
