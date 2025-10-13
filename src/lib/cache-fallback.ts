import { logger } from './logger-pino'

// Fallback in-memory cache when Redis is not available
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class FallbackCache {
  private cache = new Map<string, CacheItem<any>>()

  async set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
    logger.debug('Cache set (fallback)', { key, ttlMs })
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) {
      this.recordCacheHit(false, key)
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.recordCacheHit(false, key)
      return null
    }

    this.recordCacheHit(true, key)
    return item.data
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
    logger.debug('Cache deleted (fallback)', { key })
  }

  async clear(): Promise<void> {
    this.cache.clear()
    logger.info('Cache cleared (fallback)')
  }

  async clearPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
    logger.debug('Cache pattern cleared (fallback)', { pattern })
  }

  async getStats(): Promise<{
    redisConnected: boolean
    fallbackSize: number
    memoryUsage: number
  }> {
    return {
      redisConnected: false,
      fallbackSize: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
    }
  }

  async isConnected(): Promise<boolean> {
    return false
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)))
  }

  async mset<T>(items: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const item of items) {
      await this.set(item.key, item.value, item.ttl)
    }
  }

  async incr(key: string, value: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0
    const newValue = current + value
    await this.set(key, newValue, 60 * 60 * 1000) // 1 hour TTL
    return newValue
  }

  async expire(key: string, ttlMs: number): Promise<boolean> {
    const item = this.cache.get(key)
    if (item) {
      item.ttl = ttlMs
      return true
    }
    return false
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, value] of Array.from(this.cache.entries())) {
      totalSize += key.length * 2 // UTF-16
      totalSize += JSON.stringify(value).length * 2
    }
    return totalSize
  }

  private recordCacheHit(hit: boolean, key: string): void {
    // Import metrics dynamically to avoid circular dependency
    import('./metrics-prometheus').then(({ metricsCollector }) => {
      metricsCollector.recordCacheHit(hit, 'fallback')
    }).catch(() => {
      // Silently fail if metrics module is not available
    })
  }
}

// Create cache instance - will use fallback for now
export const cache = new FallbackCache()

// Cache key generators
export const cacheKeys = {
  products: (filters?: any) => `products:${JSON.stringify(filters || {})}`,
  product: (id: string) => `product:${id}`,
  productBySlug: (slug: string) => `product:slug:${slug}`,
  ageGroups: () => 'age-groups',
  textures: () => 'textures',
  portionSizes: () => 'portion-sizes',
  userCart: (userId: string) => `cart:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,
  adminStats: () => 'admin:stats',
  relatedProducts: (ageGroupId: string, excludeId: string) => 
    `related-products:${ageGroupId}:${excludeId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  rateLimit: (key: string) => `rate_limit:${key}`,
  metrics: (type: string) => `metrics:${type}`,
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  PRODUCT: 15 * 60 * 1000, // 15 minutes
  STATIC_DATA: 30 * 60 * 1000, // 30 minutes (age groups, textures, etc.)
  USER_DATA: 5 * 60 * 1000, // 5 minutes (cart, profile)
  ADMIN_STATS: 2 * 60 * 1000, // 2 minutes
  RELATED_PRODUCTS: 10 * 60 * 1000, // 10 minutes
  SESSION: 24 * 60 * 60 * 1000, // 24 hours
  RATE_LIMIT: 15 * 60 * 1000, // 15 minutes
  METRICS: 60 * 1000, // 1 minute
} as const

// Cache utility functions
export const cacheUtils = {
  /**
   * Cache with automatic key generation
   */
  async cacheWithKey<T>(
    keyGenerator: () => string,
    dataFetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.PRODUCTS
  ): Promise<T> {
    const key = keyGenerator()
    const cached = await cache.get<T>(key)
    
    if (cached !== null) {
      return cached
    }
    
    const data = await dataFetcher()
    await cache.set(key, data, ttl)
    return data
  },

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    await cache.clearPattern(pattern)
  },

  /**
   * Warm up cache with data
   */
  async warmUp<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<void> {
    await cache.mset(items)
  },

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{
    redisConnected: boolean
    fallbackSize: number
    memoryUsage: number
  }> {
    return await cache.getStats()
  },
}
