import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { logger } from './logger'
import { getClientIP } from './security-utils'

export interface SessionSecurityContext {
  userId: string
  userEmail: string
  userRole: string
  sessionId: string
  ipAddress: string
  userAgent: string
  lastActivity: Date
}

export interface SessionValidationResult {
  isValid: boolean
  context?: SessionSecurityContext
  error?: string
  requiresReauth?: boolean
}

export class SessionSecurityManager {
  private static readonly MAX_INACTIVE_TIME = 2 * 60 * 60 * 1000 // 2 hours
  private static readonly MAX_SESSIONS_PER_USER = 5
  private static readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 10

  /**
   * Validate session security context
   */
  static async validateSession(req: NextApiRequest, res: NextApiResponse): Promise<SessionValidationResult> {
    try {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session?.user?.id) {
        return { isValid: false, error: 'No active session' }
      }

      const clientIP = getClientIP(req)
      const userAgent = req.headers['user-agent'] || 'Unknown'

      // Check for session hijacking indicators
      const sessionContext: SessionSecurityContext = {
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role || 'CUSTOMER',
        sessionId: session.user.id, // Using user ID as session identifier
        ipAddress: clientIP,
        userAgent,
        lastActivity: new Date()
      }

      // Validate session security
      const securityCheck = await this.performSecurityChecks(sessionContext, req)
      if (!securityCheck.isValid) {
        return securityCheck
      }

      // Update last activity
      await this.updateLastActivity(sessionContext)

      return {
        isValid: true,
        context: sessionContext
      }
    } catch (error) {
      logger.error('Session validation error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return { 
        isValid: false, 
        error: 'Session validation failed',
        requiresReauth: true
      }
    }
  }

  /**
   * Perform security checks on session
   */
  private static async performSecurityChecks(
    context: SessionSecurityContext, 
    req: NextApiRequest
  ): Promise<SessionValidationResult> {
    try {
      // Check for suspicious IP changes
      const recentSessions = await prisma.securityEvent.findMany({
        where: {
          userId: context.userId,
          type: 'login',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress))
      if (uniqueIPs.size > 3) {
        await this.logSuspiciousActivity(context, 'Multiple IP addresses detected')
        return { 
          isValid: false, 
          error: 'Suspicious activity detected',
          requiresReauth: true
        }
      }

      // Check for rapid session changes
      const recentLogins = recentSessions.filter(s => 
        new Date(s.createdAt).getTime() > Date.now() - 60 * 60 * 1000 // Last hour
      )
      
      if (recentLogins.length > 5) {
        await this.logSuspiciousActivity(context, 'Rapid session changes detected')
        return { 
          isValid: false, 
          error: 'Too many recent login attempts',
          requiresReauth: true
        }
      }

      // Check for blocked IP
      const blockedIP = await prisma.blockedIP.findUnique({
        where: { ipAddress: context.ipAddress }
      })

      if (blockedIP) {
        await this.logSuspiciousActivity(context, 'Access from blocked IP')
        return { 
          isValid: false, 
          error: 'Access denied',
          requiresReauth: true
        }
      }

      return { isValid: true }
    } catch (error) {
      logger.error('Security check error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return { isValid: false, error: 'Security check failed' }
    }
  }

  /**
   * Log suspicious activity
   */
  private static async logSuspiciousActivity(
    context: SessionSecurityContext, 
    reason: string
  ): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          type: 'suspicious_activity',
          userId: context.userId,
          userEmail: context.userEmail,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          status: 'danger',
          severity: 'high',
          details: reason,
          metadata: JSON.stringify({
            sessionId: context.sessionId,
            userRole: context.userRole,
            timestamp: new Date().toISOString()
          })
        }
      })

      // Create security alert
      await prisma.securityAlert.create({
        data: {
          type: 'unusual_activity',
          title: 'Suspicious Session Activity',
          description: `Suspicious activity detected for user ${context.userEmail}: ${reason}`,
          severity: 'high',
          metadata: JSON.stringify({
            userId: context.userId,
            ipAddress: context.ipAddress,
            reason
          })
        }
      })

      logger.warn('Suspicious activity detected', {
        userId: context.userId,
        userEmail: context.userEmail,
        ipAddress: context.ipAddress,
        reason
      })
    } catch (error) {
      logger.error('Failed to log suspicious activity', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Update last activity timestamp
   */
  private static async updateLastActivity(context: SessionSecurityContext): Promise<void> {
    try {
      // Update user's last activity
      await prisma.user.update({
        where: { id: context.userId },
        data: { updatedAt: new Date() }
      })

      // Log activity event
      await prisma.securityEvent.create({
        data: {
          type: 'login',
          userId: context.userId,
          userEmail: context.userEmail,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          status: 'success',
          severity: 'low',
          details: 'Session activity updated'
        }
      })
    } catch (error) {
      logger.error('Failed to update last activity', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Revoke all sessions for a user
   */
  static async revokeAllUserSessions(userId: string, reason: string): Promise<void> {
    try {
      // Delete all sessions from database
      await prisma.session.deleteMany({
        where: { userId }
      })

      // Log revocation event
      await prisma.securityEvent.create({
        data: {
          type: 'session_revoked',
          userId,
          status: 'success',
          severity: 'medium',
          details: `All sessions revoked: ${reason}`,
          ipAddress: 'system'
        }
      })

      logger.info('All sessions revoked for user', { userId, reason })
    } catch (error) {
      logger.error('Failed to revoke user sessions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiredSessions = await prisma.session.findMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      })

      for (const session of expiredSessions) {
        await prisma.session.delete({
          where: { id: session.id }
        })
      }

      if (expiredSessions.length > 0) {
        logger.info('Cleaned up expired sessions', { count: expiredSessions.length })
      }
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getUserActiveSessions(userId: string): Promise<any[]> {
    try {
      return await prisma.session.findMany({
        where: {
          userId,
          expires: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { expires: 'desc' }
      })
    } catch (error) {
      logger.error('Failed to get user active sessions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      return []
    }
  }
}

// Cleanup expired sessions every hour
setInterval(() => {
  SessionSecurityManager.cleanupExpiredSessions()
}, 60 * 60 * 1000)
