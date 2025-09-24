import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { releaseStock, StockReservation } from '@/lib/inventory'

/**
 * Process expired payment orders
 * This function should be called periodically (e.g., every hour via cron job)
 */
export async function processExpiredPayments(): Promise<{
  processed: number
  errors: number
}> {
  try {
    logger.info('Starting expired payment processing')

    // Find orders with expired payment due dates
    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        paymentDueDate: {
          lt: new Date() // Payment due date is in the past
        }
      },
      include: {
        items: {
          include: {
            product: true,
            portionSize: true
          }
        }
      }
    })

    logger.info('Found expired orders', { count: expiredOrders.length })

    let processed = 0
    let errors = 0

    for (const order of expiredOrders) {
      try {
        // Prepare stock reservations for release
        const stockReservations: StockReservation[] = order.items.map(item => ({
          productId: item.productId,
          portionSizeId: item.portionSizeId,
          quantity: item.quantity
        }))

        // Release stock reservation
        const stockReleased = await releaseStock(stockReservations)
        if (!stockReleased) {
          logger.error('Failed to release stock for expired order', { orderId: order.id })
          errors++
          continue
        }

        // Update order status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'EXPIRED',
            status: 'CANCELLED'
          }
        })

        logger.info('Expired order processed', { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          userId: order.userId
        })

        processed++

      } catch (error) {
        logger.error('Error processing expired order', {
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, error as Error)
        errors++
      }
    }

    logger.info('Expired payment processing completed', { processed, errors })

    return { processed, errors }

  } catch (error) {
    logger.error('Error in expired payment processing', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return { processed: 0, errors: 1 }
  }
}

/**
 * Get orders approaching payment deadline (within 2 hours)
 */
export async function getOrdersApproachingDeadline(): Promise<any[]> {
  try {
    const twoHoursFromNow = new Date()
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)

    const approachingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        paymentDueDate: {
          lte: twoHoursFromNow,
          gte: new Date() // Still valid (not expired yet)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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
        paymentDueDate: 'asc'
      }
    })

    logger.debug('Found orders approaching payment deadline', { 
      count: approachingOrders.length 
    })

    return approachingOrders

  } catch (error) {
    logger.error('Error getting orders approaching deadline', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return []
  }
}

/**
 * Get statistics about payment statuses
 */
export async function getPaymentStatistics(): Promise<{
  pending: number
  paid: number
  unpaid: number
  expired: number
  total: number
}> {
  try {
    const [pending, paid, unpaid, expired, total] = await Promise.all([
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { paymentStatus: 'UNPAID' } }),
      prisma.order.count({ where: { paymentStatus: 'EXPIRED' } }),
      prisma.order.count()
    ])

    return { pending, paid, unpaid, expired, total }

  } catch (error) {
    logger.error('Error getting payment statistics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return { pending: 0, paid: 0, unpaid: 0, expired: 0, total: 0 }
  }
}
