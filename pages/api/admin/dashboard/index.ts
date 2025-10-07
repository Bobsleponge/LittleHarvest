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
        return await getDashboardData(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Admin dashboard API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      userId: session?.user?.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getDashboardData(req: NextApiRequest, res: NextApiResponse) {
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

    // Get basic counts
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalIngredients,
      pendingOrders,
      lowStockProducts,
      todayOrders,
      todayRevenue
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count({ where: dateFilter }),
      prisma.user.count({ where: { role: 'CUSTOMER', ...dateFilter } }),
      prisma.ingredient.count(),
      prisma.order.count({ where: { status: 'PENDING', ...dateFilter } }),
      prisma.product.count({ where: { isActive: true } }), // Mock low stock for now
      prisma.order.count({ 
        where: { 
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: now
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: now
          }
        },
        _sum: { totalZar: true }
      })
    ])

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: dateFilter,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          select: { quantity: true }
        }
      }
    })

    // Get recent activity (mock for now - would need activity log table)
    const recentActivity = [
      {
        id: '1',
        type: 'order' as const,
        message: 'System initialized - ready for orders',
        timestamp: new Date().toISOString(),
        status: 'info' as const
      }
    ]

    // Calculate derived metrics
    const totalRevenue = await prisma.order.aggregate({
      where: dateFilter,
      _sum: { totalZar: true }
    })

    const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.totalZar || 0) / totalOrders : 0
    const conversionRate = 0 // Would need visitor tracking

    const dashboardData = {
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalZar || 0,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        todayOrders,
        todayRevenue: todayRevenue._sum.totalZar || 0,
        conversionRate,
        averageOrderValue
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customerName: order.user?.name || 'Unknown Customer',
        customerEmail: order.user?.email || '',
        total: order.totalZar,
        status: order.status.toLowerCase(),
        date: order.createdAt.toISOString(),
        items: order.items.reduce((sum, item) => sum + item.quantity, 0)
      })),
      recentActivity
    }

    logger.info('Admin dashboard data fetched', { 
      dateRange,
      stats: dashboardData.stats
    })

    res.status(200).json(dashboardData)

  } catch (error) {
    logger.error('Get admin dashboard data error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
}
