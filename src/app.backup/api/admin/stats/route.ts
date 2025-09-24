import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all stats in parallel
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalZar: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      prisma.product.count({
        where: { isActive: true },
      }),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.order.count({
        where: { status: 'COMPLETED' },
      }),
    ])

    const stats = {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalZar || 0),
      totalCustomers,
      totalProducts,
      pendingOrders,
      completedOrders,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
