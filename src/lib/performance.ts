// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Monitor navigation timing
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationTiming(entry as PerformanceNavigationTiming)
          }
        })
      })
      
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordResourceTiming(entry as PerformanceResourceTiming)
          }
        })
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    }
  }

  private recordNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      cacheHitRate: this.calculateCacheHitRate(),
    }
    
    this.metrics.push(metrics)
    this.logMetrics('Navigation', metrics)
  }

  private recordResourceTiming(entry: PerformanceResourceTiming) {
    // Log slow resources
    if (entry.duration > 1000) {
      console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`)
    }
  }

  private calculateCacheHitRate(): number {
    // This would integrate with your cache system
    return 0.85 // Placeholder
  }

  private logMetrics(type: string, metrics: PerformanceMetrics) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${type} Performance Metrics:`, {
        loadTime: `${metrics.loadTime.toFixed(2)}ms`,
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        memoryUsage: `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        cacheHitRate: `${(metrics.cacheHitRate * 100).toFixed(1)}%`,
      })
    }
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  // Get average performance metrics
  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {}

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        loadTime: acc.loadTime + metric.loadTime,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      }),
      { loadTime: 0, renderTime: 0, memoryUsage: 0, cacheHitRate: 0 }
    )

    const count = this.metrics.length
    return {
      loadTime: totals.loadTime / count,
      renderTime: totals.renderTime / count,
      memoryUsage: totals.memoryUsage / count,
      cacheHitRate: totals.cacheHitRate / count,
    }
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, quality?: number): string => {
  if (!url) return '/placeholder-product.jpg'
  
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (quality) params.set('q', quality.toString())
  
  return params.toString() ? `${url}?${params.toString()}` : url
}

// Bundle size optimization
export const lazyImport = <T>(importFn: () => Promise<T>): Promise<T> => {
  return importFn()
}

// Memory management
export const cleanupMemory = () => {
  if (typeof window !== 'undefined' && 'gc' in window) {
    // Force garbage collection if available (development only)
    ;(window as any).gc()
  }
}

// Performance budget checking
export const checkPerformanceBudget = (metrics: PerformanceMetrics): boolean => {
  const budget = {
    maxLoadTime: 3000, // 3 seconds
    maxRenderTime: 1000, // 1 second
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minCacheHitRate: 0.8, // 80%
  }

  return (
    metrics.loadTime <= budget.maxLoadTime &&
    metrics.renderTime <= budget.maxRenderTime &&
    metrics.memoryUsage <= budget.maxMemoryUsage &&
    metrics.cacheHitRate >= budget.minCacheHitRate
  )
}
