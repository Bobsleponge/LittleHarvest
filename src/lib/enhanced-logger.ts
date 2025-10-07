import { NextApiRequest } from 'next'

// Enhanced security logger with structured logging
export class SecurityLogger {
  private static instance: SecurityLogger

  constructor() {
    // Use console for structured logging
  }

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger()
    }
    return SecurityLogger.instance
  }

  /**
   * Log security events with structured data
   */
  logSecurityEvent(
    eventType: string,
    data: {
      userId?: string
      userEmail?: string
      ipAddress?: string
      userAgent?: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      details?: string
      metadata?: Record<string, any>
      requestId?: string
    }
  ): void {
    const logData = {
      type: 'security_event',
      eventType,
      timestamp: new Date().toISOString(),
      severity: data.severity,
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      details: data.details,
      metadata: data.metadata,
      requestId: data.requestId
    }

    console.log(`SECURITY_EVENT [${data.severity.toUpperCase()}]:`, JSON.stringify(logData, null, 2))
  }

  /**
   * Log authentication events
   */
  logAuthEvent(
    eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'account_locked',
    data: {
      userId?: string
      userEmail?: string
      ipAddress?: string
      userAgent?: string
      success: boolean
      details?: string
      metadata?: Record<string, any>
    }
  ): void {
    this.logSecurityEvent(eventType, {
      ...data,
      severity: data.success ? 'low' : 'high',
      details: data.details || `${eventType} ${data.success ? 'successful' : 'failed'}`
    })
  }

  /**
   * Log API access events
   */
  logAPIAccess(
    req: NextApiRequest,
    data: {
      endpoint: string
      method: string
      statusCode: number
      responseTime: number
      userId?: string
      userEmail?: string
      metadata?: Record<string, any>
    }
  ): void {
    const severity = data.statusCode >= 400 ? 'medium' : 'low'
    
    this.logSecurityEvent('api_access', {
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      severity,
      details: `${data.method} ${data.endpoint} - ${data.statusCode}`,
      metadata: {
        ...data.metadata,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime
      }
    })
  }

  /**
   * Log file upload events
   */
  logFileUpload(
    data: {
      userId: string
      userEmail: string
      fileName: string
      fileSize: number
      fileType: string
      success: boolean
      ipAddress: string
      userAgent?: string
      scanResult?: any
      error?: string
    }
  ): void {
    this.logSecurityEvent('file_upload', {
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      severity: data.success ? 'low' : 'high',
      details: `File upload ${data.success ? 'successful' : 'failed'}: ${data.fileName}`,
      metadata: {
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        success: data.success,
        scanResult: data.scanResult,
        error: data.error
      }
    })
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(
    data: {
      userId?: string
      userEmail?: string
      ipAddress: string
      userAgent?: string
      activityType: string
      details: string
      metadata?: Record<string, any>
    }
  ): void {
    this.logSecurityEvent('suspicious_activity', {
      ...data,
      severity: 'high',
      details: `Suspicious activity detected: ${data.activityType} - ${data.details}`
    })
  }

  /**
   * Log rate limit violations
   */
  logRateLimitViolation(
    data: {
      ipAddress: string
      userAgent?: string
      endpoint: string
      limit: number
      currentCount: number
      windowMs: number
      userId?: string
    }
  ): void {
    this.logSecurityEvent('rate_limit_violation', {
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      userId: data.userId,
      severity: 'medium',
      details: `Rate limit exceeded for ${data.endpoint}`,
      metadata: {
        endpoint: data.endpoint,
        limit: data.limit,
        currentCount: data.currentCount,
        windowMs: data.windowMs
      }
    })
  }

  /**
   * Log CSRF violations
   */
  logCSRFViolation(
    data: {
      ipAddress: string
      userAgent?: string
      endpoint: string
      userId?: string
      violation: any
    }
  ): void {
    this.logSecurityEvent('csrf_violation', {
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      userId: data.userId,
      severity: 'high',
      details: `CSRF violation on ${data.endpoint}`,
      metadata: {
        endpoint: data.endpoint,
        violation: data.violation
      }
    })
  }

  /**
   * Log database security events
   */
  logDatabaseSecurity(
    data: {
      operation: string
      table: string
      userId?: string
      ipAddress?: string
      success: boolean
      details?: string
      metadata?: Record<string, any>
    }
  ): void {
    this.logSecurityEvent('database_security', {
      userId: data.userId,
      ipAddress: data.ipAddress,
      severity: data.success ? 'low' : 'high',
      details: `Database ${data.operation} on ${data.table} ${data.success ? 'successful' : 'failed'}`,
      metadata: {
        operation: data.operation,
        table: data.table,
        success: data.success,
        ...data.metadata
      }
    })
  }

  /**
   * Log configuration changes
   */
  logConfigChange(
    data: {
      userId: string
      userEmail: string
      configKey: string
      oldValue: any
      newValue: any
      ipAddress: string
      userAgent?: string
    }
  ): void {
    this.logSecurityEvent('config_change', {
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      severity: 'medium',
      details: `Configuration changed: ${data.configKey}`,
      metadata: {
        configKey: data.configKey,
        oldValue: data.oldValue,
        newValue: data.newValue
      }
    })
  }

  /**
   * Log system errors
   */
  logSystemError(
    error: Error,
    data: {
      context?: string
      userId?: string
      ipAddress?: string
      metadata?: Record<string, any>
    }
  ): void {
    const logData = {
      type: 'system_error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: data.context,
      userId: data.userId,
      ipAddress: data.ipAddress,
      metadata: data.metadata,
      timestamp: new Date().toISOString()
    }
    
    console.error('SYSTEM_ERROR:', JSON.stringify(logData, null, 2))
  }

  /**
   * Get logger instance for custom logging
   */
  getLogger(): any {
    return console
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance()

// Export convenience methods
export const logSecurityEvent = (eventType: string, data: any) => 
  securityLogger.logSecurityEvent(eventType, data)

export const logAuthEvent = (eventType: any, data: any) => 
  securityLogger.logAuthEvent(eventType, data)

export const logAPIAccess = (req: NextApiRequest, data: any) => 
  securityLogger.logAPIAccess(req, data)

export const logFileUpload = (data: any) => 
  securityLogger.logFileUpload(data)

export const logSuspiciousActivity = (data: any) => 
  securityLogger.logSuspiciousActivity(data)

export const logRateLimitViolation = (data: any) => 
  securityLogger.logRateLimitViolation(data)

export const logCSRFViolation = (data: any) => 
  securityLogger.logCSRFViolation(data)

export const logDatabaseSecurity = (data: any) => 
  securityLogger.logDatabaseSecurity(data)

export const logConfigChange = (data: any) => 
  securityLogger.logConfigChange(data)

export const logSystemError = (error: Error, data: any) => 
  securityLogger.logSystemError(error, data)