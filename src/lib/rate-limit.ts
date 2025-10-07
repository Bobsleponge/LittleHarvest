// Enhanced rate limiter with Redis support for production
// Falls back to in-memory storage for development

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

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private redisClient: any = null

  constructor() {
    // Initialize Redis client if available
    this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      // Only use Redis in production
      if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
        const Redis = require('ioredis')
        this.redisClient = new Redis(process.env.REDIS_URL)
        console.log('Rate limiter: Using Redis for storage')
      } else {
        console.log('Rate limiter: Using in-memory storage')
      }
    } catch (error) {
      console.warn('Rate limiter: Redis initialization failed, using in-memory storage', error)
    }
  }

  /**
   * Check if request is allowed with enhanced tracking
   */
  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now()
    
    if (this.redisClient) {
      return this.checkWithRedis(key, limit, windowMs, now)
    } else {
      return this.checkWithMemory(key, limit, windowMs, now)
    }
  }

  private async checkWithRedis(key: string, limit: number, windowMs: number, now: number): Promise<RateLimitResult> {
    try {
      const redisKey = `rate_limit:${key}`
      const pipeline = this.redisClient.pipeline()
      
      // Get current count
      pipeline.hgetall(redisKey)
      
      // Increment counter
      pipeline.hincrby(redisKey, 'count', 1)
      
      // Set expiry if first request
      pipeline.hsetnx(redisKey, 'firstRequest', now)
      pipeline.hsetnx(redisKey, 'resetTime', now + windowMs)
      
      const results = await pipeline.exec()
      const current = results[0][1] || {}
      
      const count = parseInt(current.count || '0')
      const firstRequest = parseInt(current.firstRequest || now)
      const resetTime = parseInt(current.resetTime || (now + windowMs))
      
      // Check if window has expired
      if (now > resetTime) {
        // Reset counter
        await this.redisClient.hset(redisKey, {
          count: 1,
          firstRequest: now,
          resetTime: now + windowMs
        })
        
        return {
          allowed: true,
          remaining: limit - 1,
          resetTime: now + windowMs,
          totalHits: 1
        }
      }
      
      if (count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          totalHits: count,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        }
      }
      
      return {
        allowed: true,
        remaining: limit - count,
        resetTime,
        totalHits: count
      }
    } catch (error) {
      console.error('Redis rate limit error:', error)
      // Fallback to memory
      return this.checkWithMemory(key, limit, windowMs, now)
    }
  }

  private checkWithMemory(key: string, limit: number, windowMs: number, now: number): RateLimitResult {
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
        allowed: true,
        remaining: limit - 1,
        resetTime: newEntry.resetTime,
        totalHits: 1
      }
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        totalHits: entry.count,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Increment counter
    entry.count++
    this.requests.set(key, entry)

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
      totalHits: entry.count
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of Array.from(this.requests.entries())) {
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

  /**
   * Reset rate limit for a key
   */
  async reset(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(`rate_limit:${key}`)
    } else {
      this.requests.delete(key)
    }
  }

  /**
   * Get rate limit info for a key
   */
  async getInfo(key: string): Promise<RateLimitEntry | null> {
    if (this.redisClient) {
      try {
        const redisKey = `rate_limit:${key}`
        const data = await this.redisClient.hgetall(redisKey)
        if (Object.keys(data).length === 0) return null
        
        return {
          count: parseInt(data.count || '0'),
          resetTime: parseInt(data.resetTime || '0'),
          firstRequest: parseInt(data.firstRequest || '0')
        }
      } catch (error) {
        console.error('Redis get info error:', error)
        return null
      }
    } else {
      return this.getStatus(key)
    }
  }
}

export const rateLimiter = new RateLimiter()

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000)

// Enhanced rate limit configurations
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
  
  // Admin operations
  ADMIN: { limit: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 minutes
  
  // Security endpoints
  SECURITY: { limit: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  
  // Settings updates
  SETTINGS: { limit: 5, windowMs: 60 * 1000 }, // 5 updates per minute
} as const

/**
 * Enhanced rate limiting middleware for API routes
 */
export function withRateLimit(
  config: { limit: number; windowMs: number },
  getKey: (request: Request) => string
) {
  return async function rateLimitMiddleware(request: Request): Promise<Response | null> {
    const key = getKey(request)
    const result = await rateLimiter.check(key, config.limit, config.windowMs)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
          totalHits: result.totalHits,
          resetTime: result.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'X-RateLimit-TotalHits': result.totalHits.toString(),
          },
        }
      )
    }

    return null // No rate limit exceeded
  }
}

/**
 * Get client IP from request with enhanced detection
 */
export function getClientIP(request: any): string {
  // Handle NextApiRequest
  if (request.headers) {
    const forwarded = request.headers['x-forwarded-for']
    const realIP = request.headers['x-real-ip']
    const cfConnectingIP = request.headers['cf-connecting-ip']
    
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
  }
  
  // Handle Web API Request
  if (request.headers && typeof request.headers.get === 'function') {
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
  }
  
  // Fallback for development
  return '127.0.0.1'
}

/**
 * Get rate limit key based on user session or IP
 */
export function getRateLimitKey(request: any, userId?: string): string {
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
  config: { limit: number; windowMs: number },
  getKey?: (req: any) => string
) {
  return function(handler: (req: any, res: any) => Promise<void> | void) {
    return async function(req: any, res: any) {
      const key = getKey ? getKey(req) : getRateLimitKey(req, req.user?.id)
      
      try {
        const result = await rateLimiter.check(key, config.limit, config.windowMs)
        
        if (!result.allowed) {
          res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: result.retryAfter,
            totalHits: result.totalHits
          })
          return
        }
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', config.limit.toString())
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
        res.setHeader('X-RateLimit-Reset', result.resetTime.toString())
        
        // Call the original handler
        return handler(req, res)
      } catch (error) {
        console.error('Rate limit error:', error)
        // Continue with the request if rate limiting fails
        return handler(req, res)
      }
    }
  }
}
