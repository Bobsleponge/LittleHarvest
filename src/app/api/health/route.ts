import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { metrics } from '@/lib/metrics'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check database connection
    let dbStatus = 'healthy'
    let dbResponseTime = 0
    
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - dbStart
    } catch (error) {
      dbStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }

    // Check cache status
    const cacheStatus = 'healthy' // Our in-memory cache is always available

    // Get system metrics
    const systemMetrics = metrics.getHealthCheck()
    
    // Calculate overall health
    const overallHealth = dbStatus === 'healthy' && systemMetrics.status !== 'unhealthy' ? 'healthy' : 'degraded'
    
    const responseTime = Date.now() - startTime

    const healthData = {
      status: overallHealth,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          type: 'sqlite'
        },
        cache: {
          status: cacheStatus,
          type: 'in-memory'
        },
        metrics: systemMetrics
      },
      system: {
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    }

    // Return appropriate status code
    const statusCode = overallHealth === 'healthy' ? 200 : 503

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
