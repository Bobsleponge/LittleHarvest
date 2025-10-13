import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { supabaseAdmin } from '../../../../src/lib/supabaseClient'
import { logger } from '../../../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url!, `http://localhost:3000`)
      const resolved = searchParams.get('resolved')
      const severity = searchParams.get('severity')
      
      const where: any = {}
      
      if (resolved !== null) {
        where.resolved = resolved === 'true'
      }
      
      if (severity && severity !== 'all') {
        where.severity = severity
      }

      const alerts = await supabaseAdmin
        .from('SecurityAlert')
        .select('*')
        .order('createdAt', { ascending: false })

      return res.status(200).json({ alerts: alerts.data || [] })
    }

    if (req.method === 'POST') {
      const { type, title, description, severity, metadata } = req.body

      const { data: alert, error } = await supabaseAdmin
        .from('SecurityAlert')
        .insert([{
          type,
          title,
          description,
          severity,
          metadata: metadata ? JSON.stringify(metadata) : null
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create alert: ${error.message}`)
      }

      logger.warn('Security alert created', { 
        alertId: alert.id, 
        type, 
        severity 
      })

      return res.status(201).json({ alert })
    }

    if (req.method === 'PUT') {
      const { alertId, resolved } = req.body

      if (!alertId) {
        return res.status(400).json({ error: 'Alert ID is required' })
      }

      const updateData: any = {}
      
      if (resolved !== undefined) {
        updateData.resolved = resolved
        if (resolved) {
          updateData.resolvedAt = new Date()
          updateData.resolvedBy = session.user.email
        }
      }

      const alert = await prisma.securityAlert.update({
        where: { id: alertId },
        data: updateData
      })

      // Log the alert resolution
      await prisma.securityEvent.create({
        data: {
          type: 'alert_resolved',
          userId: session.user.id,
          userEmail: session.user.email,
          ipAddress: getClientIP(req),
          userAgent: req.headers['user-agent'] || 'Unknown',
          status: 'success',
          severity: 'low',
          details: `Alert resolved: ${alert.title}`
        }
      })

      logger.info('Security alert updated', { 
        alertId, 
        resolved, 
        updatedBy: session.user.email 
      })

      return res.status(200).json({ alert })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    logger.error('Security alerts API error', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.connection.remoteAddress
  return ip || '127.0.0.1'
}
