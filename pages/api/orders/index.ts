import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../src/lib/csrf'
import { sendOrderNotification, OrderNotificationData } from '../../../src/lib/email'

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

    switch (req.method) {
      case 'GET':
        return await getOrders(req, res, userId)
      case 'POST':
        return await createOrder(req, res, userId)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Orders API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function getOrders(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { page = '1', limit = '10', status } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = Math.min(parseInt(limit as string, 10), 50)
    const skip = (pageNum - 1) * limitNum

    const where: any = { userId }
    if (status && status !== 'all') {
      where.status = status as string
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ])

    // Transform orders
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalZar: order.totalZar,
      notes: order.notes,
      deliveryDate: order.deliveryDate,
      paymentDueDate: order.paymentDueDate,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          imageUrl: item.product.imageUrl,
          ageGroup: item.product.ageGroup.name,
          texture: item.product.texture.name
        },
        portionSize: {
          id: item.portionSize.id,
          name: item.portionSize.name,
          measurement: item.portionSize.measurement
        },
        package: item.package ? {
          id: item.package.id,
          name: item.package.name,
          slug: item.package.slug
        } : null,
        quantity: item.quantity,
        unitPriceZar: item.unitPriceZar,
        lineTotalZar: item.lineTotalZar
      })),
      address: order.address ? {
        id: order.address.id,
        type: order.address.type,
        street: order.address.street,
        city: order.address.city,
        province: order.address.province,
        postalCode: order.address.postalCode,
        country: order.address.country
      } : null,
      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email
      }
    }))

    const totalPages = Math.ceil(totalCount / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    logger.info('Orders retrieved', { 
      userId, 
      count: transformedOrders.length, 
      totalCount,
      page: pageNum 
    })

    res.status(200).json({
      orders: transformedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    logger.error('Get orders error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId 
    })
    res.status(500).json({ error: 'Failed to retrieve orders' })
  }
}

