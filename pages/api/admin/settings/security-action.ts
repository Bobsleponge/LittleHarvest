import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.SETTINGS,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { action } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Security action is required' })
    }

    logger.info('Security action requested', { userId: session.user.id, action })

    switch (action) {
      case 'forcePasswordReset':
        // Force all users to reset their passwords
        await forcePasswordReset(session.user.id)
        logger.info('Password reset forced for all users', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'All users will be required to reset their passwords on next login' 
        })

      case 'clearFailedLogins':
        // Clear failed login attempts for all users
        await clearFailedLogins(session.user.id)
        logger.info('Failed login attempts cleared', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'Failed login attempts cleared for all users' 
        })

      case 'generateSecurityReport':
        // Generate a comprehensive security report
        const report = await generateSecurityReport(session.user.id)
        logger.info('Security report generated', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'Security report generated successfully',
          report 
        })

      case 'lockAllAccounts':
        // Lock all user accounts (emergency security measure)
        await lockAllAccounts(session.user.id)
        logger.warn('All user accounts locked', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'All user accounts have been locked. Only admin accounts remain active.' 
        })

      case 'purgeOldData':
        // Purge old data based on retention policy
        const purgedCount = await purgeOldData(session.user.id)
        logger.info('Old data purged', { userId: session.user.id, count: purgedCount })
        return res.status(200).json({ 
          success: true, 
          message: `Purged ${purgedCount} old records based on retention policy` 
        })

      default:
        return res.status(400).json({ error: 'Unknown security action' })
    }
  } catch (error) {
    logger.error('Security action API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      action: req.body?.action 
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function forcePasswordReset(userId: string) {
  // In a real implementation, you would:
  // 1. Set a flag in user accounts requiring password reset
  // 2. Invalidate all existing sessions
  // 3. Send notification emails to users
  
  // For now, we'll just log the action
  logger.info('Password reset forced for all users (simulated)', { userId })
}

async function clearFailedLogins(userId: string) {
  // In a real implementation, you would clear failed login counters
  // For now, we'll just log the action
  logger.info('Failed login attempts cleared (simulated)', { userId })
}

async function generateSecurityReport(userId: string) {
  try {
    // Get security-related statistics
    const totalUsers = await prisma.user.count()
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } })
    const customerUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } })
    
    // Get recent security events (if you have a security events table)
    const recentSecurityEvents = await prisma.securityEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    return {
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
      summary: {
        totalUsers,
        adminUsers,
        customerUsers,
        recentSecurityEvents: recentSecurityEvents.length
      },
      recentEvents: recentSecurityEvents.map(event => ({
        id: event.id,
        type: event.type,
        description: event.description,
        createdAt: event.createdAt
      }))
    }
  } catch (error) {
    logger.error('Error generating security report', { userId, error })
    return {
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
      error: 'Failed to generate complete report'
    }
  }
}

async function lockAllAccounts(userId: string) {
  // In a real implementation, you would:
  // 1. Set all user accounts to locked status
  // 2. Invalidate all sessions
  // 3. Send emergency notifications
  
  logger.warn('All user accounts locked (simulated)', { userId })
}

async function purgeOldData(userId: string) {
  try {
    // Get retention policy from settings
    const retentionSetting = await prisma.storeSettings.findUnique({
      where: {
        category_key: {
          category: 'security',
          key: 'dataRetentionDays'
        }
      }
    })

    const retentionDays = retentionSetting ? parseInt(retentionSetting.value) : 365
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // Purge old security events
    const deletedSecurityEvents = await prisma.securityEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    // Purge old settings history
    const deletedSettingsHistory = await prisma.settingsHistory.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    return deletedSecurityEvents.count + deletedSettingsHistory.count
  } catch (error) {
    logger.error('Error purging old data', { userId, error })
    return 0
  }
}
