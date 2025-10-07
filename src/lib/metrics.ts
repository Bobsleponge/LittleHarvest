// Performance monitoring and metrics collection for Little Harvest
import { logger } from './logger'

export interface MetricData {
  timestamp: number
  value: number
  labels?: Record<string, string>
}

export interface PerformanceMetrics {
  apiResponseTime: MetricData[]
  databaseQueryTime: MetricData[]
  cacheHitRate: MetricData[]
  imageOptimizationTime: MetricData[]
  errorRate: MetricData[]
  activeUsers: MetricData[]
  ordersPerHour: MetricData[]
}

class MetricsCollector {
  private metrics: PerformanceMetrics = {
    apiResponseTime: [],
    databaseQueryTime: [],
    cacheHitRate: [],
    imageOptimizationTime: [],
    errorRate: [],
    activeUsers: [],
    ordersPerHour: [],
  }

  private readonly maxMetricsPerType = 1000 // Keep last 1000 metrics per type
  private readonly cleanupInterval = 5 * 60 * 1000 // Clean up every 5 minutes

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanupOldMetrics(), this.cleanupInterval)
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(endpoint: string, method: string, duration: number, statusCode: number): void {
    this.addMetric('apiResponseTime', duration, {
      endpoint,
      method,
      statusCode: statusCode.toString(),
    })

    // Log slow requests (>1 second)
    if (duration > 1000) {
      logger.warn('Slow API request detected', {
        endpoint,
        method,
        duration,
        statusCode,
      })
    }
  }

  /**
   * Record database query time
   */
  recordDatabaseQueryTime(operation: string, table: string, duration: number): void {
    this.addMetric('databaseQueryTime', duration, {
      operation,
      table,
    })

    // Log slow queries (>500ms)
    if (duration > 500) {
      logger.warn('Slow database query detected', {
        operation,
        table,
        duration,
      })
    }
  }

  /**
   * Record cache hit rate
   */
  recordCacheHit(hit: boolean, key: string): void {
    this.addMetric('cacheHitRate', hit ? 1 : 0, {
      key: key.substring(0, 50), // Truncate long keys
    })
  }

  /**
   * Record image optimization time
   */
  recordImageOptimizationTime(originalSize: number, optimizedSize: number, duration: number): void {
    this.addMetric('imageOptimizationTime', duration, {
      originalSize: originalSize.toString(),
      optimizedSize: optimizedSize.toString(),
      compressionRatio: ((originalSize - optimizedSize) / originalSize * 100).toFixed(2),
    })
  }

  /**
   * Record error occurrence
   */
  recordError(endpoint: string, errorType: string): void {
    this.addMetric('errorRate', 1, {
      endpoint,
      errorType,
    })
  }

  /**
   * Record active user session
   */
  recordActiveUser(userId: string): void {
    this.addMetric('activeUsers', 1, {
      userId,
    })
  }

  /**
   * Record order creation
   */
  recordOrderCreated(orderValue: number): void {
    this.addMetric('ordersPerHour', orderValue, {
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Get metrics summary for the last N minutes
   */
  getMetricsSummary(minutes: number = 60): {
    apiResponseTime: {
      average: number
      p95: number
      p99: number
      count: number
    }
    databaseQueryTime: {
      average: number
      p95: number
      p99: number
      count: number
    }
    cacheHitRate: {
      hitRate: number
      totalRequests: number
    }
    errorRate: {
      totalErrors: number
      errorRate: number
    }
    imageOptimization: {
      averageTime: number
      averageCompressionRatio: number
      totalOptimizations: number
    }
  } {
    const cutoffTime = Date.now() - (minutes * 60 * 1000)

    // Filter metrics within time window
    const recentApiTimes = this.metrics.apiResponseTime
      .filter(m => m.timestamp > cutoffTime)
      .map(m => m.value)

    const recentDbTimes = this.metrics.databaseQueryTime
      .filter(m => m.timestamp > cutoffTime)
      .map(m => m.value)

    const recentCacheHits = this.metrics.cacheHitRate
      .filter(m => m.timestamp > cutoffTime)

    const recentErrors = this.metrics.errorRate
      .filter(m => m.timestamp > cutoffTime)

    const recentImageOpts = this.metrics.imageOptimizationTime
      .filter(m => m.timestamp > cutoffTime)

    return {
      apiResponseTime: {
        average: this.calculateAverage(recentApiTimes),
        p95: this.calculatePercentile(recentApiTimes, 95),
        p99: this.calculatePercentile(recentApiTimes, 99),
        count: recentApiTimes.length,
      },
      databaseQueryTime: {
        average: this.calculateAverage(recentDbTimes),
        p95: this.calculatePercentile(recentDbTimes, 95),
        p99: this.calculatePercentile(recentDbTimes, 99),
        count: recentDbTimes.length,
      },
      cacheHitRate: {
        hitRate: this.calculateCacheHitRate(recentCacheHits),
        totalRequests: recentCacheHits.length,
      },
      errorRate: {
        totalErrors: recentErrors.length,
        errorRate: recentErrors.length / Math.max(recentApiTimes.length, 1) * 100,
      },
      imageOptimization: {
        averageTime: this.calculateAverage(recentImageOpts.map(m => m.value)),
        averageCompressionRatio: this.calculateAverageCompressionRatio(recentImageOpts),
        totalOptimizations: recentImageOpts.length,
      },
    }
  }

  /**
   * Get health check data
   */
  getHealthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: {
      averageResponseTime: number
      errorRate: number
      cacheHitRate: number
    }
    alerts: string[]
  } {
    const summary = this.getMetricsSummary(5) // Last 5 minutes
    const alerts: string[] = []

    // Check response time
    if (summary.apiResponseTime.average > 2000) {
      alerts.push('High average response time')
    }

    // Check error rate
    if (summary.errorRate.errorRate > 5) {
      alerts.push('High error rate')
    }

    // Check cache hit rate
    if (summary.cacheHitRate.hitRate < 50) {
      alerts.push('Low cache hit rate')
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (alerts.length > 0) {
      status = alerts.length > 2 ? 'unhealthy' : 'degraded'
    }

    return {
      status,
      metrics: {
        averageResponseTime: summary.apiResponseTime.average,
        errorRate: summary.errorRate.errorRate,
        cacheHitRate: summary.cacheHitRate.hitRate,
      },
      alerts,
    }
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(): string {
    const summary = this.getMetricsSummary(60)
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: summary,
      health: this.getHealthCheck(),
    }, null, 2)
  }

  /**
   * Add a metric to the collection
   */
  private addMetric(type: keyof PerformanceMetrics, value: number, labels?: Record<string, string>): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      labels,
    }

    this.metrics[type].push(metric)

    // Keep only the most recent metrics
    if (this.metrics[type].length > this.maxMetricsPerType) {
      this.metrics[type] = this.metrics[type].slice(-this.maxMetricsPerType)
    }
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours

    Object.keys(this.metrics).forEach(key => {
      const metricKey = key as keyof PerformanceMetrics
      this.metrics[metricKey] = this.metrics[metricKey].filter(
        metric => metric.timestamp > cutoffTime
      )
    })

    logger.debug('Cleaned up old metrics', {
      remainingMetrics: Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0),
    })
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * Calculate percentile of array
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(hits: MetricData[]): number {
    if (hits.length === 0) return 0
    const totalHits = hits.reduce((sum, hit) => sum + hit.value, 0)
    return (totalHits / hits.length) * 100
  }

  /**
   * Calculate average compression ratio
   */
  private calculateAverageCompressionRatio(optimizations: MetricData[]): number {
    if (optimizations.length === 0) return 0
    
    const ratios = optimizations
      .map(opt => opt.labels?.compressionRatio)
      .filter(ratio => ratio !== undefined)
      .map(ratio => parseFloat(ratio!))
      .filter(ratio => !isNaN(ratio))

    return this.calculateAverage(ratios)
  }
}

// Export singleton instance
export const metrics = new MetricsCollector()

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
      
      metrics.recordApiResponseTime(
        endpoint,
        request.method,
        duration,
        response.status
      )
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      metrics.recordApiResponseTime(
        endpoint,
        request.method,
        duration,
        500
      )
      
      metrics.recordError(endpoint, error instanceof Error ? error.name : 'Unknown')
      
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
      metrics.recordDatabaseQueryTime(operation, table, duration)
      return result
    },
    (error) => {
      const duration = Date.now() - startTime
      metrics.recordDatabaseQueryTime(operation, table, duration)
      metrics.recordError(`db:${operation}`, error instanceof Error ? error.name : 'Unknown')
      throw error
    }
  )
}
