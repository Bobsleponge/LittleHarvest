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

    switch (req.method) {
      case 'GET':
        return await getIncidents(req, res)
      case 'POST':
        return await createIncident(req, res, session.user.id)
      case 'PUT':
        return await updateIncident(req, res, session.user.id)
      case 'DELETE':
        return await deleteIncident(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Security incidents API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method 
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getIncidents(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url!, `http://localhost:3000`)
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')
  const type = searchParams.get('type')
  const limit = searchParams.get('limit') || '50'
  const offset = searchParams.get('offset') || '0'

  const where: any = {}
  
  if (status && status !== 'all') {
    where.status = status
  }
  
  if (severity && severity !== 'all') {
    where.severity = severity
  }
  
  if (type && type !== 'all') {
    where.type = type
  }

  const [incidents, totalCount] = await Promise.all([
    prisma.securityIncident.findMany({
      where,
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    }),
    prisma.securityIncident.count({ where })
  ])

  // Transform incidents to include parsed JSON fields
  const transformedIncidents = incidents.map(incident => ({
    ...incident,
    affectedSystems: incident.affectedSystems ? JSON.parse(incident.affectedSystems) : [],
    indicators: incident.indicators ? JSON.parse(incident.indicators) : [],
    timeline: incident.timeline ? JSON.parse(incident.timeline) : [],
    evidence: incident.evidence ? JSON.parse(incident.evidence) : [],
    actions: incident.actions ? JSON.parse(incident.actions) : [],
    lessons: incident.lessons ? JSON.parse(incident.lessons) : []
  }))

  return res.status(200).json({
    incidents: transformedIncidents,
    totalCount,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      hasMore: parseInt(offset as string) + parseInt(limit as string) < totalCount
    }
  })
}

async function createIncident(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { 
    title, 
    description, 
    type, 
    severity, 
    priority,
    affectedSystems,
    indicators,
    evidence,
    eventId 
  } = req.body

  if (!title || !description || !type || !severity) {
    return res.status(400).json({ error: 'Title, description, type, and severity are required' })
  }

  try {
    // Generate incident ID
    const year = new Date().getFullYear()
    const count = await prisma.securityIncident.count({
      where: {
        incidentId: {
          startsWith: `INC-${year}`
        }
      }
    })
    const incidentId = `INC-${year}-${String(count + 1).padStart(3, '0')}`

    // Create incident
    const incident = await prisma.securityIncident.create({
      data: {
        incidentId,
        title,
        description,
        type,
        severity,
        status: 'open',
        priority: priority || 'p3',
        riskScore: calculateRiskScore(severity, type),
        source: 'manual',
        affectedSystems: affectedSystems ? JSON.stringify(affectedSystems) : null,
        indicators: indicators ? JSON.stringify(indicators) : null,
        timeline: JSON.stringify([{
          timestamp: new Date(),
          action: 'Incident Created',
          actor: 'Admin User',
          details: 'Manual incident creation'
        }]),
        evidence: evidence ? JSON.stringify(evidence) : null,
        actions: JSON.stringify(['Investigate incident', 'Gather evidence', 'Contain threat']),
        reportedBy: userId,
        detectedAt: new Date()
      }
    })

    // Link event if provided
    if (eventId) {
      await prisma.securityEvent.update({
        where: { id: eventId },
        data: { incidentId: incident.id }
      })
    }

    logger.info('Security incident created manually', {
      incidentId: incident.incidentId,
      type,
      severity,
      createdBy: userId
    })

    return res.status(201).json({ incident })
  } catch (error) {
    logger.error('Error creating security incident', { error: error instanceof Error ? error.message : 'Unknown error' })
    return res.status(500).json({ error: 'Failed to create incident' })
  }
}

async function updateIncident(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { incidentId } = req.query
  const { 
    status, 
    priority, 
    assignedTo, 
    actions, 
    evidence, 
    lessons,
    comment 
  } = req.body

  if (!incidentId) {
    return res.status(400).json({ error: 'Incident ID is required' })
  }

  try {
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'resolved') {
        updateData.resolvedAt = new Date()
      } else if (status === 'closed') {
        updateData.closedAt = new Date()
      }
    }
    
    if (priority) updateData.priority = priority
    if (assignedTo) updateData.assignedTo = assignedTo
    if (actions) updateData.actions = JSON.stringify(actions)
    if (evidence) updateData.evidence = JSON.stringify(evidence)
    if (lessons) updateData.lessons = JSON.stringify(lessons)

    // Add timeline entry for the update
    const incident = await prisma.securityIncident.findUnique({
      where: { id: incidentId as string }
    })

    if (incident) {
      const timeline = JSON.parse(incident.timeline || '[]')
      timeline.push({
        timestamp: new Date(),
        action: 'Incident Updated',
        actor: 'Admin User',
        details: `Status: ${status || 'unchanged'}, Priority: ${priority || 'unchanged'}`
      })
      updateData.timeline = JSON.stringify(timeline)
    }

    const updatedIncident = await prisma.securityIncident.update({
      where: { id: incidentId as string },
      data: updateData
    })

    // Add comment if provided
    if (comment) {
      await prisma.securityIncidentComment.create({
        data: {
          incidentId: incidentId as string,
          authorId: userId,
          content: comment,
          isInternal: false
        }
      })
    }

    logger.info('Security incident updated', {
      incidentId: updatedIncident.incidentId,
      status,
      priority,
      updatedBy: userId
    })

    return res.status(200).json({ incident: updatedIncident })
  } catch (error) {
    logger.error('Error updating security incident', { error: error instanceof Error ? error.message : 'Unknown error' })
    return res.status(500).json({ error: 'Failed to update incident' })
  }
}

async function deleteIncident(req: NextApiRequest, res: NextApiResponse) {
  const { incidentId } = req.query

  if (!incidentId) {
    return res.status(400).json({ error: 'Incident ID is required' })
  }

  try {
    await prisma.securityIncident.delete({
      where: { id: incidentId as string }
    })

    logger.info('Security incident deleted', { incidentId })

    return res.status(200).json({ success: true })
  } catch (error) {
    logger.error('Error deleting security incident', { error: error instanceof Error ? error.message : 'Unknown error' })
    return res.status(500).json({ error: 'Failed to delete incident' })
  }
}

function calculateRiskScore(severity: string, type: string): number {
  const severityScores: Record<string, number> = {
    'critical': 90,
    'high': 70,
    'medium': 50,
    'low': 30,
    'info': 10
  }

  const typeScores: Record<string, number> = {
    'malware': 20,
    'phishing': 15,
    'ddos': 25,
    'data_breach': 30,
    'unauthorized_access': 20,
    'suspicious_activity': 10,
    'failed_login': 5
  }

  return Math.min(100, (severityScores[severity] || 50) + (typeScores[type] || 0))
}
