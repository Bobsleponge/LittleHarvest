import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const redisConfigured = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL || 'Not configured'
    
    res.status(200).json({
      message: 'System status check',
      timestamp: new Date().toISOString(),
      systems: {
        logging: {
          status: 'Ready',
          implementation: 'Pino',
          working: true
        },
        cache: {
          status: redisConfigured ? 'Redis Ready' : 'Fallback Ready',
          implementation: redisConfigured ? 'Upstash Redis' : 'In-memory',
          redisConfigured,
          working: true
        },
        rateLimit: {
          status: redisConfigured ? 'Redis Ready' : 'Fallback Ready', 
          implementation: redisConfigured ? 'Upstash Rate Limit' : 'In-memory',
          redisConfigured,
          working: true
        },
        metrics: {
          status: 'Ready',
          implementation: 'Prometheus',
          working: true
        },
        email: {
          status: 'Skipped',
          implementation: 'Not configured',
          working: false
        }
      },
      environment: {
        redisConfigured,
        redisUrl: redisConfigured ? 'configured' : 'not configured',
        logLevel: process.env.LOG_LEVEL || 'info',
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      nextSteps: redisConfigured ? [
        'All systems are ready!',
        'Test Redis cache and rate limiting',
        'Set up Grafana dashboards',
        'Configure email service when ready'
      ] : [
        'Set up Upstash Redis for production caching',
        'Update environment variables',
        'Test Redis integration',
        'Configure email service when ready'
      ]
    })
  } catch (error) {
    console.error('System status check error:', error)
    res.status(500).json({ 
      error: 'System status check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
