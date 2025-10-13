import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Simple in-memory cache test
    const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
    
    // Test set
    const testData = { message: 'Hello World', timestamp: new Date().toISOString() }
    cache.set('test-key', {
      data: testData,
      timestamp: Date.now(),
      ttl: 60000 // 1 minute
    })
    
    // Test get
    const cached = cache.get('test-key')
    const isValid = cached && (Date.now() - cached.timestamp) < cached.ttl
    
    // Test stats
    const stats = {
      size: cache.size,
      isValid,
      data: cached?.data
    }
    
    res.status(200).json({
      message: 'Cache test completed',
      timestamp: new Date().toISOString(),
      stats,
      note: 'Using simple in-memory cache for testing'
    })
  } catch (error) {
    console.error('Cache test error:', error)
    res.status(500).json({ 
      error: 'Cache test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
