import { NextApiRequest, NextApiResponse } from 'next'
import { metricsCollector } from '../../src/lib/metrics-prometheus'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Set appropriate headers for Prometheus metrics
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    // Export metrics in Prometheus format
    const metrics = await metricsCollector.exportMetrics()
    
    res.status(200).send(metrics)
  } catch (error) {
    console.error('Error exporting metrics:', error)
    res.status(500).json({ error: 'Failed to export metrics' })
  }
}
