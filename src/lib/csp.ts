import { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes } from 'crypto'

export interface CSPConfig {
  nonce: string
  reportUri?: string
  enforceMode: 'enforce' | 'report-only'
}

export class ContentSecurityPolicy {
  private static nonces = new Map<string, string>()
  private static readonly NONCE_EXPIRY = 60 * 60 * 1000 // 1 hour

  /**
   * Generate a nonce for CSP
   */
  static generateNonce(): string {
    return randomBytes(16).toString('base64')
  }

  /**
   * Get or create nonce for a request
   */
  static getNonce(req: NextApiRequest): string {
    const sessionId = req.headers['x-session-id'] as string || 'default'
    const existingNonce = this.nonces.get(sessionId)
    
    if (existingNonce) {
      return existingNonce
    }

    const nonce = this.generateNonce()
    this.nonces.set(sessionId, nonce)
    
    // Clean up expired nonces
    setTimeout(() => {
      this.nonces.delete(sessionId)
    }, this.NONCE_EXPIRY)

    return nonce
  }

  /**
   * Generate CSP header value
   */
  static generateCSPHeader(nonce: string, config: Partial<CSPConfig> = {}): string {
    const directives = [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vitals.vercel-insights.com`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `img-src 'self' data: https: blob:`,
      `connect-src 'self' https://vercel.live https://vitals.vercel-insights.com`,
      `frame-src 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ]

    // Add report-uri if provided
    if (config.reportUri) {
      directives.push(`report-uri ${config.reportUri}`)
    }

    return directives.join('; ')
  }

  /**
   * Apply CSP headers to response
   */
  static applyCSPHeaders(req: NextApiRequest, res: NextApiResponse, config: Partial<CSPConfig> = {}): string {
    const nonce = this.getNonce(req)
    const cspHeader = this.generateCSPHeader(nonce, config)
    
    const headerName = config.enforceMode === 'report-only' 
      ? 'Content-Security-Policy-Report-Only' 
      : 'Content-Security-Policy'
    
    res.setHeader(headerName, cspHeader)
    res.setHeader('X-CSP-Nonce', nonce)
    
    return nonce
  }

  /**
   * CSP violation reporting endpoint
   */
  static async handleViolationReport(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
      const violation = req.body
      
      // Log CSP violation
      console.warn('CSP Violation Report:', {
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        violation: {
          blockedURI: violation['blocked-uri'],
          violatedDirective: violation['violated-directive'],
          originalPolicy: violation['original-policy'],
          sourceFile: violation['source-file'],
          lineNumber: violation['line-number'],
          columnNumber: violation['column-number']
        }
      })

      // In production, you might want to send this to a monitoring service
      // await sendToMonitoringService(violation)

      res.status(204).end()
    } catch (error) {
      console.error('CSP violation report error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * Generate CSP meta tag for HTML
   */
  static generateCSPMetaTag(nonce: string, config: Partial<CSPConfig> = {}): string {
    const cspHeader = this.generateCSPHeader(nonce, config)
    return `<meta http-equiv="Content-Security-Policy" content="${cspHeader}">`
  }

  /**
   * Validate nonce in request
   */
  static validateNonce(req: NextApiRequest, providedNonce: string): boolean {
    const expectedNonce = this.getNonce(req)
    return expectedNonce === providedNonce
  }

  /**
   * Clean up expired nonces
   */
  static cleanupExpiredNonces(): void {
    // This would be called periodically to clean up expired nonces
    // In a real implementation, you might use Redis or a database
    const now = Date.now()
    for (const [sessionId, nonce] of this.nonces.entries()) {
      // Simple cleanup - in production, track creation time
      if (Math.random() < 0.1) { // 10% chance to clean up
        this.nonces.delete(sessionId)
      }
    }
  }
}

/**
 * CSP middleware for API routes
 */
export function withCSPProtection(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  config: Partial<CSPConfig> = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply CSP headers
    const nonce = ContentSecurityPolicy.applyCSPHeaders(req, res, config)
    
    // Add nonce to request for use in handler
    req.cspNonce = nonce
    
    return handler(req, res)
  }
}

/**
 * CSP violation reporting endpoint
 */
export function createCSPViolationEndpoint() {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return ContentSecurityPolicy.handleViolationReport(req, res)
  }
}

// Extend NextApiRequest to include nonce
declare module 'next' {
  interface NextApiRequest {
    cspNonce?: string
  }
}

// Clean up expired nonces every hour
setInterval(() => {
  ContentSecurityPolicy.cleanupExpiredNonces()
}, 60 * 60 * 1000)

