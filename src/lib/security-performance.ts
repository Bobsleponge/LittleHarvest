import { NextApiRequest, NextApiResponse } from 'next'
import { securityLogger as logger } from './enhanced-logger'

export interface PerformanceMetrics {
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  securityOverhead: number
  throughput: number
}

export interface SecurityPerformanceImpact {
  csrfOverhead: number
  validationOverhead: number
  loggingOverhead: number
  encryptionOverhead: number
  totalOverhead: number
  recommendations: string[]
}

export class SecurityPerformanceMonitor {
  private static metrics: PerformanceMetrics[] = []
  private static readonly MAX_METRICS = 1000

  /**
   * Measure security operation performance
   */
  static async measureSecurityOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    context: {
      userId?: string
      ipAddress?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<{ result: T; duration: number; memoryDelta: number }> {
    const startTime = process.hrtime.bigint()
    const startMemory = process.memoryUsage()
    const startCpu = process.cpuUsage()

    try {
      const result = await fn()
      
      const endTime = process.hrtime.bigint()
      const endMemory = process.memoryUsage()
      const endCpu = process.cpuUsage()

      const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed
      const cpuDelta = endCpu.user + endCpu.system

      // Record metrics
      this.recordMetrics({
        responseTime: duration,
        memoryUsage: endMemory,
        cpuUsage: endCpu,
        securityOverhead: duration,
        throughput: 1000 / duration // requests per second
      })

      // Log performance
      logger.getLogger().info({
        type: 'security_performance',
        operation,
        duration,
        memoryDelta,
        cpuDelta,
        userId: context.userId,
        ipAddress: context.ipAddress,
        metadata: context.metadata,
        timestamp: new Date().toISOString()
      }, `Security operation ${operation} completed`)

      return { result, duration, memoryDelta }
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1000000

      logger.logSystemError(error as Error, {
        context: 'security_performance',
        metadata: {
          operation,
          duration,
          ...context.metadata
        }
      })

      throw error
    }
  }

  /**
   * Record performance metrics
   */
  private static recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  /**
   * Analyze security performance impact
   */
  static analyzeSecurityImpact(): SecurityPerformanceImpact {
    const recentMetrics = this.metrics.slice(-100) // Last 100 operations
    
    if (recentMetrics.length === 0) {
      return {
        csrfOverhead: 0,
        validationOverhead: 0,
        loggingOverhead: 0,
        encryptionOverhead: 0,
        totalOverhead: 0,
        recommendations: ['No performance data available']
      }
    }

    // Calculate average response times
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentMetrics.length

    // Estimate security overhead (these are rough estimates)
    const csrfOverhead = avgResponseTime * 0.05 // 5% overhead
    const validationOverhead = avgResponseTime * 0.15 // 15% overhead
    const loggingOverhead = avgResponseTime * 0.10 // 10% overhead
    const encryptionOverhead = avgResponseTime * 0.08 // 8% overhead

    const totalOverhead = csrfOverhead + validationOverhead + loggingOverhead + encryptionOverhead

    // Generate recommendations
    const recommendations: string[] = []

    if (totalOverhead > avgResponseTime * 0.5) {
      recommendations.push('Security overhead is high (>50%) - consider optimizing security operations')
    }

    if (avgMemoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('Memory usage is high - consider implementing memory cleanup')
    }

    if (avgResponseTime > 1000) { // 1 second
      recommendations.push('Response time is slow - consider caching security operations')
    }

    if (csrfOverhead > avgResponseTime * 0.1) {
      recommendations.push('CSRF overhead is high - consider optimizing token generation')
    }

    if (validationOverhead > avgResponseTime * 0.2) {
      recommendations.push('Validation overhead is high - consider using faster validation libraries')
    }

    if (loggingOverhead > avgResponseTime * 0.15) {
      recommendations.push('Logging overhead is high - consider async logging or log batching')
    }

    return {
      csrfOverhead,
      validationOverhead,
      loggingOverhead,
      encryptionOverhead,
      totalOverhead,
      recommendations
    }
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    totalOperations: number
    avgResponseTime: number
    maxResponseTime: number
    minResponseTime: number
    avgMemoryUsage: number
    avgThroughput: number
    securityImpact: SecurityPerformanceImpact
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        avgMemoryUsage: 0,
        avgThroughput: 0,
        securityImpact: this.analyzeSecurityImpact()
      }
    }