async function createOrder(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      items, 
      addressId, 
      notes, 
      deliveryDate,
      customerInfo,
      deliveryInfo,
      paymentInfo
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' })
    }

    // Verify all items exist and are available
    const productIds = items.map(item => item.productId)
    
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        isActive: true 
      },
      include: {
        prices: {
          where: { isActive: true },
          include: { portionSize: true }
        },
        inventory: {
          include: { portionSize: true }
        }
      }
    })

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products are not available' })
    }

    // Validate stock availability for all items
    const stockValidation = []
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) continue
      
      const price = product.prices[0] // Use first available price
      if (!price) continue
      
      const inventory = product.inventory.find(inv => inv.portionSizeId === price.portionSizeId)
      const availableStock = inventory ? inventory.currentStock - inventory.reservedStock : 0
      
      if (availableStock < item.quantity) {
        stockValidation.push({
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: availableStock
        })
      }
    }

    if (stockValidation.length > 0) {
      const stockErrors = stockValidation.map(err => 
        `${err.productName}: requested ${err.requestedQuantity}, only ${err.availableStock} available`
      ).join('; ')
      
      return res.status(400).json({ 
        error: 'Insufficient stock', 
        details: stockErrors,
        stockIssues: stockValidation
      })
    }

    // Handle address - either use existing addressId or create new one from deliveryInfo
    let address = null
    if (addressId) {
      address = await prisma.address.findFirst({
        where: {
          id: addressId,
          profile: { userId }
        }
      })
      if (!address) {
        return res.status(400).json({ error: 'Address not found' })
      }
    } else if (deliveryInfo) {
      // Create new address from delivery info
      const profile = await prisma.profile.findFirst({
        where: { userId }
      })
      
      if (!profile) {
        return res.status(400).json({ error: 'User profile not found' })
      }

      address = await prisma.address.create({
        data: {
          profileId: profile.id,
          type: 'DELIVERY',
          street: deliveryInfo.address,
          city: deliveryInfo.city,
          province: 'Western Cape', // Default province
          postalCode: deliveryInfo.postalCode,
          country: 'South Africa'
        }
      })
    }

    // Calculate totals and validate pricing
    let totalZar = 0
    const orderItems = []

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return res.status(400).json({ 
          error: `Product not found: ${item.productId}` 
        })
      }
      
      // Use the first available price if no portionSizeId specified
      const price = product.prices[0]
      
      if (!price) {
        return res.status(400).json({ 
          error: `Product ${product.name} has no available pricing` 
        })
      }

      const lineTotal = price.amountZar * item.quantity
      totalZar += lineTotal

      orderItems.push({
        productId: item.productId,
        portionSizeId: price.portionSizeId,
        packageId: null,
        quantity: item.quantity,
        unitPriceZar: price.amountZar,
        lineTotalZar: lineTotal
      })
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Determine payment status based on payment method
    const paymentStatus = paymentInfo?.method === 'eft' ? 'PENDING' : 'PENDING'
    const paymentDueDate = paymentInfo?.method === 'eft' 
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for EFT
      : null // No due date for cash on delivery

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus,
        totalZar,
        notes: notes || deliveryInfo?.specialInstructions || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : (deliveryInfo?.deliveryDate ? new Date(deliveryInfo.deliveryDate) : null),
        paymentDueDate,
        addressId: address?.id || null,
        items: {
          create: orderItems
        }
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
        address: true
      }
    })

    // Deduct inventory for all order items
    for (const item of orderItems) {
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
              decrement: item.quantity
            },
            reservedStock: {
              increment: item.quantity
            },
            updatedAt: new Date()
          }
        })

        logger.info('Inventory updated', {
          productId: item.productId,
          portionSizeId: item.portionSizeId,
          quantityDeducted: item.quantity,
          orderId: order.id
        })
      } else {
        // Create inventory record if it doesn't exist
        await prisma.inventory.create({
          data: {
            productId: item.productId,
            portionSizeId: item.portionSizeId,
            currentStock: -item.quantity, // Negative stock indicates overselling
            reservedStock: item.quantity,
            weeklyLimit: 0,
            lastRestocked: new Date()
          }
        })

        logger.warn('Inventory record created with negative stock', {
          productId: item.productId,
          portionSizeId: item.portionSizeId,
          quantityDeducted: item.quantity,
          orderId: order.id
        })
      }
    }

    // Clear user's cart after successful order
    await prisma.cartItem.deleteMany({
      where: {
        cart: { userId }
      }
    })

    logger.info('Order created', { 
      userId, 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      totalZar: order.totalZar,
      itemCount: order.items.length 
    })

    // Send order confirmation email
    try {
      const emailData: OrderNotificationData = {
        orderNumber: order.orderNumber,
        customerName: order.user.name || 'Valued Customer',
        customerEmail: order.user.email,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalZar,
        deliveryDate: order.deliveryDate?.toISOString(),
        paymentDueDate: order.paymentDueDate?.toISOString(),
        items: order.items.map(item => ({
          productName: item.product.name,
          portionSize: item.portionSize.name,
          quantity: item.quantity,
          unitPrice: item.unitPriceZar,
          lineTotal: item.lineTotalZar,
        })),
        address: order.address ? {
          street: order.address.street,
          city: order.address.city,
          province: order.address.province,
          postalCode: order.address.postalCode,
        } : undefined,
      }

      const emailSent = await sendOrderNotification(emailData, 'confirmation')
      if (emailSent) {
        logger.info('Order confirmation email sent', { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          customerEmail: order.user.email 
        })
      } else {
        logger.warn('Failed to send order confirmation email', { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          customerEmail: order.user.email 
        })
      }
    } catch (emailError) {
      logger.error('Error sending order confirmation email', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      })
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderNumber: order.orderNumber,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalZar: order.totalZar,
        notes: order.notes,
        deliveryDate: order.deliveryDate,
        paymentDueDate: order.paymentDueDate,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            imageUrl: item.product.imageUrl,
            ageGroup: item.product.ageGroup.name,
            texture: item.product.texture.name
          },
          portionSize: {
            id: item.portionSize.id,
            name: item.portionSize.name,
            measurement: item.portionSize.measurement
          },
          package: item.package ? {
            id: item.package.id,
            name: item.package.name,
            slug: item.package.slug
          } : null,
          quantity: item.quantity,
          unitPriceZar: item.unitPriceZar,
          lineTotalZar: item.lineTotalZar
        })),
        address: order.address ? {
          id: order.address.id,
          type: order.address.type,
          street: order.address.street,
          city: order.address.city,
          province: order.address.province,
          postalCode: order.address.postalCode,
          country: order.address.country
        } : null
      }
    })

  } catch (error) {
    logger.error('Create order error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      body: req.body 
    })
    res.status(500).json({ error: 'Failed to create order' })
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `LH-${timestamp}-${random}`
}



