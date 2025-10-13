import pino from 'pino'
import { NextRequest } from 'next/server'

// Create Pino logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'token', 'secret', 'authorization', 'cookie'],
    censor: '[REDACTED]'
  }
})

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
  private pinoLogger: pino.Logger

  constructor(pinoLogger: pino.Logger) {
    this.pinoLogger = pinoLogger
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.pinoLogger.error({
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } : undefined
    }, message)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.pinoLogger.warn(context, message)
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.pinoLogger.info(context, message)
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.pinoLogger.debug(context, message)
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
    const logData = {
      method: request.method,
      path: request.nextUrl.pathname,
      status: response.status,
      duration,
      query: Object.fromEntries(request.nextUrl.searchParams),
      userId,
      requestId: this.generateRequestId(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
    }

    this.pinoLogger.info(logData, `${request.method} ${request.nextUrl.pathname}`)
  }

  /**
   * Log API error
   */
  logApiError(
    request: NextRequest,
    error: Error,
    userId?: string
  ): void {
    const logData = {
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      userId,
      requestId: this.generateRequestId(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }

    this.pinoLogger.error(logData, `API Error: ${request.method} ${request.nextUrl.pathname}`)
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
    this.pinoLogger.info({
      operation,
      table,
      duration,
      ...context,
    }, `Database ${operation} on ${table}`)
  }

  /**
   * Log cache operation
   */
  logCacheOperation(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    key: string,
    context?: Record<string, any>
  ): void {
    this.pinoLogger.debug({
      operation,
      key,
      ...context,
    }, `Cache ${operation}: ${key}`)
  }

  /**
   * Log authentication event
   */
  logAuthEvent(
    event: 'login' | 'logout' | 'register' | 'failed_login',
    userId?: string,
    context?: Record<string, any>
  ): void {
    this.pinoLogger.info({
      event,
      userId,
      ...context,
    }, `Auth ${event}`)
  }

  /**
   * Log business events
   */
  logBusinessEvent(
    event: 'product_viewed' | 'product_added_to_cart' | 'order_created' | 'payment_processed',
    userId?: string,
    context?: Record<string, any>
  ): void {
    this.pinoLogger.info({
      event,
      userId,
      ...context,
    }, `Business event: ${event}`)
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    event: 'rate_limit_exceeded' | 'suspicious_activity' | 'xss_attempt' | 'file_upload_blocked',
    context?: Record<string, any>
  ): void {
    this.pinoLogger.warn({
      event,
      ...context,
    }, `Security event: ${event}`)
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.pinoLogger.info({
      operation,
      duration,
      ...context,
    }, `Performance: ${operation}`)
  }

  /**
   * Log system events
   */
  logSystemEvent(
    event: 'startup' | 'shutdown' | 'health_check' | 'maintenance',
    context?: Record<string, any>
  ): void {
    this.pinoLogger.info({
      event,
      ...context,
    }, `System event: ${event}`)
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    return new Logger(this.pinoLogger.child(context))
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
export const loggerInstance = new Logger(logger)

// Performance monitoring utilities
export class PerformanceLogger {
  private timers = new Map<string, number>()
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

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
      this.logger.warn(`Timer not found for operation: ${operation}`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(operation)

    this.logger.logPerformance(operation, duration, context)
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

export const perfLogger = new PerformanceLogger(loggerInstance)

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
      
      loggerInstance.logRequest(request, response, duration, userId)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      loggerInstance.logApiError(request, error as Error)
      
      // Return error response
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

// Structured logging utilities
export const structuredLogger = {
  /**
   * Log with structured data
   */
  log(level: LogLevel, message: string, data: Record<string, any> = {}): void {
    loggerInstance[level](message, data)
  },

  /**
   * Log error with stack trace
   */
  error(message: string, error: Error, context: Record<string, any> = {}): void {
    loggerInstance.error(message, context, error)
  },

  /**
   * Log warning
   */
  warn(message: string, context: Record<string, any> = {}): void {
    loggerInstance.warn(message, context)
  },

  /**
   * Log info
   */
  info(message: string, context: Record<string, any> = {}): void {
    loggerInstance.info(message, context)
  },

  /**
   * Log debug
   */
  debug(message: string, context: Record<string, any> = {}): void {
    loggerInstance.debug(message, context)
  },

  /**
   * Create child logger
   */
  child(context: Record<string, any>): Logger {
    return loggerInstance.child(context)
  },
}

// Export the main logger instance
export { loggerInstance as logger }
