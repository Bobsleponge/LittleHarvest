import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Simple metrics in Prometheus format
    const metrics = `# HELP test_metric A test metric
# TYPE test_metric counter
test_metric{label="value"} 1

# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total{method="GET",endpoint="/api/metrics",status_code="200"} 1

# HELP system_uptime_seconds System uptime in seconds
# TYPE system_uptime_seconds gauge
system_uptime_seconds 3600
`

    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    res.status(200).send(metrics)
  } catch (error) {
    console.error('Error exporting metrics:', error)
    res.status(500).json({ error: 'Failed to export metrics' })
  }
}
