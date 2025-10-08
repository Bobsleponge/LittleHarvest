import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { SecurityIncidentResponseEngine } from '../../../../src/lib/security-incident-engine'

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

    const { incidentId, action, approved, reason } = req.body

    if (!incidentId || !action || typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get the incident with error handling
    let incident = null
    try {
      incident = await prisma.securityIncident.findUnique({
        where: { incidentId }
      })
    } catch (error) {
      logger.warn('SecurityIncident table not found')
      return res.status(404).json({ error: 'Security incident system not available' })
    }

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    // Create approval record with error handling
    let approval = null
    try {
      approval = await prisma.securityIncidentComment.create({
        data: {
          incidentId: incident.id,
          authorId: session.user.id,
          content: `Action ${approved ? 'APPROVED' : 'REJECTED'}: ${action}${reason ? ` - Reason: ${reason}` : ''}`,
          isInternal: true,
          metadata: JSON.stringify({
            type: 'action_approval',
            action,
            approved,
            reason,
            timestamp: new Date().toISOString()
          })
        }
      })
    } catch (error) {
      logger.warn('SecurityIncidentComment table not found')
      // Continue without creating comment record
    }

    // If approved, execute the action
    if (approved) {
      try {
        const engine = new SecurityIncidentResponseEngine()
        await engine.executeAutomatedResponse(incident, [action])
        
        // Update incident timeline with error handling
        try {
          const timeline = JSON.parse(incident.timeline || '[]')
          timeline.push({
            timestamp: new Date(),
            action: `Action Executed: ${action}`,
            actor: 'Admin User',
            details: `Action approved and executed by ${session.user.email}`
          })
          
          await prisma.securityIncident.update({
            where: { id: incident.id },
            data: { timeline: JSON.stringify(timeline) }
          })
        } catch (error) {
          logger.warn('Unable to update incident timeline')
        }

        logger.info('Security action executed', {
          incidentId: incident.incidentId,
          action,
          approvedBy: session.user.email
        })
      } catch (error) {
        logger.error('Failed to execute approved action', {
          incidentId: incident.incidentId,
          action,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        return res.status(500).json({ 
          error: 'Failed to execute action',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    logger.info('Security action approval processed', {
      incidentId: incident.incidentId,
      action,
      approved,
      approvedBy: session.user.email,
      reason
    })

    return res.status(200).json({
      success: true,
      approvalId: approval?.id || 'not-recorded',
      executed: approved,
      message: `Action ${approved ? 'approved and executed' : 'rejected'}`
    })

  } catch (error) {
    logger.error('Error processing action approval', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to process approval' })
  }
}
