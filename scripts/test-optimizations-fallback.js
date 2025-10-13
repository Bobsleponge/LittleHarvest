#!/usr/bin/env node

/**
 * Test script for Plugin Optimizations (Fallback Mode)
 * Tests 4 systems without external dependencies
 */

const { config } = require('dotenv')

// Load environment variables
config()

async function testLoggingSystem() {
  console.log('🧪 Testing Logging System (Pino)...')
  
  try {
    const { logger } = require('./src/lib/logger-pino')
    
    logger.info('Test log message', { test: true })
    logger.warn('Test warning message', { test: true })
    logger.error('Test error message', { test: true })
    
    console.log('✅ Logging system working')
  } catch (error) {
    console.log('❌ Logging system error:', error.message)
  }
}

async function testCacheSystem() {
  console.log('🧪 Testing Cache System (Fallback)...')
  
  try {
    const { cache } = require('./src/lib/cache-fallback')
    
    // Test set
    await cache.set('test-key', { message: 'Hello World' }, 60000)
    
    // Test get
    const result = await cache.get('test-key')
    
    if (result && result.message === 'Hello World') {
      console.log('✅ Cache system working')
    } else {
      console.log('❌ Cache system failed')
    }
    
    // Clean up
    await cache.delete('test-key')
  } catch (error) {
    console.log('❌ Cache system error:', error.message)
  }
}

async function testRateLimitSystem() {
  console.log('🧪 Testing Rate Limit System (Fallback)...')
  
  try {
    const { rateLimiters } = require('./src/lib/rate-limit-fallback')
    
    const result = await rateLimiters.general.limit('test-key')
    
    if (result.success) {
      console.log('✅ Rate limit system working')
    } else {
      console.log('❌ Rate limit system failed')
    }
  } catch (error) {
    console.log('❌ Rate limit system error:', error.message)
  }
}

async function testMetricsSystem() {
  console.log('🧪 Testing Metrics System (Prometheus)...')
  
  try {
    const { metricsCollector } = require('./src/lib/metrics-prometheus')
    
    // Test recording metrics
    metricsCollector.recordApiRequest('GET', '/test', 200, 100)
    metricsCollector.recordDatabaseQuery('SELECT', 'users', 50)
    metricsCollector.recordCacheHit(true, 'test')
    
    // Test exporting metrics
    const metrics = await metricsCollector.exportMetrics()
    
    if (metrics && metrics.includes('api_requests_total')) {
      console.log('✅ Metrics system working')
    } else {
      console.log('❌ Metrics system failed')
    }
  } catch (error) {
    console.log('❌ Metrics system error:', error.message)
  }
}

async function testHealthCheck() {
  console.log('🧪 Testing Health Check...')
  
  try {
    const { getHealthCheck } = require('./src/lib/metrics-prometheus')
    
    const health = await getHealthCheck()
    
    if (health) {
      console.log('✅ Health check working')
    } else {
      console.log('❌ Health check failed')
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Plugin Optimization Tests (Fallback Mode)\n')
  
  await testLoggingSystem()
  await testCacheSystem()
  await testRateLimitSystem()
  await testMetricsSystem()
  await testHealthCheck()
  
  console.log('\n✨ All tests completed!')
  console.log('\n📊 Next steps:')
  console.log('1. Check the logs above for any errors')
  console.log('2. Start the dev server: npm run dev')
  console.log('3. Visit http://localhost:3000/api/metrics for Prometheus metrics')
  console.log('4. Visit http://localhost:3000/api/health for health status')
  console.log('5. Set up Upstash Redis for production caching')
  console.log('6. Configure Resend for email delivery (when ready)')
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests }
