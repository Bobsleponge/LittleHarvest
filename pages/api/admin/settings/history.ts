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

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { category, key, limit = '50', offset = '0' } = req.query

    const whereClause: any = {}
    if (category) whereClause.category = category as string
    if (key) whereClause.key = key as string

    const history = await prisma.settingsHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await prisma.settingsHistory.count({
      where: whereClause
    })

    logger.info('Settings history retrieved', { 
      userId: session.user.id,
      category,
      key,
      count: history.length 
    })

    return res.status(200).json({ 
      success: true, 
      history,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + history.length < total
      }
    })

  } catch (error) {
    logger.error('Settings history API error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
