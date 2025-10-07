import { NextApiRequest, NextApiResponse } from 'next'
import { securityLogger as logger } from './enhanced-logger'

export interface NetworkSecurityConfig {
  allowedOrigins: string[]
  blockedIPs: string[]
  rateLimits: Record<string, { limit: number; windowMs: number }>
  corsConfig: {
    origin: string[]
    methods: string[]
    allowedHeaders: string[]
    credentials: boolean
  }
}

export class NetworkSecurity {
  private static config: NetworkSecurityConfig = {
    allowedOrigins: [
      'http://localhost:3000',
      'https://tinytastes.co.za',
      'https://www.tinytastes.co.za'
    ],
    blockedIPs: [],
    rateLimits: {
      api: { limit: 100, windowMs: 15 * 60 * 1000 },
      auth: { limit: 5, windowMs: 15 * 60 * 1000 },
      upload: { limit: 10, windowMs: 60 * 60 * 1000 }
    },
    corsConfig: {
      origin: [
        'http://localhost:3000',
        'https://tinytastes.co.za',
        'https://www.tinytastes.co.za'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With'
      ],
      credentials: true
    }
  }

  /**
   * Validate request origin
   */
  static validateOrigin(req: NextApiRequest): boolean {
    const origin = req.headers.origin || req.headers.referer
    if (!origin) return false

    const allowedOrigins = this.config.allowedOrigins
    return allowedOrigins.some(allowed => origin.startsWith(allowed))
  }

  /**
   * Check if IP is blocked
   */
  static isIPBlocked(ip: string): boolean {
    return this.config.blockedIPs.includes(ip)
  }

  /**
   * Block an IP address
   */
  static async blockIP(ip: string, reason: string, adminId: string): Promise<void> {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip)
      
