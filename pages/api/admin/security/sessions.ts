import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      // Get active sessions from the database
      const activeSessions = await prisma.session.findMany({
        where: {
          expires: {
            gt: new Date() // Only get non-expired sessions
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

      // Transform sessions to match our interface
      const sessionsWithDetails = activeSessions.map(session => ({
        id: session.id,
        user: session.user.email,
        ip: getClientIP(req),
        lastActivity: session.expires.toISOString(),
        location: getLocationFromIP(getClientIP(req)),
        userAgent: req.headers['user-agent'] || 'Unknown',
        isCurrent: session.id === session.id // This would need proper session tracking
      }))

      return res.status(200).json({ sessions: sessionsWithDetails })
    }

    if (req.method === 'DELETE') {
      const { sessionId } = req.body

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' })
      }

      // Delete the session
      await prisma.session.delete({
        where: { id: sessionId }
      })

      // Log the session revocation
      await prisma.securityEvent.create({
        data: {
          type: 'session_revoked',
          userId: session.user.id,
          userEmail: session.user.email,
          ipAddress: getClientIP(req),
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'success',
          severity: 'medium',
          details: `Session revoked by admin: ${session.user.email}`
        }
      })

      logger.info('Session revoked', { 
        sessionId, 
        revokedBy: session.user.email 
      })

      return res.status(200).json({ message: 'Session revoked successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    logger.error('Security sessions API error', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.connection.remoteAddress
  return ip || '127.0.0.1'
}

function getLocationFromIP(ip: string): string {
  // Mock location data - in production, you'd use a service like MaxMind or IPinfo
  const mockLocations: { [key: string]: string } = {
    '192.168.1.100': 'Cape Town, South Africa',
    '192.168.1.101': 'Cape Town, South Africa',
    '192.168.1.102': 'Cape Town, South Africa',
    '127.0.0.1': 'Local Development',
    '::1': 'Local Development'
  }
  
  return mockLocations[ip] || 'Unknown'
}
