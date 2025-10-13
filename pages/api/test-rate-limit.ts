import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Simple rate limiting test
    const rateLimits = new Map<string, { count: number; resetTime: number }>()
    const key = req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || '127.0.0.1'
    const limit = 5
    const windowMs = 60000 // 1 minute
    
    const now = Date.now()
    const entry = rateLimits.get(key)
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      res.status(200).json({
        message: 'Rate limit test - Request allowed',
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: limit - 1,
          resetTime: new Date(now + windowMs).toISOString(),
          limit
        }
      })
    } else if (entry.count >= limit) {
      // Rate limit exceeded
      res.status(429).json({
        error: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: 0,
          resetTime: new Date(entry.resetTime).toISOString(),
          limit
        }
      })
    } else {
      // Increment counter
      entry.count++
      rateLimits.set(key, entry)
      
      res.status(200).json({
        message: 'Rate limit test - Request allowed',
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: limit - entry.count,
          resetTime: new Date(entry.resetTime).toISOString(),
          limit
        }
      })
    }
  } catch (error) {
    console.error('Rate limit test error:', error)
    res.status(500).json({ 
      error: 'Rate limit test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