      logger.logSecurityEvent('ip_blocked', {
        ipAddress: ip,
        severity: 'high',
        details: `IP blocked: ${reason}`,
        metadata: {
          reason,
          adminId,
          timestamp: new Date().toISOString()
        }
      })
    }
  }

  /**
   * Unblock an IP address
   */
  static async unblockIP(ip: string, adminId: string): Promise<void> {
    const index = this.config.blockedIPs.indexOf(ip)
    if (index > -1) {
      this.config.blockedIPs.splice(index, 1)
      
      logger.logSecurityEvent('ip_unblocked', {
        ipAddress: ip,
        severity: 'medium',
        details: 'IP address unblocked',
        metadata: {
          adminId,
          timestamp: new Date().toISOString()
        }
      })
    }
  }

  /**
   * Apply CORS headers
   */
  static applyCORSHeaders(req: NextApiRequest, res: NextApiResponse): boolean {
    const origin = req.headers.origin

    if (origin && this.config.corsConfig.origin.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else {
      res.setHeader('Access-Control-Allow-Origin', this.config.corsConfig.origin[0])
    }

    res.setHeader('Access-Control-Allow-Methods', this.config.corsConfig.methods.join(', '))
    res.setHeader('Access-Control-Allow-Headers', this.config.corsConfig.allowedHeaders.join(', '))
    res.setHeader('Access-Control-Allow-Credentials', this.config.corsConfig.credentials.toString())

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return true
    }

    return false
  }

  /**
   * Validate request headers
   */
  static validateHeaders(req: NextApiRequest): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr'
    ]

    for (const header of suspiciousHeaders) {
      if (req.headers[header]) {
        issues.push(`Suspicious header detected: ${header}`)
      }
    }

    // Check User-Agent
    const userAgent = req.headers['user-agent']
    if (!userAgent || userAgent.length < 10) {
      issues.push('Invalid or missing User-Agent header')
    }

    // Check for common attack patterns in headers
    const headerValues = Object.values(req.headers).join(' ').toLowerCase()
    const attackPatterns = [
      'script:',
      'javascript:',
      'vbscript:',
      'onload=',
      'onerror=',
      '<script',
      'eval(',
      'expression('
    ]

    for (const pattern of attackPatterns) {
      if (headerValues.includes(pattern)) {
        issues.push(`Potential attack pattern detected in headers: ${pattern}`)
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  /**
   * Validate request body size
   */
  static validateBodySize(req: NextApiRequest, maxSize: number = 1024 * 1024): boolean {
    const contentLength = parseInt(req.headers['content-length'] || '0')
    return contentLength <= maxSize
  }

  /**
   * Network security middleware
   */
  static middleware(req: NextApiRequest, res: NextApiResponse): {
    allowed: boolean
    reason?: string
  } {
    const clientIP = this.getClientIP(req)

    // Check if IP is blocked
    if (this.isIPBlocked(clientIP)) {
      logger.logSuspiciousActivity({
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        activityType: 'blocked_ip_access',
        details: 'Attempted access from blocked IP',
        metadata: {
          endpoint: req.url,
          method: req.method
        }
      })

      return {
        allowed: false,
        reason: 'IP address is blocked'
      }
    }

    // Validate origin
    if (!this.validateOrigin(req)) {
      logger.logSuspiciousActivity({
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        activityType: 'invalid_origin',
        details: 'Request from invalid origin',
        metadata: {
          origin: req.headers.origin,
          referer: req.headers.referer,
          endpoint: req.url
        }
      })

      return {
        allowed: false,
        reason: 'Invalid origin'
      }
    }

    // Validate headers
    const headerValidation = this.validateHeaders(req)
    if (!headerValidation.isValid) {
      logger.logSuspiciousActivity({
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        activityType: 'suspicious_headers',
        details: 'Suspicious headers detected',
        metadata: {
          issues: headerValidation.issues,
          endpoint: req.url
        }
      })

      return {
        allowed: false,
        reason: 'Suspicious headers detected'
      }
    }

    // Validate body size
    if (!this.validateBodySize(req)) {
      logger.logSuspiciousActivity({
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        activityType: 'oversized_request',
        details: 'Request body too large',
        metadata: {
          contentLength: req.headers['content-length'],
          endpoint: req.url
        }
      })

      return {
        allowed: false,
        reason: 'Request body too large'
      }
    }

    return { allowed: true }
  }

  /**
   * Get client IP address
   */
  static getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'] as string
    const realIP = req.headers['x-real-ip'] as string
    const cfConnectingIP = req.headers['cf-connecting-ip'] as string

    if (cfConnectingIP) return cfConnectingIP
    if (forwarded) return forwarded.split(',')[0].trim()
    if (realIP) return realIP

    return req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1'
  }

  /**
   * Update network security configuration
   */
  static updateConfig(newConfig: Partial<NetworkSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    logger.logSecurityEvent('network_config_updated', {
      severity: 'medium',
      details: 'Network security configuration updated',
      metadata: {
        changes: Object.keys(newConfig),
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Get current configuration
   */
  static getConfig(): NetworkSecurityConfig {
    return { ...this.config }
  }

  /**
   * Monitor network traffic patterns
   */
  static async monitorTrafficPatterns(): Promise<{
    suspiciousPatterns: any[]
    recommendations: string[]
  }> {
    const suspiciousPatterns: any[] = []
    const recommendations: string[] = []

    try {
      // This would typically query your logging system
      // For now, we'll return mock data
      
      recommendations.push('Implement DDoS protection')
      recommendations.push('Monitor for unusual traffic spikes')
      recommendations.push('Set up automated IP blocking for repeated violations')

      return {
        suspiciousPatterns,
        recommendations
      }
    } catch (error) {
      logger.logSystemError(error as Error, {
        context: 'network_monitoring'
      })

      return {
        suspiciousPatterns: [],
        recommendations: ['Network monitoring failed - check logs']
      }
    }
  }
}

/**
 * Network security middleware for API routes
 */
export function withNetworkSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply CORS headers
    if (NetworkSecurity.applyCORSHeaders(req, res)) {
      return // Preflight request handled
    }

    // Apply network security checks
    const securityCheck = NetworkSecurity.middleware(req, res)
    
    if (!securityCheck.allowed) {
      res.status(403).json({
        error: 'Access denied',
        reason: securityCheck.reason
      })
      return
    }

    // Continue to handler
    return handler(req, res)
  }
}

