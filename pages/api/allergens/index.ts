import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { supabaseAdmin } from '../../../src/lib/supabaseClient'
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
        return await getAllergens(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Allergens API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function getAllergens(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: allergens, error: allergensError } = await supabaseAdmin
      .from('Allergen')
      .select('*')
      .eq('isActive', true)
      .order('name', { ascending: true })

    if (allergensError) {
      throw new Error(`Failed to fetch allergens: ${allergensError.message}`)
    }

    logger.info('Allergens retrieved', { count: allergens?.length || 0 })

    res.status(200).json({ allergens: allergens || [] })

  } catch (error) {
    logger.error('Get allergens error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to retrieve allergens' })
  }
}
