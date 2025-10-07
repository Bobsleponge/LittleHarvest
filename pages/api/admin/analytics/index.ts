import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'

export default withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session: any = null
  
  try {
    session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    switch (req.method) {
      case 'GET':
        return await getAnalyticsData(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Admin analytics API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      userId: session?.user?.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getAnalyticsData(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { dateRange = 'all' } = req.query
    
    // Calculate date filters
    const now = new Date()
    let startDate: Date | undefined
    let endDate: Date | undefined = now

    switch (dateRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = undefined
        endDate = undefined
        break
    }

    // Build date filter for Prisma
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    } : {}

    // Get basic metrics
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue
    ] = await Promise.all([
      prisma.order.aggregate({
        where: dateFilter,
        _sum: { totalZar: true }
      }),
      prisma.order.count({ where: dateFilter }),
      prisma.user.count({ where: { role: 'CUSTOMER', ...dateFilter } }),
      prisma.order.aggregate({
        where: dateFilter,
        _avg: { totalZar: true }
      })
    ])

    // Get top products (mock for now - would need order items aggregation)
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    })

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: dateFilter,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    // Get sales by month (mock for now - would need proper aggregation)
    const salesByMonth = [
      {
        month: new Date().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
        revenue: totalRevenue._sum.totalZar || 0,
        orders: totalOrders
      }
    ]

    const analyticsData = {
      totalRevenue: totalRevenue._sum.totalZar || 0,
      totalOrders,
      totalCustomers,
      averageOrderValue: averageOrderValue._avg.totalZar || 0,
      conversionRate: 0, // Would need visitor tracking
      topProducts: topProducts.map((product, index) => ({
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 10, // Mock sales data
        revenue: Math.floor(Math.random() * 2000) + 500, // Mock revenue
        image: product.imageUrl || '🍎'
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customer: order.user?.name || 'Unknown Customer',
        amount: order.totalZar,
        date: order.createdAt.toISOString().split('T')[0],
        status: order.status.toLowerCase()
      })),
      salesByMonth
    }

    logger.info('Admin analytics data fetched', { 
      dateRange,
      totalRevenue: analyticsData.totalRevenue,
      totalOrders: analyticsData.totalOrders
    })

    res.status(200).json(analyticsData)

  } catch (error) {
    logger.error('Get admin analytics data error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
}
