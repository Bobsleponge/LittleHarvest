import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized orders access attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    logger.info('Admin fetching orders', { 
      userId: session.user.id, 
      limit, 
      status 
    })

    // Build where clause for status filter
    const whereClause = status ? { status } : {}

    // Get orders with user and order items
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            },
            portionSize: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Transform the data
    const transformedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalZar: order.totalZar,
      createdAt: order.createdAt.toISOString(),
      deliveryDate: order.deliveryDate?.toISOString(),
      user: order.user,
      address: order.address,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: item.product,
        portionSize: item.portionSize
      }))
    }))

    logger.info('Orders fetched successfully', { 
      userId: session.user.id, 
      orderCount: transformedOrders.length 
    })

    return NextResponse.json({
      orders: transformedOrders,
      total: transformedOrders.length
    })

  } catch (error) {
    logger.error('Error fetching orders', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized order update attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    logger.info('Admin updating order status', { 
      userId: session.user.id, 
      orderId, 
      status 
    })

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    logger.info('Order status updated successfully', { 
      userId: session.user.id, 
      orderId, 
      newStatus: status 
    })

    return NextResponse.json({
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        totalZar: updatedOrder.totalZar,
        createdAt: updatedOrder.createdAt.toISOString(),
        user: updatedOrder.user
      }
    })

  } catch (error) {
    logger.error('Error updating order status', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}