// PostgreSQL-based rate limiter
// No Redis needed - uses your existing PostgreSQL database
import { prisma } from './prisma'
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

class PostgreSQLRateLimiter {
  private fallbackRequests = new Map<string, RateLimitEntry>()

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now()
    
    try {
      return await this.checkWithPostgreSQL(key, limit, windowMs, now)
    } catch (error) {
      logger.warn('PostgreSQL rate limit check failed, using fallback', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return this.checkWithMemory(key, limit, windowMs, now)
    }
  }

  private async checkWithPostgreSQL(key: string, limit: number, windowMs: number, now: number): Promise<RateLimitResult> {
    const rateLimitKey = `rate_limit:${key}`
    
    // Get current rate limit data
    const result = await prisma.$queryRaw<Array<{ 
      count: number; 
      reset_time: number; 
      first_request: number 
    }>>`
      SELECT count, reset_time, first_request 
      FROM rate_limits 
      WHERE key = ${rateLimitKey} AND reset_time > ${now}
    `

    let count = 0
    let resetTime = now + windowMs
    let firstRequest = now

    if (result.length > 0) {
      count = result[0].count
      resetTime = result[0].reset_time
      firstRequest = result[0].first_request
    }

    // Increment count
    count++

    // Update or insert rate limit data
    await prisma.$executeRaw`
      INSERT INTO rate_limits (key, count, reset_time, first_request, created_at, updated_at)
      VALUES (${rateLimitKey}, ${count}, ${resetTime}, ${firstRequest}, NOW(), NOW())
      ON CONFLICT (key) DO UPDATE SET
        count = ${count},
        reset_time = ${resetTime},
        updated_at = NOW()
    `

    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)
    const retryAfter = allowed ? undefined : Math.ceil((resetTime - now) / 1000)

    return {
      allowed,
      remaining,
      resetTime,
      totalHits: count,
      retryAfter
    }
  }

  private checkWithMemory(key: string, limit: number, windowMs: number, now: number): RateLimitResult {
    const entry = this.fallbackRequests.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now,
      }
      this.fallbackRequests.set(key, newEntry)
      
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
    entry.lastAccessed = now

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
      totalHits: entry.count
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up expired rate limits from PostgreSQL
      await prisma.$executeRaw`DELETE FROM rate_limits WHERE reset_time < ${Date.now()}`
      logger.debug('Rate limit cleanup completed (PostgreSQL)')
    } catch (error) {
      logger.warn('PostgreSQL rate limit cleanup failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      
      // Clean up fallback cache
      const now = Date.now()
      for (const [key, entry] of this.fallbackRequests.entries()) {
        if (now > entry.resetTime) {
          this.fallbackRequests.delete(key)
        }
      }
    }
  }

  getStats() {
    return {
      fallbackSize: this.fallbackRequests.size,
      activeLimits: Array.from(this.fallbackRequests.values()).filter(entry => Date.now() < entry.resetTime).length
    }
  }
}

// Export singleton instance
export const rateLimiter = new PostgreSQLRateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  API: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 auth attempts per 15 minutes
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  CART: { limit: 50, windowMs: 5 * 60 * 1000 }, // 50 cart operations per 5 minutes
  ORDER: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 orders per hour
  SEARCH: { limit: 200, windowMs: 15 * 60 * 1000 }, // 200 searches per 15 minutes
  ADMIN: { limit: 1000, windowMs: 15 * 60 * 1000 }, // 1000 admin operations per 15 minutes
} as const

// Rate limit key generators
export const getRateLimitKey = (req: any, type: keyof typeof RATE_LIMITS): string => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  const userId = req.user?.id || 'anonymous'
  return `${type}:${userId}:${ip}`
}

// Rate limit middleware
export const withRateLimit = (config: { limit: number; windowMs: number }) => {
  return (handler: any) => {
    return async (req: any, res: any) => {
      try {
        const key = getRateLimitKey(req, 'API')
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
        logger.error('Rate limit error:', error)
        // Continue with the request if rate limiting fails
        return handler(req, res)
      }
    }
  }
}
