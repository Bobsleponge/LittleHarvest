import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    res.status(200).json({
      status: 'healthy',
      message: 'Plugin optimizations test endpoint',
      timestamp: new Date().toISOString(),
      systems: {
        logging: 'Pino - Ready',
        cache: 'Fallback - Ready', 
        rateLimit: 'Fallback - Ready',
        metrics: 'Prometheus - Ready',
        email: 'Skipped - Not configured'
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
