// Simple in-memory rate limiter for development
// In production, consider using Redis or similar

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()

  /**
   * Check if request is allowed
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(key: string, limit: number, windowMs: number): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      }
      this.requests.set(key, newEntry)
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: newEntry.resetTime,
      }
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment counter
    entry.count++
    this.requests.set(key, entry)

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.requests.get(key) || null
  }
}

export const rateLimiter = new RateLimiter()

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000)

// Rate limit configurations
export const RATE_LIMITS = {
  // General API requests
  GENERAL: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  
  // Authentication endpoints
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  
  // File uploads
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  
  // Cart operations
  CART: { limit: 50, windowMs: 5 * 60 * 1000 }, // 50 operations per 5 minutes
  
  // Product creation (admin)
  PRODUCT_CREATE: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 products per hour
  
  // Search requests
  SEARCH: { limit: 30, windowMs: 60 * 1000 }, // 30 searches per minute
} as const

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  config: { limit: number; windowMs: number },
  getKey: (request: Request) => string
) {
  return function rateLimitMiddleware(request: Request) {
    const key = getKey(request)
    const result = rateLimiter.check(key, config.limit, config.windowMs)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      )
    }

    return null // No rate limit exceeded
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // Fallback for development
  return '127.0.0.1'
}

/**
 * Get rate limit key based on user session or IP
 */
export function getRateLimitKey(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  const ip = getClientIP(request)
  return `ip:${ip}`
}
