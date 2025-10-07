'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'

interface SecurityStats {
  totalEvents: number
  failedLogins: number
  criticalAlerts: number
  activeSessions: number
  blockedIPs: number
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  recentEvents: SecurityEvent[]
  systemHealth: SystemHealth
}

interface SecurityEvent {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  details: string
  userId?: string
  userEmail?: string
  ipAddress?: string
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical'
  redis: 'healthy' | 'warning' | 'critical'
  fileSystem: 'healthy' | 'warning' | 'critical'
  memory: 'healthy' | 'warning' | 'critical'
  cpu: 'healthy' | 'warning' | 'critical'
}

export function SecurityMonitoringDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchSecurityStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/security/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch security stats')
      }
      
      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSecurityStats()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'destructive'
      case 'High': return 'destructive'
      case 'Medium': return 'secondary'
      case 'Low': return 'default'
      default: return 'default'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security dashboard: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchSecurityStats}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchSecurityStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Threat Level Alert */}
      {stats.threatLevel !== 'Low' && (
        <Alert variant={stats.threatLevel === 'Critical' ? 'destructive' : 'default'}>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Alert:</strong> Threat level is currently {stats.threatLevel}
            {stats.threatLevel === 'Critical' && ' - Immediate action required'}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All time events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Active alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.systemHealth).map(([component, health]) => (
              <div key={component} className="flex items-center space-x-2">
                {getHealthIcon(health)}
                <div>
                  <p className="text-sm font-medium capitalize">{component}</p>
                  <Badge variant={health === 'healthy' ? 'default' : 'destructive'}>
                    {health}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent security events
              </p>
            ) : (
              stats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{event.type}</p>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                      {event.userEmail && (
                        <p className="text-xs text-muted-foreground">
                          User: {event.userEmail}
                        </p>
                      )}
                      {event.ipAddress && (
                        <p className="text-xs text-muted-foreground">
                          IP: {event.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Threat Level Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Threat Level</p>
              <Badge variant={getThreatLevelColor(stats.threatLevel)} className="text-lg px-3 py-1">
                {stats.threatLevel}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Blocked IPs</p>
              <p className="text-2xl font-bold">{stats.blockedIPs}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

