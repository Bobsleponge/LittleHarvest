import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { engineStateManager } from '../../../../src/lib/engine-state'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the JWT token directly to access the role
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.role || token.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { action, reason } = req.body

    if (!action || !['start', 'stop', 'restart'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be start, stop, or restart' })
    }

    // Log the engine control action
    try {
      await prisma.securityEvent.create({
        data: {
          type: 'admin_access',
          userId: token.id,
          userEmail: token.email,
          ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'success',
          severity: 'medium',
          details: `Security engine ${action} initiated by admin${reason ? `: ${reason}` : ''}`,
          metadata: {
            action,
            reason: reason || 'No reason provided',
            timestamp: new Date().toISOString(),
            adminId: token.id
          }
        }
      })
    } catch (dbError) {
      logger.warn('Could not log engine control event to database', { error: dbError.message })
    }

    // Update engine state based on action
    let result
    const actionData = {
      action,
      timestamp: new Date().toISOString(),
      userId: token.id,
      userEmail: token.email,
      reason: reason || 'No reason provided'
    }

    switch (action) {
      case 'start':
        engineStateManager.setStatus('active', actionData)
        result = {
          success: true,
          message: 'Security engine started successfully',
          engineStatus: 'active',
          timestamp: new Date().toISOString()
        }
        break
      case 'stop':
        engineStateManager.setStatus('inactive', actionData)
        result = {
          success: true,
          message: 'Security engine stopped successfully',
          engineStatus: 'inactive',
          timestamp: new Date().toISOString()
        }
        break
      case 'restart':
        engineStateManager.setStatus('active', actionData)
        result = {
          success: true,
          message: 'Security engine restarted successfully',
          engineStatus: 'active',
          timestamp: new Date().toISOString()
        }
        break
    }

    logger.info('Security engine control action', {
      action,
      reason,
      userId: token.id,
      userEmail: token.email,
      result: result.success
    })

    return res.status(200).json(result)

  } catch (error) {
    logger.error('Error controlling security engine', {
      error: error.message,
      stack: error.stack
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
