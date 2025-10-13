import { NextApiRequest, NextApiResponse } from 'next'
import { getHealthCheck } from '../../src/lib/metrics-prometheus'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const health = await getHealthCheck()
    
    // Set appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503
    
    res.status(statusCode).json(health)
  } catch (error) {
    console.error('Error getting health check:', error)
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      metrics: {
        uptime: 0,
        memoryUsage: 0,
        apiRequests: 0,
        dbQueries: 0,
      },
      alerts: ['Health check service unavailable']
    })
  }
}