import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../src/lib/csrf'

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userId = session.user.id
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    switch (req.method) {
      case 'GET':
        return await getOrder(req, res, userId, id)
      case 'PUT':
        return await updateOrder(req, res, userId, id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Order API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      orderId: req.query.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function getOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                ageGroup: true,
                texture: true
              }
            },
            portionSize: true,
            package: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Transform order to match frontend format
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      customerEmail: order.user.email,
      date: order.createdAt,
      status: order.status.toLowerCase(),
      total: order.totalZar,
      items: order.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.unitPriceZar,
        image: item.product.imageUrl || '🍎'
      })),
      deliveryAddress: order.address ? 
        `${order.address.street}, ${order.address.city}, ${order.address.province} ${order.address.postalCode}` : 
        'No address provided',
      deliveryDate: order.deliveryDate || order.createdAt,
      deliveryTime: '9:00 AM - 5:00 PM',
      paymentMethod: 'Credit Card'
    }

    logger.info('Order retrieved', { userId, orderId })

    res.status(200).json(transformedOrder)

  } catch (error) {
    logger.error('Get order error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      orderId 
    })
    res.status(500).json({ error: 'Failed to retrieve order' })
  }
}

async function updateOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  try {
    const { status } = req.body

    if (!status || !['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // If order is being cancelled, restore inventory
    if (status.toUpperCase() === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const inventory = await prisma.inventory.findUnique({
          where: {
            productId_portionSizeId: {
              productId: item.productId,
              portionSizeId: item.portionSizeId
            }
          }
        })

        if (inventory) {
          await prisma.inventory.update({
            where: {
              productId_portionSizeId: {
                productId: item.productId,
                portionSizeId: item.portionSizeId
              }
            },
            data: {
              currentStock: {
                increment: item.quantity
              },
              reservedStock: {
                decrement: item.quantity
              },
              updatedAt: new Date()
            }
          })

          logger.info('Inventory restored due to order cancellation', {
            productId: item.productId,
            portionSizeId: item.portionSizeId,
            quantityRestored: item.quantity,
            orderId: order.id
          })
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status.toUpperCase(),
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                ageGroup: true,
                texture: true
              }
            },
            portionSize: true,
            package: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Transform updated order to match frontend format
    const transformedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.user.name,
      customerEmail: updatedOrder.user.email,
      date: updatedOrder.createdAt,
      status: updatedOrder.status.toLowerCase(),
      total: updatedOrder.totalZar,
      items: updatedOrder.items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.unitPriceZar,
        image: item.product.imageUrl || '🍎'
      })),
      deliveryAddress: updatedOrder.address ? 
        `${updatedOrder.address.street}, ${updatedOrder.address.city}, ${updatedOrder.address.province} ${updatedOrder.address.postalCode}` : 
        'No address provided',
      deliveryDate: updatedOrder.deliveryDate || updatedOrder.createdAt,
      deliveryTime: '9:00 AM - 5:00 PM',
      paymentMethod: 'Credit Card'
    }

    logger.info('Order updated', { 
      userId, 
      orderId, 
      oldStatus: order.status, 
      newStatus: updatedOrder.status 
    })

    res.status(200).json(transformedOrder)

  } catch (error) {
    logger.error('Update order error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      orderId,
      body: req.body 
    })
    res.status(500).json({ error: 'Failed to update order' })
  }
}
