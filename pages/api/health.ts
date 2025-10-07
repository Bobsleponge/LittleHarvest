import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../src/lib/prisma'
import { logger } from '../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const startTime = Date.now()
    
    // Check database connectivity
    let dbStatus = 'healthy'
    let dbResponseTime = 0
    
    try {
      const dbStartTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - dbStartTime
    } catch (error) {
      dbStatus = 'unhealthy'
      logger.error('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    }

    // Check Redis connectivity (if configured)
    let cacheStatus = 'healthy'
    let cacheResponseTime = 0
    
    try {
      // This would check Redis if configured
      // For now, we'll assume in-memory cache is always healthy
      cacheStatus = 'healthy'
    } catch (error) {
      cacheStatus = 'unhealthy'
    }

    const totalResponseTime = Date.now() - startTime
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'unhealthy'

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          type: process.env.DATABASE_URL?.includes('postgresql') ? 'postgresql' : 'sqlite'
        },
        cache: {
          status: cacheStatus,
          responseTime: cacheResponseTime,
          type: process.env.REDIS_URL ? 'redis' : 'in-memory'
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    }

    // Log health check
    logger.info('Health check performed', {
      status: overallStatus,
      responseTime: totalResponseTime,
      dbStatus,
      cacheStatus
    })

    const statusCode = overallStatus === 'healthy' ? 200 : 503
    res.status(statusCode).json(healthData)

  } catch (error) {
    logger.error('Health check error', { error: error instanceof Error ? error.message : 'Unknown error' })
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}





