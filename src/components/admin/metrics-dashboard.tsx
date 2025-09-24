'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart, PieChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Line, Cell, Pie } from 'recharts'
import { AlertCircle, CheckCircle, Clock, Database, HardDrive, Zap } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading'

interface MetricsData {
  apiResponseTimes: { [key: string]: number[] }
  dbQueryTimes: { [key: string]: number[] }
  cacheHits: { [key: string]: number }
  cacheMisses: { [key: string]: number }
  imageOptimizationTimes: {
    totalDuration: number
    count: number
    totalOriginalSize: number
    totalOptimizedSize: number
  }
  errors: { [key: string]: number }
  healthChecks: {
    lastCheck: number | null
    status: 'ok' | 'degraded' | 'unhealthy'
    details: { [key: string]: any }
  }
}

export function MetricsDashboard() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/metrics')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: MetricsData = await response.json()
        setMetricsData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <p className="ml-2 text-muted-foreground">Loading metrics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Error: {error}</p>
        <p className="text-sm text-muted-foreground">Could not load performance metrics.</p>
      </div>
    )
  }

  if (!metricsData) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>No metrics data available.</p>
      </div>
    )
  }

  // Process data for charts
  const apiResponseChartData = Object.entries(metricsData.apiResponseTimes).map(([endpoint, times]) => ({
    endpoint,
    avg: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    max: times.length > 0 ? Math.max(...times) : 0,
  }))

  const cacheHitRateData = Object.keys(metricsData.cacheHits).map(key => {
    const hits = metricsData.cacheHits[key] || 0
    const misses = metricsData.cacheMisses[key] || 0
    const total = hits + misses
    return {
      name: key,
      hits,
      misses,
      hitRate: total > 0 ? (hits / total) * 100 : 0,
    }
  })

  const errorChartData = Object.entries(metricsData.errors).map(([type, count]) => ({
    type,
    count,
  }))

  const imageOptimizationAvgDuration = metricsData.imageOptimizationTimes.count > 0
    ? metricsData.imageOptimizationTimes.totalDuration / metricsData.imageOptimizationTimes.count
    : 0
  const imageOptimizationAvgCompression = metricsData.imageOptimizationTimes.count > 0
    ? ((metricsData.imageOptimizationTimes.totalOriginalSize - metricsData.imageOptimizationTimes.totalOptimizedSize) / metricsData.imageOptimizationTimes.totalOriginalSize) * 100
    : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Health Status */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          {metricsData.healthChecks.status === 'ok' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : metricsData.healthChecks.status === 'degraded' ? (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{metricsData.healthChecks.status}</div>
          <p className="text-xs text-muted-foreground">
            Last checked: {metricsData.healthChecks.lastCheck ? new Date(metricsData.healthChecks.lastCheck).toLocaleTimeString() : 'N/A'}
          </p>
          {Object.entries(metricsData.healthChecks.details).map(([key, value]) => (
            <p key={key} className="text-sm text-muted-foreground mt-1">
              {key}: {typeof value === 'boolean' ? (value ? 'OK' : 'FAIL') : value}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* API Response Times */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Response Times (ms)</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiResponseChartData}>
                <XAxis dataKey="endpoint" tickFormatter={(value) => value.split(':')[0]} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" fill="hsl(var(--primary))" name="Avg Time" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cache Hit Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cache Hit Rate (%)</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ name: 'Hits', value: Object.values(metricsData.cacheHits).reduce((sum, val) => sum + val, 0) }, { name: 'Misses', value: Object.values(metricsData.cacheMisses).reduce((sum, val) => sum + val, 0) }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--secondary))" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Image Optimization */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Image Optimization</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricsData.imageOptimizationTimes.count} images</div>
          <p className="text-xs text-muted-foreground">
            Avg Duration: {imageOptimizationAvgDuration.toFixed(2)} ms
          </p>
          <p className="text-xs text-muted-foreground">
            Avg Compression: {imageOptimizationAvgCompression.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      {/* Error Rates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Counts</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorChartData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Database Query Times */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">DB Query Times (ms)</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.entries(metricsData.dbQueryTimes).map(([query, times]) => ({
                query,
                avg: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
              }))}>
                <XAxis dataKey="query" tickFormatter={(value) => value.split(':')[0]} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--accent))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}