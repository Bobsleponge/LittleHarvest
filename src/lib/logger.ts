// Comprehensive logging system for Little Harvest
import { NextRequest } from 'next/server'

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context)
    }
  }

  /**
   * Log API request
   */
  logRequest(
    request: NextRequest,
    response: Response,
    duration: number,
    userId?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `${request.method} ${request.nextUrl.pathname}`,
      context: {
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        duration,
        query: Object.fromEntries(request.nextUrl.searchParams),
      },
      userId,
      requestId: this.generateRequestId(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
    }

    this.writeLog(logEntry)
  }

  /**
   * Log API error
   */
  logApiError(
    request: NextRequest,
    error: Error,
    userId?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message: `API Error: ${request.method} ${request.nextUrl.pathname}`,
      context: {
        method: request.method,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams),
      },
      userId,
      requestId: this.generateRequestId(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      error: {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      },
    }

    this.writeLog(logEntry)
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.info(`Database ${operation} on ${table}`, {
      operation,
      table,
      duration,
      ...context,
    })
  }

  /**
   * Log cache operation
   */
  logCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    key: string,
    context?: Record<string, any>
  ): void {
    this.debug(`Cache ${operation}: ${key}`, {
      operation,
      key,
      ...context,
    })
  }

  /**
   * Log authentication event
   */
  logAuthEvent(
    event: 'login' | 'logout' | 'register' | 'failed_login',
    userId?: string,
    context?: Record<string, any>
  ): void {
    this.info(`Auth ${event}`, {
      event,
      userId,
      ...context,
    })
  }

  /**
   * Log business events
   */
  logBusinessEvent(
    event: 'product_viewed' | 'product_added_to_cart' | 'order_created' | 'payment_processed',
    userId?: string,
    context?: Record<string, any>
  ): void {
    this.info(`Business event: ${event}`, {
      event,
      userId,
      ...context,
    })
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    event: 'rate_limit_exceeded' | 'suspicious_activity' | 'xss_attempt' | 'file_upload_blocked',
    context?: Record<string, any>
  ): void {
    this.warn(`Security event: ${event}`, {
      event,
      ...context,
    })
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : undefined,
    }

    this.writeLog(logEntry)
  }

  /**
   * Write log entry to appropriate destination
   */
  private writeLog(logEntry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: Console with colors
      this.writeToConsole(logEntry)
    } else if (this.isProduction) {
      // Production: Structured JSON to stdout
      this.writeToStdout(logEntry)
    }
  }

  /**
   * Write to console with colors (development)
   */
  private writeToConsole(logEntry: LogEntry): void {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m',  // Cyan
      [LogLevel.DEBUG]: '\x1b[90m', // Gray
    }

    const reset = '\x1b[0m'
    const color = colors[logEntry.level]
    const timestamp = logEntry.timestamp.split('T')[1].split('.')[0]

    console.log(
      `${color}[${timestamp}] ${logEntry.level.toUpperCase()}${reset} ${logEntry.message}`
    )

    if (logEntry.context) {
      console.log('  Context:', JSON.stringify(logEntry.context, null, 2))
    }

    if (logEntry.error) {
      console.log('  Error:', logEntry.error.message)
      if (logEntry.error.stack) {
        console.log('  Stack:', logEntry.error.stack)
      }
    }
  }

  /**
   * Write to stdout as JSON (production)
   */
  private writeToStdout(logEntry: LogEntry): void {
    console.log(JSON.stringify(logEntry))
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Get client IP from request
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return '127.0.0.1'
  }
}

// Export singleton instance
export const logger = new Logger()

// Performance monitoring utilities
export class PerformanceLogger {
  private timers = new Map<string, number>()

  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.timers.set(operation, Date.now())
  }

  /**
   * End timing and log the duration
   */
  endTimer(operation: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(operation)
    if (!startTime) {
      logger.warn(`Timer not found for operation: ${operation}`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(operation)

    logger.info(`Performance: ${operation}`, {
      operation,
      duration,
      ...context,
    })

    return duration
  }

  /**
   * Time an async operation
   */
  async timeAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    this.startTimer(operation)
    try {
      const result = await fn()
      this.endTimer(operation, context)
      return result
    } catch (error) {
      this.endTimer(operation, { ...context, error: true })
      throw error
    }
  }

  /**
   * Time a sync operation
   */
  timeSync<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    this.startTimer(operation)
    try {
      const result = fn()
      this.endTimer(operation, context)
      return result
    } catch (error) {
      this.endTimer(operation, { ...context, error: true })
      throw error
    }
  }
}

export const perfLogger = new PerformanceLogger()

// Request logging middleware
export function withRequestLogging<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const startTime = Date.now()
    
    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime
      
      // Extract user ID from session if available
      const userId = request.headers.get('x-user-id') || undefined
      
      logger.logRequest(request, response, duration, userId)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.logApiError(request, error as Error)
      
      // Return error response
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
