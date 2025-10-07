import { NextApiRequest, NextApiResponse } from 'next'
import { ContentSecurityPolicy } from '../../src/lib/csp'
import { logger } from '../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await ContentSecurityPolicy.handleViolationReport(req, res)
    
    // Log the violation for monitoring
    logger.warn('CSP Violation', {
      violation: req.body,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('CSP violation report error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Internal server error' })
  }
}

