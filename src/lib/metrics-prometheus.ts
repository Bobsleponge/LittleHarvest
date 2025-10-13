import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'
import { logger } from './logger-pino'

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register })

// Custom metrics
export const metrics = {
  // API request metrics
  apiRequestsTotal: new Counter({
    name: 'api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'endpoint', 'status_code'],
    registers: [register],
  }),

  apiRequestDuration: new Histogram({
    name: 'api_request_duration_seconds',
    help: 'Duration of API requests in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
  }),

  // Database metrics
  dbQueriesTotal: new Counter({
    name: 'db_queries_total',
    help: 'Total number of database queries',
    labelNames: ['operation', 'table'],
    registers: [register],
  }),

  dbQueryDuration: new Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [register],
  }),

  // Cache metrics
  cacheHitsTotal: new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  cacheMissesTotal: new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  cacheSize: new Gauge({
    name: 'cache_size_bytes',
    help: 'Size of cache in bytes',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  // Business metrics
  ordersTotal: new Counter({
    name: 'orders_total',
    help: 'Total number of orders',
    labelNames: ['status'],
    registers: [register],
  }),

  orderValue: new Histogram({
    name: 'order_value_zar',
    help: 'Order value in ZAR',
    buckets: [50, 100, 200, 500, 1000, 2000],
    registers: [register],
  }),

  productsTotal: new Gauge({
    name: 'products_total',
    help: 'Total number of products',
    labelNames: ['status'],
    registers: [register],
  }),

  usersTotal: new Gauge({
    name: 'users_total',
    help: 'Total number of users',
    labelNames: ['role'],
    registers: [register],
  }),

  // Security metrics
  securityEventsTotal: new Counter({
    name: 'security_events_total',
    help: 'Total number of security events',
    labelNames: ['event_type', 'severity'],
    registers: [register],
  }),

  rateLimitHitsTotal: new Counter({
    name: 'rate_limit_hits_total',
    help: 'Total number of rate limit hits',
    labelNames: ['endpoint', 'limit_type'],
    registers: [register],
  }),

  // Email metrics
  emailsSentTotal: new Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['email_type', 'status'],
    registers: [register],
  }),

  emailDeliveryDuration: new Histogram({
    name: 'email_delivery_duration_seconds',
    help: 'Duration of email delivery in seconds',
    labelNames: ['email_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
  }),

  // Image optimization metrics
  imageOptimizationsTotal: new Counter({
    name: 'image_optimizations_total',
    help: 'Total number of image optimizations',
    labelNames: ['format'],
    registers: [register],
  }),

  imageOptimizationDuration: new Histogram({
    name: 'image_optimization_duration_seconds',
    help: 'Duration of image optimization in seconds',
    labelNames: ['format'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
  }),

  imageCompressionRatio: new Histogram({
    name: 'image_compression_ratio',
    help: 'Image compression ratio (0-1)',
    buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    registers: [register],
  }),

  // System health metrics
  systemUptime: new Gauge({
    name: 'system_uptime_seconds',
    help: 'System uptime in seconds',
    registers: [register],
  }),

  memoryUsage: new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [register],
  }),

  cpuUsage: new Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU usage percentage',
    registers: [register],
  }),
}

// Metrics collection class
export class MetricsCollector {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
    
