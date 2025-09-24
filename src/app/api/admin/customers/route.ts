import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized customers access attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Admin fetching customers', { userId: session.user.id })

    // Get all users with their orders and addresses
    const customers = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalZar: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        address: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include calculated fields
    const customersWithStats = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
      createdAt: customer.createdAt.toISOString(),
      lastLoginAt: customer.lastLoginAt?.toISOString(),
      address: customer.address,
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.totalZar, 0),
      orders: customer.orders
    }))

    logger.info('Customers fetched successfully', { 
      userId: session.user.id, 
      customerCount: customersWithStats.length 
    })

    return NextResponse.json({
      customers: customersWithStats,
      total: customersWithStats.length
    })

  } catch (error) {
    logger.error('Error fetching customers', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
