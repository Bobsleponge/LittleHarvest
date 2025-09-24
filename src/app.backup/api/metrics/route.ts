import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { metrics } from '@/lib/metrics'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only allow admin users to access metrics
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized metrics access attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const minutes = parseInt(searchParams.get('minutes') || '60')
    const format = searchParams.get('format') || 'summary'

    logger.info('Metrics requested', { 
      userId: session.user.id, 
      minutes, 
      format 
    })

    if (format === 'export') {
      // Export full metrics data
      const metricsData = metrics.exportMetrics()
      return new NextResponse(metricsData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="metrics-${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }

    if (format === 'health') {
      // Health check endpoint
      const health = metrics.getHealthCheck()
      return NextResponse.json(health)
    }

    // Default: summary format
    const summary = metrics.getMetricsSummary(minutes)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      period: `${minutes} minutes`,
      metrics: summary,
    })

  } catch (error) {
    logger.error('Error fetching metrics', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
