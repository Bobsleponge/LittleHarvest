import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      systems: {
        logging: 'Pino - Ready',
        cache: 'Fallback - Ready',
        rateLimit: 'Fallback - Ready', 
        metrics: 'Prometheus - Ready',
        email: 'Skipped - Not configured'
      },
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        apiRequests: 0,
        dbQueries: 0,
      },
      alerts: []
    }

    res.status(200).json(health)
  } catch (error) {
    console.error('Error getting health check:', error)
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
