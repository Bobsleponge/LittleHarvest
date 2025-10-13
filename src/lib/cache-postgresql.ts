// PostgreSQL-based cache system
// No Redis needed - uses your existing PostgreSQL database
import { prisma } from './prisma'
import { logger } from './logger-pino'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

class PostgreSQLCache {
  private fallbackCache = new Map<string, CacheItem<any>>()
  private maxFallbackSize = 1000

  async set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
    try {
      // Try PostgreSQL first
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
        accessCount: 0,
        lastAccessed: Date.now(),
      }

      // Use Prisma to store in PostgreSQL
      await prisma.$executeRaw`
        INSERT INTO cache_items (key, value, expires_at, created_at, updated_at)
        VALUES (${key}, ${JSON.stringify(item)}, ${new Date(Date.now() + ttlMs)}, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = ${JSON.stringify(item)},
          expires_at = ${new Date(Date.now() + ttlMs)},
          updated_at = NOW()
      `
      
      logger.debug('Cache set (PostgreSQL)', { key, ttlMs })
    } catch (error) {
      logger.warn('PostgreSQL cache set failed, using fallback', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      
      // Fallback to in-memory cache
      this.fallbackCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
        accessCount: 0,
        lastAccessed: Date.now(),
      })

      // Evict if cache is too large
      if (this.fallbackCache.size > this.maxFallbackSize) {
        this.evictLRU()
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // Try PostgreSQL first
      const result = await prisma.$queryRaw<Array<{ value: string; expires_at: Date }>>`
        SELECT value, expires_at FROM cache_items 
        WHERE key = ${key} AND expires_at > NOW()
      `

      if (result.length > 0) {
        const item: CacheItem<T> = JSON.parse(result[0].value)
        
        // Update access statistics
        item.accessCount++
        item.lastAccessed = Date.now()
        
        // Update in PostgreSQL
        await prisma.$executeRaw`
          UPDATE cache_items 
          SET value = ${JSON.stringify(item)}, updated_at = NOW()
          WHERE key = ${key}
        `

        logger.debug('Cache hit (PostgreSQL)', { key })
        return item.data
      }

      logger.debug('Cache miss (PostgreSQL)', { key })
      return null
    } catch (error) {
      logger.warn('PostgreSQL cache get failed, using fallback', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      
      // Fallback to in-memory cache
      const item = this.fallbackCache.get(key)
      if (!item) {
        return null
      }

      const now = Date.now()
      if (now - item.timestamp > item.ttl) {
        this.fallbackCache.delete(key)
        return null
      }

      // Update access statistics
      item.accessCount++
      item.lastAccessed = now

      return item.data
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Delete from PostgreSQL
      await prisma.$executeRaw`DELETE FROM cache_items WHERE key = ${key}`
      logger.debug('Cache delete (PostgreSQL)', { key })
    } catch (error) {
      logger.warn('PostgreSQL cache delete failed, using fallback', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      this.fallbackCache.delete(key)
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear PostgreSQL cache
      await prisma.$executeRaw`DELETE FROM cache_items`
      logger.info('Cache cleared (PostgreSQL)')
    } catch (error) {
      logger.warn('PostgreSQL cache clear failed, using fallback', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      this.fallbackCache.clear()
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      // Clear PostgreSQL cache with pattern
      await prisma.$executeRaw`DELETE FROM cache_items WHERE key LIKE ${`%${pattern}%`}`
      logger.debug('Cache pattern cleared (PostgreSQL)', { pattern })
    } catch (error) {
      logger.warn('PostgreSQL cache pattern clear failed, using fallback', { 
        pattern, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      
      // Fallback to in-memory cache
      const regex = new RegExp(pattern)
      for (const key of Array.from(this.fallbackCache.keys())) {
        if (regex.test(key)) {
          this.fallbackCache.delete(key)
        }
      }
    }
  }

  getStats() {
    const fallbackEntries = Array.from(this.fallbackCache.values())
    return {
      fallbackSize: this.fallbackCache.size,
      maxFallbackSize: this.maxFallbackSize,
      hitRate: fallbackEntries.reduce((acc, item) => acc + item.accessCount, 0) / Math.max(fallbackEntries.length, 1),
      memoryUsage: this.estimateMemoryUsage(),
    }
  }

  async healthCheck(): Promise<{ status: string; postgresql: boolean; fallback: boolean }> {
    try {
      // Test PostgreSQL connection
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', postgresql: true, fallback: true }
    } catch (error) {
      logger.error('Cache health check failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return { status: 'fallback', postgresql: false, fallback: true }
    }
  }

  private evictLRU(): void {
    const entries = Array.from(this.fallbackCache.entries())
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
    
    // Remove 10% of least recently used items
    const toRemove = Math.ceil(entries.length * 0.1)
    for (let i = 0; i < toRemove; i++) {
      this.fallbackCache.delete(entries[i][0])
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, value] of Array.from(this.fallbackCache.entries())) {
      totalSize += key.length * 2 // UTF-16
      totalSize += JSON.stringify(value).length * 2
    }
    return totalSize
  }
}

// Export singleton instance
export const cache = new PostgreSQLCache()

// Export convenience functions
export const cacheSet = <T>(key: string, data: T, ttlMs?: number) => cache.set(key, data, ttlMs)
export const cacheGet = <T>(key: string) => cache.get<T>(key)
export const cacheDel = (key: string) => cache.delete(key)
export const cacheClear = () => cache.clear()
export const cacheStats = () => cache.getStats()
export const cacheHealth = () => cache.healthCheck()

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
  userOrders: (userId: string) => `orders:${userId}`,
  userAddresses: (userId: string) => `addresses:${userId}`,
  userChildren: (userId: string) => `children:${userId}`,
  allergens: () => 'allergens',
  dietaryRequirements: () => 'dietary-requirements',
  packages: () => 'packages',
  coupons: () => 'coupons',
  inventory: (productId: string, portionSizeId: string) => `inventory:${productId}:${portionSizeId}`,
  ingredients: () => 'ingredients',
  settings: (category: string) => `settings:${category}`,
  securityEvents: (userId?: string) => `security-events:${userId || 'all'}`,
  auditLogs: (userId?: string) => `audit-logs:${userId || 'all'}`,
}

// Cache TTL constants
export const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  PRODUCT: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 2 * 60 * 1000, // 2 minutes
  STATIC_DATA: 30 * 60 * 1000, // 30 minutes
  INVENTORY: 1 * 60 * 1000, // 1 minute
  SETTINGS: 60 * 60 * 1000, // 1 hour
  SECURITY: 5 * 60 * 1000, // 5 minutes
  AUDIT: 10 * 60 * 1000, // 10 minutes
} as const
