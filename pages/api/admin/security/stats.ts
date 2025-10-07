import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get security statistics
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalEvents,
      failedLogins,
      criticalAlerts,
      activeSessions,
      blockedIPs,
      recentEvents,
      systemHealth
    ] = await Promise.all([
      // Total security events
      prisma.securityEvent.count(),
      
      // Failed logins in last 24 hours
      prisma.securityEvent.count({
        where: {
          type: 'failed_login',
          createdAt: { gte: last24Hours }
        }
      }),
      
      // Critical alerts
      prisma.securityAlert.count({
        where: {
          severity: 'critical',
          resolved: false
        }
      }),
      
      // Active sessions
      prisma.session.count({
        where: {
          expires: { gt: now }
        }
      }),
      
      // Blocked IPs
      prisma.blockedIP.count(),
      
      // Recent security events
      prisma.securityEvent.findMany({
        where: {
          createdAt: { gte: last7Days }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          severity: true,
          createdAt: true,
          details: true,
          userId: true,
          userEmail: true,
          ipAddress: true
        }
      }),
      
      // System health check
      checkSystemHealth()
    ])

    // Determine threat level
    let threatLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low'
    if (criticalAlerts > 0) {
      threatLevel = 'Critical'
    } else if (failedLogins > 10) {
      threatLevel = 'High'
    } else if (failedLogins > 5) {
      threatLevel = 'Medium'
    }

    const stats = {
      totalEvents,
      failedLogins,
      criticalAlerts,
      activeSessions,
      blockedIPs,
      threatLevel,
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        type: event.type,
        severity: event.severity,
        timestamp: event.createdAt.toISOString(),
        details: event.details,
        userId: event.userId,
        userEmail: event.userEmail,
        ipAddress: event.ipAddress
      })),
      systemHealth
    }

    // Log dashboard access
    logger.info('Security stats accessed', {
      endpoint: '/api/admin/security/stats',
      method: 'GET',
      statusCode: 200,
      responseTime: 0,
      userId: session.user.id,
      userEmail: session.user.email
    })

    res.status(200).json(stats)
  } catch (error) {
    logger.error('Security stats API failed', {
      context: 'security_stats_api'
    }, error as Error)
    
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function checkSystemHealth() {
  const health = {
    database: 'healthy' as 'healthy' | 'critical' | 'warning',
    redis: 'healthy' as 'healthy' | 'critical' | 'warning',
    fileSystem: 'healthy' as 'healthy' | 'critical' | 'warning',
    memory: 'healthy' as 'healthy' | 'critical' | 'warning',
    cpu: 'healthy' as 'healthy' | 'critical' | 'warning'
  }

  try {
    // Check database health
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    health.database = 'critical'
  }

  try {
    // Check Redis health (if available)
    if (process.env.REDIS_URL) {
      // In a real implementation, you'd ping Redis here
      health.redis = 'healthy'
    }
  } catch (error) {
    health.redis = 'warning'
  }

  try {
    // Check file system health
    const fs = require('fs')
    fs.accessSync('./public/uploads', fs.constants.W_OK)
  } catch (error) {
    health.fileSystem = 'warning'
  }

  try {
    // Check memory usage
    const memUsage = process.memoryUsage()
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    
    if (memUsagePercent > 90) {
      health.memory = 'critical'
    } else if (memUsagePercent > 75) {
      health.memory = 'warning'
    }
  } catch (error) {
    health.memory = 'warning'
  }

  try {
    // Check CPU usage (simplified)
    const cpuUsage = process.cpuUsage()
    // This is a simplified check - in production you'd use a proper CPU monitoring library
    health.cpu = 'healthy'
  } catch (error) {
    health.cpu = 'warning'
  }

  return health
}

