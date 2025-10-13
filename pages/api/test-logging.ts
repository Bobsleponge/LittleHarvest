import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test logging with different levels
    console.log('INFO: Test log message')
    console.warn('WARN: Test warning message')
    console.error('ERROR: Test error message')
    
    // Test structured logging
    console.log(JSON.stringify({
      level: 'info',
      message: 'Structured log test',
      timestamp: new Date().toISOString(),
      context: { test: true }
    }))

    res.status(200).json({
      message: 'Logging test completed',
      timestamp: new Date().toISOString(),
      note: 'Check server console for log output'
    })
  } catch (error) {
    console.error('Logging test error:', error)
    res.status(500).json({ 
      error: 'Logging test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
