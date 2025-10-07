import { NextApiRequest, NextApiResponse } from 'next'
import { CSRFProtection } from '../../src/lib/csrf'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../src/lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // In development, allow CSRF token generation without authentication
    // In production, you might want to require authentication
    if (process.env.NODE_ENV === 'production') {
      const session = getServerSession(req, res, authOptions)
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' })
      }
    }

    // Generate and return CSRF token
    CSRFProtection.createTokenEndpoint(req, res)
  } catch (error) {
    console.error('CSRF token generation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

