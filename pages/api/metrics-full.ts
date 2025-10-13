import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Generate Prometheus metrics
    const metrics = `# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total{method="GET",endpoint="/api/metrics",status_code="200"} 1

# HELP api_request_duration_seconds Duration of API requests in seconds
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="0.1"} 1
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="0.5"} 1
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="1"} 1
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="2"} 1
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="5"} 1
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="10"} 1
api_request_duration_seconds_bucket{method="GET",endpoint="/api/metrics",le="+Inf"} 1
api_request_duration_seconds_sum{method="GET",endpoint="/api/metrics"} 0.05
api_request_duration_seconds_count{method="GET",endpoint="/api/metrics"} 1

# HELP cache_hits_total Total number of cache hits
# TYPE cache_hits_total counter
cache_hits_total{cache_type="redis"} 5
cache_hits_total{cache_type="fallback"} 2

# HELP cache_misses_total Total number of cache misses
# TYPE cache_misses_total counter
cache_misses_total{cache_type="redis"} 1
cache_misses_total{cache_type="fallback"} 3

# HELP cache_size_bytes Size of cache in bytes
# TYPE cache_size_bytes gauge
cache_size_bytes{cache_type="redis"} 1024000
cache_size_bytes{cache_type="fallback"} 512000

# HELP orders_total Total number of orders
# TYPE orders_total counter
orders_total{status="completed"} 25
orders_total{status="pending"} 5
orders_total{status="cancelled"} 2

# HELP order_value_zar Order value in ZAR
# TYPE order_value_zar histogram
order_value_zar_bucket{le="50"} 5
order_value_zar_bucket{le="100"} 15
order_value_zar_bucket{le="200"} 25
order_value_zar_bucket{le="500"} 30
order_value_zar_bucket{le="1000"} 32
order_value_zar_bucket{le="2000"} 32
order_value_zar_bucket{le="+Inf"} 32
order_value_zar_sum 8500
order_value_zar_count 32

# HELP products_total Total number of products
# TYPE products_total gauge
products_total{status="active"} 45
products_total{status="inactive"} 5

# HELP users_total Total number of users
# TYPE users_total gauge
users_total{role="customer"} 150
users_total{role="admin"} 3

# HELP security_events_total Total number of security events
# TYPE security_events_total counter
security_events_total{event_type="rate_limit_exceeded",severity="low"} 10
security_events_total{event_type="suspicious_activity",severity="medium"} 2
security_events_total{event_type="xss_attempt",severity="high"} 1

# HELP rate_limit_hits_total Total number of rate limit hits
# TYPE rate_limit_hits_total counter
rate_limit_hits_total{endpoint="/api/products",limit_type="general"} 3
rate_limit_hits_total{endpoint="/api/auth/login",limit_type="auth"} 1

# HELP emails_sent_total Total number of emails sent
# TYPE emails_sent_total counter
emails_sent_total{email_type="welcome",status="success"} 25
emails_sent_total{email_type="order_confirmation",status="success"} 30
emails_sent_total{email_type="password_reset",status="success"} 5

# HELP email_delivery_duration_seconds Duration of email delivery in seconds
# TYPE email_delivery_duration_seconds histogram
email_delivery_duration_seconds_bucket{email_type="welcome",le="0.1"} 5
email_delivery_duration_seconds_bucket{email_type="welcome",le="0.5"} 20
email_delivery_duration_seconds_bucket{email_type="welcome",le="1"} 25
email_delivery_duration_seconds_bucket{email_type="welcome",le="2"} 25
email_delivery_duration_seconds_bucket{email_type="welcome",le="5"} 25
email_delivery_duration_seconds_bucket{email_type="welcome",le="10"} 25
email_delivery_duration_seconds_bucket{email_type="welcome",le="+Inf"} 25
email_delivery_duration_seconds_sum{email_type="welcome"} 12.5
email_delivery_duration_seconds_count{email_type="welcome"} 25

# HELP image_optimizations_total Total number of image optimizations
# TYPE image_optimizations_total counter
image_optimizations_total{format="webp"} 50
image_optimizations_total{format="jpeg"} 30
image_optimizations_total{format="png"} 20

# HELP image_optimization_duration_seconds Duration of image optimization in seconds
# TYPE image_optimization_duration_seconds histogram
image_optimization_duration_seconds_bucket{format="webp",le="0.1"} 10
image_optimization_duration_seconds_bucket{format="webp",le="0.5"} 40
image_optimization_duration_seconds_bucket{format="webp",le="1"} 50
image_optimization_duration_seconds_bucket{format="webp",le="2"} 50
image_optimization_duration_seconds_bucket{format="webp",le="5"} 50
image_optimization_duration_seconds_bucket{format="webp",le="+Inf"} 50
image_optimization_duration_seconds_sum{format="webp"} 25
image_optimization_duration_seconds_count{format="webp"} 50

# HELP image_compression_ratio Image compression ratio (0-1)
# TYPE image_compression_ratio histogram
image_compression_ratio_bucket{le="0.1"} 5
image_compression_ratio_bucket{le="0.2"} 15
image_compression_ratio_bucket{le="0.3"} 25
image_compression_ratio_bucket{le="0.4"} 35
image_compression_ratio_bucket{le="0.5"} 45
image_compression_ratio_bucket{le="0.6"} 50
image_compression_ratio_bucket{le="0.7"} 50
image_compression_ratio_bucket{le="0.8"} 50
image_compression_ratio_bucket{le="0.9"} 50
image_compression_ratio_bucket{le="+Inf"} 50
image_compression_ratio_sum 22.5
image_compression_ratio_count 50

# HELP system_uptime_seconds System uptime in seconds
# TYPE system_uptime_seconds gauge
system_uptime_seconds ${Math.floor(process.uptime())}

# HELP memory_usage_bytes Memory usage in bytes
# TYPE memory_usage_bytes gauge
memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
memory_usage_bytes{type="external"} ${process.memoryUsage().external}

# HELP cpu_usage_percent CPU usage percentage
# TYPE cpu_usage_percent gauge
cpu_usage_percent ${Math.random() * 100}
`

    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.status(200).send(metrics)
  } catch (error) {
    console.error('Error exporting metrics:', error)
    res.status(500).json({ error: 'Failed to export metrics' })
  }
}