    // Update system metrics periodically
    setInterval(() => this.updateSystemMetrics(), 30000) // Every 30 seconds
  }

  /**
   * Record API request metrics
   */
  recordApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number
  ): void {
    metrics.apiRequestsTotal.inc({ method, endpoint, status_code: statusCode.toString() })
    metrics.apiRequestDuration.observe({ method, endpoint }, duration / 1000)
  }

  /**
   * Record database query metrics
   */
  recordDatabaseQuery(
    operation: string,
    table: string,
    duration: number
  ): void {
    metrics.dbQueriesTotal.inc({ operation, table })
    metrics.dbQueryDuration.observe({ operation, table }, duration / 1000)
  }

  /**
   * Record cache hit/miss
   */
  recordCacheHit(hit: boolean, cacheType: string = 'default'): void {
    if (hit) {
      metrics.cacheHitsTotal.inc({ cache_type: cacheType })
    } else {
      metrics.cacheMissesTotal.inc({ cache_type: cacheType })
    }
  }

  /**
   * Record cache size
   */
  recordCacheSize(size: number, cacheType: string = 'default'): void {
    metrics.cacheSize.set({ cache_type: cacheType }, size)
  }

  /**
   * Record order metrics
   */
  recordOrder(status: string, value: number): void {
    metrics.ordersTotal.inc({ status })
    metrics.orderValue.observe(value)
  }

  /**
   * Record product count
   */
  recordProductCount(count: number, status: string = 'active'): void {
    metrics.productsTotal.set({ status }, count)
  }

  /**
   * Record user count
   */
  recordUserCount(count: number, role: string = 'customer'): void {
    metrics.usersTotal.set({ role }, count)
  }

  /**
   * Record security event
   */
  recordSecurityEvent(eventType: string, severity: string): void {
    metrics.securityEventsTotal.inc({ event_type: eventType, severity })
  }

  /**
   * Record rate limit hit
   */
  recordRateLimitHit(endpoint: string, limitType: string): void {
    metrics.rateLimitHitsTotal.inc({ endpoint, limit_type: limitType })
  }

  /**
   * Record email sent
   */
  recordEmailSent(emailType: string, status: string, duration?: number): void {
    metrics.emailsSentTotal.inc({ email_type: emailType, status })
    if (duration !== undefined) {
      metrics.emailDeliveryDuration.observe({ email_type: emailType }, duration / 1000)
    }
  }

  /**
   * Record image optimization
   */
  recordImageOptimization(
    format: string,
    duration: number,
    compressionRatio: number
  ): void {
    metrics.imageOptimizationsTotal.inc({ format })
    metrics.imageOptimizationDuration.observe({ format }, duration / 1000)
    metrics.imageCompressionRatio.observe(compressionRatio)
  }

  /**
   * Update system metrics
   */
  private updateSystemMetrics(): void {
    try {
      // Update uptime
      metrics.systemUptime.set((Date.now() - this.startTime) / 1000)

      // Update memory usage
      const memUsage = process.memoryUsage()
      metrics.memoryUsage.set({ type: 'rss' }, memUsage.rss)
      metrics.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed)
      metrics.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal)
      metrics.memoryUsage.set({ type: 'external' }, memUsage.external)

      // CPU usage would require additional monitoring
      // For now, we'll use process.cpuUsage() if available
      if (process.cpuUsage) {
        const cpuUsage = process.cpuUsage()
        const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 // Convert to seconds
        metrics.cpuUsage.set(cpuPercent)
      }
    } catch (error) {
      logger.warn('Failed to update system metrics', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  /**
   * Get metrics summary
   */
  async getMetricsSummary(): Promise<{
    apiRequests: { total: number; avgDuration: number }
    dbQueries: { total: number; avgDuration: number }
    cacheHitRate: number
    orders: { total: number; avgValue: number }
    securityEvents: { total: number }
    systemHealth: { uptime: number; memoryUsage: number }
  }> {
    try {
      const metricsData = await register.metrics()
      
      // Parse metrics data to extract summary
      // This is a simplified version - in production you'd want more sophisticated parsing
      return {
        apiRequests: { total: 0, avgDuration: 0 },
        dbQueries: { total: 0, avgDuration: 0 },
        cacheHitRate: 0,
        orders: { total: 0, avgValue: 0 },
        securityEvents: { total: 0 },
        systemHealth: { uptime: 0, memoryUsage: 0 },
      }
    } catch (error) {
      logger.error('Failed to get metrics summary', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  /**
   * Export metrics in Prometheus format
   */
  async exportMetrics(): Promise<string> {
    try {
      return await register.metrics()
    } catch (error) {
      logger.error('Failed to export metrics', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    register.clear()
  }
}

// Export singleton instance
export const metricsCollector = new MetricsCollector()

// Performance monitoring middleware
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  endpoint: string
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as Request
    const startTime = Date.now()
    
    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime
      
      metricsCollector.recordApiRequest(
        request.method,
        endpoint,
        response.status,
        duration
      )
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      metricsCollector.recordApiRequest(
        request.method,
        endpoint,
        500,
        duration
      )
      
      throw error
    }
  }
}

// Database query monitoring
export function withDatabaseMonitoring<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  return queryFn().then(
    (result) => {
      const duration = Date.now() - startTime
      metricsCollector.recordDatabaseQuery(operation, table, duration)
      return result
    },
    (error) => {
      const duration = Date.now() - startTime
      metricsCollector.recordDatabaseQuery(operation, table, duration)
      metricsCollector.recordSecurityEvent('database_error', 'medium')
      throw error
    }
  )
}

// Health check endpoint
export async function getHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  metrics: {
    uptime: number
    memoryUsage: number
    apiRequests: number
    dbQueries: number
  }
  alerts: string[]
}> {
  try {
    const summary = await metricsCollector.getMetricsSummary()
    const alerts: string[] = []

    // Check system health
    if (summary.systemHealth.memoryUsage > 0.9) {
      alerts.push('High memory usage')
    }

    if (summary.systemHealth.uptime < 300) { // Less than 5 minutes
      alerts.push('Recent restart detected')
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (alerts.length > 0) {
      status = alerts.length > 2 ? 'unhealthy' : 'degraded'
    }

    return {
      status,
      metrics: {
        uptime: summary.systemHealth.uptime,
        memoryUsage: summary.systemHealth.memoryUsage,
        apiRequests: summary.apiRequests.total,
        dbQueries: summary.dbQueries.total,
      },
      alerts,
    }
  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    
    return {
      status: 'unhealthy',
      metrics: {
        uptime: 0,
        memoryUsage: 0,
        apiRequests: 0,
        dbQueries: 0,
      },
      alerts: ['Health check failed'],
    }
  }
}

// Export the register for custom metrics
export { register }
