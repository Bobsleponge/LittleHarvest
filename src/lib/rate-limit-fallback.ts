import { logger } from './logger-pino'

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
  retryAfter?: number
}

class FallbackRateLimiter {
  private requests = new Map<string, RateLimitEntry>()

  async limit(key: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now,
      }
      this.requests.set(key, newEntry)
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: newEntry.resetTime,
      }
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        reset: entry.resetTime,
      }
    }

    // Increment counter
    entry.count++
    this.requests.set(key, entry)

    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: entry.resetTime,
    }
  }

  async reset(key: string): Promise<void> {
    this.requests.delete(key)
    logger.info('Rate limit reset (fallback)', { key })
  }

  async getStatus(key: string): Promise<RateLimitEntry | null> {
    return this.requests.get(key) || null
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of Array.from(this.requests.entries())) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Create rate limiter instances for different use cases
export const rateLimiters = {
  // General API requests
  general: new FallbackRateLimiter(),

  // Authentication endpoints
  auth: new FallbackRateLimiter(),

  // File uploads
  upload: new FallbackRateLimiter(),

  // Cart operations
  cart: new FallbackRateLimiter(),

  // Product creation (admin)
  productCreate: new FallbackRateLimiter(),

  // Search requests
  search: new FallbackRateLimiter(),

  // Admin operations
  admin: new FallbackRateLimiter(),

  // Security endpoints
  security: new FallbackRateLimiter(),

  // Settings updates
  settings: new FallbackRateLimiter(),

  // Email sending
  email: new FallbackRateLimiter(),

  // Password reset
  passwordReset: new FallbackRateLimiter(),
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
  retryAfter?: number
}

/**
 * Enhanced rate limiting middleware for API routes
 */
export function withRateLimit(
  limiter: FallbackRateLimiter,
  getKey: (request: Request) => string
) {
  return async function rateLimitMiddleware(request: Request): Promise<Response | null> {
    const key = getKey(request)
    
    try {
      const result = await limiter.limit(key)
      
      if (!result.success) {
        logger.warn('Rate limit exceeded (fallback)', {
          key,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        })

        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
            totalHits: result.limit - result.remaining,
            resetTime: result.reset,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.reset.toString(),
            },
          }
        )
      }

      return null // No rate limit exceeded
    } catch (error) {
      logger.error('Rate limit error (fallback)', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      return null
    }
  }
}

/**
 * Get client IP from request with enhanced detection
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return '127.0.0.1'
}

/**
 * Get rate limit key based on user session or IP
 */
export function getRateLimitKey(request: Request, userId?: string): string {
  const ip = getClientIP(request)
  
  if (userId) {
    return `user:${userId}:${ip}`
  }
  
  return `ip:${ip}`
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function withAPIRateLimit(
  limiter: FallbackRateLimiter,
  getKey?: (req: any) => string
) {
  return function(handler: (req: any, res: any) => Promise<void> | void) {
    return async function(req: any, res: any) {
      const key = getKey ? getKey(req) : getRateLimitKey(req, req.user?.id)
      
      try {
        const result = await limiter.limit(key)
        
        if (!result.success) {
          logger.warn('API rate limit exceeded (fallback)', {
            key,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
          })

          res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
            totalHits: result.limit - result.remaining
          })
          return
        }
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', result.limit.toString())
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
        res.setHeader('X-RateLimit-Reset', result.reset.toString())
        
        return handler(req, res)
      } catch (error) {
        logger.error('Rate limit error (fallback)', {
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        return handler(req, res)
      }
    }
  }
}

/**
 * Check rate limit without blocking
 */
export async function checkRateLimit(
  limiter: FallbackRateLimiter,
  key: string
): Promise<RateLimitResult> {
  try {
    const result = await limiter.limit(key)
    
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
      totalHits: result.limit - result.remaining,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    }
  } catch (error) {
    logger.error('Rate limit check error (fallback)', {
      key,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000,
      totalHits: 0,
    }
  }
}

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  GENERAL: { limiter: rateLimiters.general, getKey: (req: Request) => getRateLimitKey(req) },
  AUTH: { limiter: rateLimiters.auth, getKey: (req: Request) => getRateLimitKey(req) },
  UPLOAD: { limiter: rateLimiters.upload, getKey: (req: Request) => getRateLimitKey(req) },
  CART: { limiter: rateLimiters.cart, getKey: (req: Request) => getRateLimitKey(req) },
  PRODUCT_CREATE: { limiter: rateLimiters.productCreate, getKey: (req: Request) => getRateLimitKey(req) },
  SEARCH: { limiter: rateLimiters.search, getKey: (req: Request) => getRateLimitKey(req) },
  ADMIN: { limiter: rateLimiters.admin, getKey: (req: Request) => getRateLimitKey(req) },
  SECURITY: { limiter: rateLimiters.security, getKey: (req: Request) => getRateLimitKey(req) },
  SETTINGS: { limiter: rateLimiters.settings, getKey: (req: Request) => getRateLimitKey(req) },
  EMAIL: { limiter: rateLimiters.email, getKey: (req: Request) => getRateLimitKey(req) },
  PASSWORD_RESET: { limiter: rateLimiters.passwordReset, getKey: (req: Request) => getRateLimitKey(req) },
} as const

// Clean up expired entries every 5 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
}, 5 * 60 * 1000)
