#!/usr/bin/env node

/**
 * Test script for Plugin Optimizations
 * Tests all 5 implemented systems
 */

import { config } from 'dotenv'
import { logger } from './src/lib/logger-pino'
import { cache } from './src/lib/cache-redis'
import { rateLimiters } from './src/lib/rate-limit-upstash'
import { metricsCollector } from './src/lib/metrics-prometheus'
import { sendWelcomeEmail } from './src/lib/email-resend'

// Load environment variables
config()

async function testEmailSystem() {
  console.log('🧪 Testing Email System (Resend)...')
  
  try {
    const result = await sendWelcomeEmail({
      customerName: 'Test User',
      customerEmail: 'test@example.com'
    })
    
    if (result) {
      console.log('✅ Email system working')
    } else {
      console.log('❌ Email system failed')
    }
  } catch (error) {
    console.log('❌ Email system error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function testCacheSystem() {
  console.log('🧪 Testing Cache System (Redis)...')
  
  try {
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
    console.log('❌ Cache system error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function testRateLimitSystem() {
  console.log('🧪 Testing Rate Limit System (Upstash)...')
  
  try {
    const result = await rateLimiters.general.limit('test-key')
    
    if (result.success) {
      console.log('✅ Rate limit system working')
    } else {
      console.log('❌ Rate limit system failed')
    }
  } catch (error) {
    console.log('❌ Rate limit system error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function testLoggingSystem() {
  console.log('🧪 Testing Logging System (Pino)...')
  
  try {
    logger.info('Test log message', { test: true })
    logger.warn('Test warning message', { test: true })
    logger.error('Test error message', { test: true })
    
    console.log('✅ Logging system working')
  } catch (error) {
    console.log('❌ Logging system error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function testMetricsSystem() {
  console.log('🧪 Testing Metrics System (Prometheus)...')
  
  try {
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
    console.log('❌ Metrics system error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function testHealthCheck() {
  console.log('🧪 Testing Health Check...')
  
  try {
    const health = await metricsCollector.getMetricsSummary()
    
    if (health) {
      console.log('✅ Health check working')
    } else {
      console.log('❌ Health check failed')
    }
  } catch (error) {
    console.log('❌ Health check error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function runAllTests() {
  console.log('🚀 Starting Plugin Optimization Tests\n')
  
  await testLoggingSystem()
  await testCacheSystem()
  await testRateLimitSystem()
  await testMetricsSystem()
  await testHealthCheck()
  await testEmailSystem()
  
  console.log('\n✨ All tests completed!')
  console.log('\n📊 Next steps:')
  console.log('1. Check the logs above for any errors')
  console.log('2. Visit http://localhost:3000/api/metrics for Prometheus metrics')
  console.log('3. Visit http://localhost:3000/api/health for health status')
  console.log('4. Set up Grafana dashboard using the metrics endpoint')
  console.log('5. Configure Resend for email delivery')
  console.log('6. Set up Upstash Redis for production caching')
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

export { runAllTests }
