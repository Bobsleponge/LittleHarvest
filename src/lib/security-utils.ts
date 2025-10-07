import { prisma } from './prisma'
import { logger } from './logger'

export interface SecurityEventData {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_access' | 'suspicious_activity' | 'data_export' | 'session_revoked' | 'ip_blocked' | 'ip_unblocked' | 'alert_resolved'
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent?: string
  status: 'success' | 'warning' | 'danger'
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: string
  metadata?: Record<string, any>
}

export async function logSecurityEvent(data: SecurityEventData) {
  try {
    await prisma.securityEvent.create({
      data: {
        type: data.type,
        userId: data.userId,
        userEmail: data.userEmail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
        severity: data.severity,
        details: data.details,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })

    logger.logSecurityEvent(data.type as any, {
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      severity: data.severity
    })
  } catch (error) {
    logger.error('Failed to log security event', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
  }
}

export async function createSecurityAlert(data: {
  type: 'failed_login' | 'suspicious_ip' | 'data_breach' | 'unusual_activity'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}) {
  try {
    const alert = await prisma.securityAlert.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        severity: data.severity,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })

    logger.warn('Security alert created', { 
      alertId: alert.id, 
      type: data.type, 
      severity: data.severity 
    })

    return alert
  } catch (error) {
    logger.error('Failed to create security alert', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    throw error
  }
}

export async function getSecurityStats() {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalEvents,
      failedLogins,
      criticalAlerts,
      activeSessions,
      blockedIPs
    ] = await Promise.all([
      prisma.securityEvent.count(),
      prisma.securityEvent.count({
        where: {
          type: 'failed_login',
          createdAt: { gte: last24Hours }
        }
      }),
      prisma.securityAlert.count({
        where: {
          severity: 'critical',
          resolved: false
        }
      }),
      prisma.session.count({
        where: {
          expires: { gt: now }
        }
      }),
      prisma.blockedIP.count()
    ])

    return {
      totalEvents,
      failedLogins,
      criticalAlerts,
      activeSessions,
      blockedIPs,
      threatLevel: criticalAlerts > 0 ? 'High' : 'Low'
    }
  } catch (error) {
    logger.error('Failed to get security stats', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    return {
      totalEvents: 0,
      failedLogins: 0,
      criticalAlerts: 0,
      activeSessions: 0,
      blockedIPs: 0,
      threatLevel: 'Low'
    }
  }
}

export function getLocationFromIP(ip: string): string {
  // Mock location data - in production, you'd use a service like MaxMind or IPinfo
  const mockLocations: { [key: string]: string } = {
    '192.168.1.100': 'Cape Town, South Africa',
    '192.168.1.101': 'Cape Town, South Africa',
    '192.168.1.102': 'Cape Town, South Africa',
    '127.0.0.1': 'Local Development',
    '::1': 'Local Development',
    '203.45.67.89': 'Unknown',
    '198.51.100.42': 'Unknown'
  }
  
  return mockLocations[ip] || 'Unknown'
}

export function getClientIP(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for']
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.connection?.remoteAddress
  return ip || '127.0.0.1'
}
