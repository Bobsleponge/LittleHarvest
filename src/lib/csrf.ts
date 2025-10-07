import { randomBytes, createHmac } from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

export interface CSRFToken {
  token: string
  expires: number
}

export interface CSRFValidationResult {
  isValid: boolean
  error?: string
}

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour
  private static readonly SECRET_KEY = process.env.CSRF_SECRET_KEY || 'default-csrf-secret-change-in-production'

  /**
   * Generate a new CSRF token
   */
  static generateToken(): CSRFToken {
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex')
    const expires = Date.now() + this.TOKEN_EXPIRY
    
    return { token, expires }
  }

  /**
   * Create a signed CSRF token
   */
  static createSignedToken(): string {
    const { token, expires } = this.generateToken()
    const payload = `${token}:${expires}`
    const signature = this.createSignature(payload)
    
    return `${payload}:${signature}`
  }

  /**
   * Verify a signed CSRF token
   */
  static verifySignedToken(signedToken: string): CSRFValidationResult {
    try {
      const parts = signedToken.split(':')
      if (parts.length !== 3) {
        return { isValid: false, error: 'Invalid token format' }
      }

      const [token, expiresStr, signature] = parts
      const expires = parseInt(expiresStr, 10)
      
      if (isNaN(expires)) {
        return { isValid: false, error: 'Invalid expiry format' }
      }

      // Check if token has expired
      if (Date.now() > expires) {
        return { isValid: false, error: 'Token has expired' }
      }

      // Verify signature
      const payload = `${token}:${expires}`
      const expectedSignature = this.createSignature(payload)
      
      if (signature !== expectedSignature) {
        return { isValid: false, error: 'Invalid signature' }
      }

      return { isValid: true }
    } catch (error) {
      return { 
        isValid: false, 
        error: `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  /**
   * Create HMAC signature for token
   */
  private static createSignature(payload: string): string {
    return createHmac('sha256', this.SECRET_KEY)
      .update(payload)
      .digest('hex')
  }

  /**
   * Extract CSRF token from request headers
   */
  static extractTokenFromRequest(req: NextApiRequest): string | null {
    // Check X-CSRF-Token header first
    const headerToken = req.headers['x-csrf-token'] as string
    if (headerToken) {
      return headerToken
    }

    // Check X-Requested-With header (common in AJAX requests)
    const requestedWith = req.headers['x-requested-with'] as string
    if (requestedWith === 'XMLHttpRequest') {
      // For AJAX requests, we might need to check the body
      return null
    }

    // Check Authorization header for CSRF token
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer csrf:')) {
      return authHeader.substring(12) // Remove 'Bearer csrf:' prefix
    }

    return null
  }

  /**
   * Extract CSRF token from request body
   */
  static extractTokenFromBody(req: NextApiRequest): string | null {
    if (req.body && typeof req.body === 'object') {
      return req.body._csrf || req.body.csrfToken || null
    }
    return null
  }

  /**
   * Validate CSRF token from request
   */
  static validateRequest(req: NextApiRequest): CSRFValidationResult {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
      return { isValid: true }
    }

    // Extract token from various sources
    let token = this.extractTokenFromRequest(req)
    
    if (!token) {
      token = this.extractTokenFromBody(req)
    }

    if (!token) {
      return { isValid: false, error: 'CSRF token not provided' }
    }

    return this.verifySignedToken(token)
  }

  /**
   * Middleware function for CSRF protection
   */
  static middleware(req: NextApiRequest, res: NextApiResponse, next?: () => void): CSRFValidationResult {
    const validation = this.validateRequest(req)
    
    if (!validation.isValid) {
      res.status(403).json({ 
        error: 'CSRF token validation failed', 
        details: validation.error 
      })
      return validation
    }

    if (next) {
      next()
    }

    return validation
  }

  /**
   * Generate CSRF token for forms
   */
  static generateFormToken(): string {
    return this.createSignedToken()
  }

  /**
   * Add CSRF token to response headers
   */
  static addTokenToResponse(res: NextApiResponse, token?: string): void {
    const csrfToken = token || this.createSignedToken()
    res.setHeader('X-CSRF-Token', csrfToken)
  }

  /**
   * Create CSRF token endpoint handler
   */
  static createTokenEndpoint(req: NextApiRequest, res: NextApiResponse): void {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const token = this.createSignedToken()
    this.addTokenToResponse(res, token)
    
    res.status(200).json({ 
      csrfToken: token,
      expires: Date.now() + this.TOKEN_EXPIRY
    })
  }
}

/**
 * CSRF protection middleware for API routes
 */
export function withCSRFProtection(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip CSRF validation for token generation endpoint
    if (req.url === '/api/csrf-token') {
      return handler(req, res)
    }

    const validation = CSRFProtection.validateRequest(req)
    
    if (!validation.isValid) {
      return res.status(403).json({ 
        error: 'CSRF token validation failed', 
        details: validation.error 
      })
    }

    return handler(req, res)
  }
}

/**
 * Generate CSRF token for client-side use
 */
export function generateClientCSRFToken(): string {
  return CSRFProtection.createSignedToken()
}

