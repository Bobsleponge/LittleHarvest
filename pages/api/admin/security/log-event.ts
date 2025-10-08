import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'

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

    const { 
      type, 
      user, 
      ip, 
      details, 
      severity = 'medium', 
      status = 'warning',
      source = 'system',
      category = 'security_event'
    } = req.body

    if (!type || !details) {
      return res.status(400).json({ error: 'Type and details are required' })
    }

    // Create security event in database
    try {
      const event = await prisma.securityEvent.create({
        data: {
          type,
          userId: user || token.id,
          userEmail: user || token.email,
          ipAddress: ip || req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || 'Unknown',
          status,
          severity,
          details,
          metadata: {
            source,
            category,
            timestamp: new Date().toISOString(),
            loggedBy: token.id
          }
        }
      })

      logger.info('Security event logged', {
        eventId: event.id,
        type,
        severity,
        userId: token.id,
        userEmail: token.email
      })

      return res.status(201).json({ 
        success: true, 
        event: {
          id: event.id,
          type: event.type,
          user: event.userEmail,
          ip: event.ipAddress,
          timestamp: event.createdAt,
          status: event.status,
          severity: event.severity,
          details: event.details,
          source,
          category
        }
      })

    } catch (dbError) {
      logger.error('Database error logging security event', {
        error: dbError.message,
        type,
        userId: token.id
      })

      // Even if database fails, log to application logs
      logger.warn('Security event (database failed)', {
        type,
        user,
        ip,
        details,
        severity,
        status,
        source,
        category,
        timestamp: new Date().toISOString()
      })

      return res.status(201).json({ 
        success: true, 
        event: {
          id: `log_${Date.now()}`,
          type,
          user,
          ip,
          timestamp: new Date().toISOString(),
          status,
          severity,
          details,
          source,
          category
        },
        note: 'Event logged to application logs (database unavailable)'
      })
    }

  } catch (error) {
    logger.error('Error logging security event', {
      error: error.message,
      stack: error.stack
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
