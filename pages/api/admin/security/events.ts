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
      const { searchParams } = new URL(req.url!, `http://localhost:3000`)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const type = searchParams.get('type')
      const severity = searchParams.get('severity')
      const search = searchParams.get('search')
      
      const offset = (page - 1) * limit

      // Build where clause
      const where: any = {}
      
      if (type && type !== 'all') {
        where.type = type
      }
      
      if (severity && severity !== 'all') {
        where.severity = severity
      }
      
      if (search) {
        where.OR = [
          { userEmail: { contains: search, mode: 'insensitive' } },
          { ipAddress: { contains: search } },
          { type: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [events, total] = await Promise.all([
        prisma.securityEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.securityEvent.count({ where })
      ])

      // Get IP location data (mock for now)
      const eventsWithLocation = events.map(event => ({
        ...event,
        location: getLocationFromIP(event.ipAddress),
        timestamp: event.createdAt.toISOString()
      }))

      return res.status(200).json({
        events: eventsWithLocation,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    }

    if (req.method === 'POST') {
      const { type, userId, userEmail, ipAddress, userAgent, status, severity, details, metadata } = req.body

      const event = await prisma.securityEvent.create({
        data: {
          type,
          userId,
          userEmail,
          ipAddress,
          userAgent,
          status,
          severity,
          details,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      })

      // Log the security event
      logger.logSecurityEvent(type as any, {
        userId,
        userEmail,
        ipAddress,
        severity
      })

      return res.status(201).json({ event })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    logger.error('Security events API error', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getLocationFromIP(ip: string): string {
  // Mock location data - in production, you'd use a service like MaxMind or IPinfo
  const mockLocations: { [key: string]: string } = {
    '192.168.1.100': 'Cape Town, South Africa',
    '192.168.1.101': 'Cape Town, South Africa',
    '192.168.1.102': 'Cape Town, South Africa',
    '203.45.67.89': 'Unknown',
    '198.51.100.42': 'Unknown'
  }
  
  return mockLocations[ip] || 'Unknown'
}
