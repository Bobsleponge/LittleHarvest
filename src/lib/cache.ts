// Enhanced in-memory cache with LRU eviction and compression
// In production, consider using Redis or similar

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 1000 // Maximum number of cache entries
  private compressionThreshold = 1024 // Compress items larger than 1KB

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Compress large data
    const processedData = this.shouldCompress(data) ? this.compress(data) : data
    
    this.cache.set(key, {
      data: processedData,
      timestamp: Date.now(),
      ttl: ttlMs,
      accessCount: 0,
      lastAccessed: Date.now(),
    })

    // Evict if cache is too large
    if (this.cache.size > this.maxSize) {
      this.evictLRU()
    }
  }

  get<T>(key: string): T | null {
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

    // Update access statistics
    item.accessCount++
    item.lastAccessed = now

    // Record cache hit
    this.recordCacheHit(true, key)
    
    // Decompress if needed
    return this.isCompressed(item.data) ? this.decompress(item.data) : item.data
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

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values())
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: entries.reduce((acc, item) => acc + item.accessCount, 0) / Math.max(entries.length, 1),
      memoryUsage: this.estimateMemoryUsage(),
    }
  }

  // Evict least recently used items
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
    
    // Remove 10% of least recently used items
    const toRemove = Math.ceil(entries.length * 0.1)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  // Simple compression for large objects
  private shouldCompress(data: any): boolean {
    const size = JSON.stringify(data).length
    return size > this.compressionThreshold
  }

  private compress(data: any): string {
    return JSON.stringify(data)
  }

  private isCompressed(data: any): boolean {
    return typeof data === 'string' && data.startsWith('{')
  }

  private decompress<T>(data: string): T {
    return JSON.parse(data)
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2 // UTF-16
      totalSize += JSON.stringify(value).length * 2
    }
    return totalSize
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
