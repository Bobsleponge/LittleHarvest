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

    // Build date filter for Supabase
    const dateFilter = startDate && endDate ? {
      gte: startDate.toISOString(),
      lte: endDate.toISOString()
    } : undefined

    // Get basic metrics
    const [
      totalRevenueResult,
      totalOrdersResult,
      totalCustomersResult,
      averageOrderValueResult
    ] = await Promise.all([
      dateFilter ?
        supabaseAdmin.from('Order').select('totalZar')
          .gte('createdAt', dateFilter.gte)
          .lte('createdAt', dateFilter.lte) :
        supabaseAdmin.from('Order').select('totalZar'),
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
        supabaseAdmin.from('Order').select('totalZar')
          .gte('createdAt', dateFilter.gte)
          .lte('createdAt', dateFilter.lte) :
        supabaseAdmin.from('Order').select('totalZar')
    ])

    // Calculate totals
    const totalRevenue = totalRevenueResult.data?.reduce((sum, order) => sum + (order.totalZar || 0), 0) || 0
    const totalOrders = totalOrdersResult.count || 0
    const totalCustomers = totalCustomersResult.count || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get top products (mock for now - would need order items aggregation)
    const { data: topProducts, error: topProductsError } = await supabaseAdmin
      .from('Product')
      .select('id, name, imageUrl')
      .order('createdAt', { ascending: false })
      .limit(5)

    if (topProductsError) {
      throw new Error(`Failed to fetch top products: ${topProductsError.message}`)
    }

    // Get recent orders
    let recentOrdersQuery = supabaseAdmin
      .from('Order')
      .select(`
        *,
        user:User(name)
      `)
      .order('createdAt', { ascending: false })
      .limit(10)

    if (dateFilter) {
      recentOrdersQuery = recentOrdersQuery
        .gte('createdAt', dateFilter.gte)
        .lte('createdAt', dateFilter.lte)
    }

    const { data: recentOrders, error: recentOrdersError } = await recentOrdersQuery

    if (recentOrdersError) {
      throw new Error(`Failed to fetch recent orders: ${recentOrdersError.message}`)
    }

    // Get sales by month (mock for now - would need proper aggregation)
    const salesByMonth = [
      {
        month: new Date().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
        revenue: totalRevenue,
        orders: totalOrders
      }
    ]

    const analyticsData = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      conversionRate: 0, // Would need visitor tracking
      topProducts: (topProducts || []).map((product, index) => ({
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 10, // Mock sales data
        revenue: Math.floor(Math.random() * 2000) + 500, // Mock revenue
        image: product.imageUrl || '🍎'
      })),
      recentOrders: (recentOrders || []).map(order => ({
        id: order.id,
        customer: order.user?.name || 'Unknown Customer',
        amount: order.totalZar,
        date: order.createdAt.split('T')[0],
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