    const responseTimes = this.metrics.map(m => m.responseTime)
    const memoryUsages = this.metrics.map(m => m.memoryUsage.heapUsed)
    const throughputs = this.metrics.map(m => m.throughput)

    return {
      totalOperations: this.metrics.length,
      avgResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      avgMemoryUsage: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
      avgThroughput: throughputs.reduce((sum, t) => sum + t, 0) / throughputs.length,
      securityImpact: this.analyzeSecurityImpact()
    }
  }

  /**
   * Benchmark security operations
   */
  static async benchmarkSecurityOperations(): Promise<{
    csrfGeneration: number
    csrfValidation: number
    inputValidation: number
    xssDetection: number
    htmlSanitization: number
    fileValidation: number
    virusScanning: number
  }> {
    const iterations = 1000

    // Benchmark CSRF operations
    const csrfStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      CSRFProtection.createSignedToken()
    }
    const csrfEnd = process.hrtime.bigint()
    const csrfGeneration = Number(csrfEnd - csrfStart) / 1000000 / iterations

    // Benchmark CSRF validation
    const token = CSRFProtection.createSignedToken()
    const validationStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      CSRFProtection.verifySignedToken(token)
    }
    const validationEnd = process.hrtime.bigint()
    const csrfValidation = Number(validationEnd - validationStart) / 1000000 / iterations

    // Benchmark input validation
    const testData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    const inputStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      SecurityUtils.validateEmail(testData.email)
    }
    const inputEnd = process.hrtime.bigint()
    const inputValidation = Number(inputEnd - inputStart) / 1000000 / iterations

    // Benchmark XSS detection
    const xssStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      SecurityUtils.detectXSS('<script>alert("xss")</script>')
    }
    const xssEnd = process.hrtime.bigint()
    const xssDetection = Number(xssEnd - xssStart) / 1000000 / iterations

    // Benchmark HTML sanitization
    const htmlStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      SecurityUtils.sanitizeHTML('<p>Hello <script>alert("xss")</script> world</p>')
    }
    const htmlEnd = process.hrtime.bigint()
    const htmlSanitization = Number(htmlEnd - htmlStart) / 1000000 / iterations

    // Benchmark file validation
    const fileStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      FileValidator.validateMimeType('image/jpeg')
    }
    const fileEnd = process.hrtime.bigint()
    const fileValidation = Number(fileEnd - fileStart) / 1000000 / iterations

    // Benchmark virus scanning (simplified)
    const virusStart = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) {
      // Simplified virus scan
      const content = Buffer.from('normal content')
      content.includes('MZ') // Check for executable signature
    }
    const virusEnd = process.hrtime.bigint()
    const virusScanning = Number(virusEnd - virusStart) / 1000000 / iterations

    return {
      csrfGeneration,
      csrfValidation,
      inputValidation,
      xssDetection,
      htmlSanitization,
      fileValidation,
      virusScanning
    }
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): {
    summary: string
    stats: any
    benchmarks: any
    recommendations: string[]
  } {
    const stats = this.getPerformanceStats()
    const benchmarks = this.benchmarkSecurityOperations()
    
    let summary = 'Security performance is '
    if (stats.avgResponseTime < 100) {
      summary += 'excellent (< 100ms average response time)'
    } else if (stats.avgResponseTime < 500) {
      summary += 'good (< 500ms average response time)'
    } else if (stats.avgResponseTime < 1000) {
      summary += 'acceptable (< 1s average response time)'
    } else {
      summary += 'poor (> 1s average response time)'
    }

    const recommendations = [
      ...stats.securityImpact.recommendations,
      'Monitor performance metrics regularly',
      'Consider implementing performance budgets',
      'Use caching for frequently accessed security data',
      'Optimize database queries in security operations'
    ]

    return {
      summary,
      stats,
      benchmarks,
      recommendations
    }
  }
}

// Import required modules for benchmarking
import { SecurityUtils } from './security'
import { CSRFProtection } from './csrf'
import { FileValidator } from './file-validation'


