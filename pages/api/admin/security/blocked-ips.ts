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
      const blockedIPs = await prisma.blockedIP.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json({ blockedIPs })
    }

    if (req.method === 'POST') {
      const { ipAddress, reason, metadata } = req.body

      if (!ipAddress || !reason) {
        return res.status(400).json({ error: 'IP address and reason are required' })
      }

      // Check if IP is already blocked
      const existingBlock = await prisma.blockedIP.findUnique({
        where: { ipAddress }
      })

      if (existingBlock) {
        return res.status(409).json({ error: 'IP address is already blocked' })
      }

      const blockedIP = await prisma.blockedIP.create({
        data: {
          ipAddress,
          reason,
          blockedBy: session.user.email || 'unknown' || 'unknown',
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      })

      // Log the IP blocking event
      await prisma.securityEvent.create({
        data: {
          type: 'ip_blocked',
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          ipAddress: getClientIP(req),
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'success',
          severity: 'high',
          details: `IP blocked: ${ipAddress} - ${reason}`
        }
      })

      logger.warn('IP address blocked', { 
        ipAddress, 
        reason, 
        blockedBy: session.user.email || 'unknown' 
      })

      return res.status(201).json({ blockedIP })
    }

    if (req.method === 'DELETE') {
      const { ipId } = req.body

      if (!ipId) {
        return res.status(400).json({ error: 'IP ID is required' })
      }

      const blockedIP = await prisma.blockedIP.findUnique({
        where: { id: ipId }
      })

      if (!blockedIP) {
        return res.status(404).json({ error: 'Blocked IP not found' })
      }

      await prisma.blockedIP.delete({
        where: { id: ipId }
      })

      // Log the IP unblocking event
      await prisma.securityEvent.create({
        data: {
          type: 'ip_unblocked',
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          ipAddress: getClientIP(req),
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'success',
          severity: 'medium',
          details: `IP unblocked: ${blockedIP.ipAddress}`
        }
      })

      logger.info('IP address unblocked', { 
        ipAddress: blockedIP.ipAddress, 
        unblockedBy: session.user.email || 'unknown' 
      })

      return res.status(200).json({ message: 'IP address unblocked successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    logger.error('Blocked IPs API error', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.connection.remoteAddress
  return ip || '127.0.0.1'
}
