// Simple in-memory cache for development
// In production, consider using Redis or similar

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      // Record cache miss
      this.recordCacheHit(false, key)
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      // Record cache miss (expired)
      this.recordCacheHit(false, key)
      return null
    }

    // Record cache hit
    this.recordCacheHit(true, key)
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clear cache entries that match a pattern
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Record cache hit/miss for metrics
  private recordCacheHit(hit: boolean, key: string): void {
    // Import metrics dynamically to avoid circular dependency
    import('./metrics').then(({ metrics }) => {
      metrics.recordCacheHit(hit, key)
    }).catch(() => {
      // Silently fail if metrics module is not available
    })
  }
}

export const cache = new MemoryCache()

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
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  PRODUCT: 15 * 60 * 1000, // 15 minutes
  STATIC_DATA: 30 * 60 * 1000, // 30 minutes (age groups, textures, etc.)
  USER_DATA: 5 * 60 * 1000, // 5 minutes (cart, profile)
  ADMIN_STATS: 2 * 60 * 1000, // 2 minutes
  RELATED_PRODUCTS: 10 * 60 * 1000, // 10 minutes
} as const
