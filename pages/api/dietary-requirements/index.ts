import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../src/lib/csrf'

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    switch (req.method) {
      case 'GET':
        return await getDietaryRequirements(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Dietary requirements API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function getDietaryRequirements(req: NextApiRequest, res: NextApiResponse) {
  try {
    const dietaryRequirements = await prisma.dietaryRequirement.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    logger.info('Dietary requirements retrieved', { count: dietaryRequirements.length })

    res.status(200).json({ dietaryRequirements })

  } catch (error) {
    logger.error('Get dietary requirements error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to retrieve dietary requirements' })
  }
}
