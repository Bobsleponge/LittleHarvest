import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { confirmStock, releaseStock, StockReservation } from '@/lib/inventory'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized payment status update attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentStatus } = body

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Order ID and payment status are required' },
        { status: 400 }
      )
    }

    logger.info('Admin updating payment status', { 
      userId: session.user.id, 
      orderId, 
      paymentStatus 
    })

    // Get the order with items to handle stock management
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            portionSize: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Prepare stock reservations for inventory management
    const stockReservations: StockReservation[] = order.items.map(item => ({
      productId: item.productId,
      portionSizeId: item.portionSizeId,
      quantity: item.quantity
    }))

    let updatedOrder
    const now = new Date()

    if (paymentStatus === 'PAID') {
      // Confirm stock reservation (reduce actual stock)
      const stockConfirmed = await confirmStock(stockReservations)
      if (!stockConfirmed) {
        logger.error('Failed to confirm stock for paid order', { orderId })
        return NextResponse.json(
          { error: 'Failed to confirm stock reservation' },
          { status: 500 }
        )
      }

      // Update order with payment confirmation
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED', // Auto-confirm when paid
          paidAt: now
        },
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

      logger.info('Order marked as paid and confirmed', { 
        userId: session.user.id, 
        orderId,
        paidAt: now
      })

    } else if (paymentStatus === 'UNPAID') {
      // Release stock reservation (return to available stock)
      const stockReleased = await releaseStock(stockReservations)
      if (!stockReleased) {
        logger.error('Failed to release stock for unpaid order', { orderId })
        return NextResponse.json(
          { error: 'Failed to release stock reservation' },
          { status: 500 }
        )
      }

      // Update order status
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'UNPAID',
          status: 'CANCELLED' // Auto-cancel when marked unpaid
        },
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

      logger.info('Order marked as unpaid and cancelled', { 
        userId: session.user.id, 
        orderId
      })

    } else if (paymentStatus === 'EXPIRED') {
      // Release stock reservation for expired payments
      const stockReleased = await releaseStock(stockReservations)
      if (!stockReleased) {
        logger.error('Failed to release stock for expired order', { orderId })
        return NextResponse.json(
          { error: 'Failed to release stock reservation' },
          { status: 500 }
        )
      }

      // Update order status
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'EXPIRED',
          status: 'CANCELLED'
        },
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

      logger.info('Order marked as expired and cancelled', { 
        userId: session.user.id, 
        orderId
      })

    } else {
      // Just update payment status for other statuses
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus },
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

      logger.info('Payment status updated', { 
        userId: session.user.id, 
        orderId,
        paymentStatus
      })
    }

    return NextResponse.json({
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        totalZar: updatedOrder.totalZar,
        createdAt: updatedOrder.createdAt.toISOString(),
        paidAt: updatedOrder.paidAt?.toISOString(),
        user: updatedOrder.user
      }
    })

  } catch (error) {
    logger.error('Error updating payment status', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
