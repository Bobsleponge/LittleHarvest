import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { SecurityIncidentResponseEngine } from '../../../../src/lib/security-incident-engine'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'POST':
        return await analyzeEvent(req, res, session.user.id)
      case 'GET':
        return await getAnalysisHistory(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Security analysis API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method 
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function analyzeEvent(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { eventId, createIncident } = req.body

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' })
  }

  try {
    // Get the security event
    const event = await prisma.securityEvent.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return res.status(404).json({ error: 'Security event not found' })
    }

    // Create a new security engine instance
    const securityEngine = new SecurityIncidentResponseEngine()
    
    // Analyze the event using the security engine
    const analysis = await securityEngine.analyzeSecurityEvent(event)

    // Create incident if requested and analysis recommends it
    let incident = null
    if (createIncident && analysis.shouldCreateIncident) {
      const incidentResponse = await securityEngine.createIncident(event, analysis, userId)
      
      // Get the created incident
      incident = await prisma.securityIncident.findUnique({
        where: { incidentId: incidentResponse.incidentId }
      })
    }

    // Log the analysis
    logger.info('Security event analyzed', {
      eventId,
      threatType: analysis.threatType,
      severity: analysis.severity,
      riskScore: analysis.riskScore,
      shouldCreateIncident: analysis.shouldCreateIncident,
      incidentCreated: !!incident
    })

    return res.status(200).json({
      analysis,
      incident,
      recommendations: {
        immediate: analysis.recommendedActions.slice(0, 3),
        followUp: analysis.recommendedActions.slice(3),
        playbook: analysis.playbookId
      }
    })
  } catch (error) {
    logger.error('Error analyzing security event', { 
      eventId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to analyze event' })
  }
}

async function getAnalysisHistory(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url!, `http://localhost:3000`)
  const limit = searchParams.get('limit') || '20'
  const offset = searchParams.get('offset') || '0'

  try {
    // Get recent security events with their analysis results
    const events = await prisma.securityEvent.findMany({
      where: {
        incidentId: { not: null } // Only events that have been analyzed and linked to incidents
      },
      include: {
        incident: {
          select: {
            incidentId: true,
            title: true,
            severity: true,
            status: true,
            riskScore: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    // Transform events to include analysis summary
    const analysisHistory = events.map(event => ({
      eventId: event.id,
      type: event.type,
      severity: event.severity,
      ipAddress: event.ipAddress,
      userEmail: event.userEmail,
      createdAt: event.createdAt,
      analysis: event.incident ? {
        incidentId: event.incident.incidentId,
        title: event.incident.title,
        severity: event.incident.severity,
        status: event.incident.status,
        riskScore: event.incident.riskScore,
        analyzedAt: event.incident.createdAt
      } : null
    }))

    return res.status(200).json({ analysisHistory })
  } catch (error) {
    logger.error('Error getting analysis history', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to get analysis history' })
  }
}
