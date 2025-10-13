import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { supabaseAdmin } from '../../../../src/lib/supabaseClient'
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
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || user?.role !== 'ADMIN') {
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

    // Build date filter for Supabase
    const dateFilter = startDate && endDate ? {
      gte: startDate.toISOString(),
      lte: endDate.toISOString()
    } : undefined

    // Get basic counts
    const [
      totalProductsResult,
      totalOrdersResult,
      totalCustomersResult,
      pendingOrdersResult,
      lowStockProductsResult,
      todayOrdersResult,
      todayRevenueResult
    ] = await Promise.all([
      supabaseAdmin.from('Product').select('*', { count: 'exact', head: true }),
      dateFilter ? 
        supabaseAdmin.from('Order').select('*', { count: 'exact', head: true })
          .gte('createdAt', dateFilter.gte)
          .lte('createdAt', dateFilter.lte) :
        supabaseAdmin.from('Order').select('*', { count: 'exact', head: true }),
      dateFilter ?
        supabaseAdmin.from('User').select('*', { count: 'exact', head: true })
          .eq('role', 'CUSTOMER')
          .gte('createdAt', dateFilter.gte)
          .lte('createdAt', dateFilter.lte) :
        supabaseAdmin.from('User').select('*', { count: 'exact', head: true })
          .eq('role', 'CUSTOMER'),
      dateFilter ?
        supabaseAdmin.from('Order').select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING')
          .gte('createdAt', dateFilter.gte)
          .lte('createdAt', dateFilter.lte) :
        supabaseAdmin.from('Order').select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING'),
      supabaseAdmin.from('Product').select('*', { count: 'exact', head: true })
        .eq('isActive', true), // Mock low stock for now
      supabaseAdmin.from('Order').select('*', { count: 'exact', head: true })
        .gte('createdAt', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString())
        .lte('createdAt', now.toISOString()),
      supabaseAdmin.from('Order').select('totalZar')
        .gte('createdAt', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString())
        .lte('createdAt', now.toISOString())
    ])

    // Calculate today's revenue
    const todayRevenue = todayRevenueResult.data?.reduce((sum, order) => sum + (order.totalZar || 0), 0) || 0

    const totalProducts = totalProductsResult.count || 0
    const totalOrders = totalOrdersResult.count || 0
    const totalCustomers = totalCustomersResult.count || 0
    const pendingOrders = pendingOrdersResult.count || 0
    const lowStockProducts = lowStockProductsResult.count || 0
    const todayOrders = todayOrdersResult.count || 0

    // Get recent orders
    let recentOrdersQuery = supabaseAdmin
      .from('Order')
      .select(`
        *,
        user:User(name, email),
        items:OrderItem(quantity)
      `)
      .order('createdAt', { ascending: false })
      .limit(5)

    if (dateFilter) {
      recentOrdersQuery = recentOrdersQuery
        .gte('createdAt', dateFilter.gte)
        .lte('createdAt', dateFilter.lte)
    }

    const { data: recentOrders, error: recentOrdersError } = await recentOrdersQuery

    if (recentOrdersError) {
      throw new Error(`Failed to fetch recent orders: ${recentOrdersError.message}`)
    }

    // Get total revenue for date range
    let totalRevenueQuery = supabaseAdmin
      .from('Order')
      .select('totalZar')

    if (dateFilter) {
      totalRevenueQuery = totalRevenueQuery
        .gte('createdAt', dateFilter.gte)
        .lte('createdAt', dateFilter.lte)
    }

    const { data: totalRevenueData, error: totalRevenueError } = await totalRevenueQuery

    if (totalRevenueError) {
      throw new Error(`Failed to fetch total revenue: ${totalRevenueError.message}`)
    }

    const totalRevenue = totalRevenueData?.reduce((sum, order) => sum + (order.totalZar || 0), 0) || 0

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
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const conversionRate = 0 // Would need visitor tracking

    const dashboardData = {
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        todayOrders,
        todayRevenue,
        conversionRate,
        averageOrderValue
      },
      recentOrders: (recentOrders || []).map(order => ({
        id: order.id,
        customerName: order.user?.name || 'Unknown Customer',
        customerEmail: order.user?.email || '',
        total: order.totalZar,
        status: order.status.toLowerCase(),
        date: order.createdAt,
        items: order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
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
