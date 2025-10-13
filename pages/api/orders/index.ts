import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { supabaseAdmin } from '../../../src/lib/supabaseClient'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../src/lib/csrf'
import { sendOrderNotificationWithCheck, sendAdminNotificationWithCheck } from '../../../src/lib/notification-service'

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

    // Build Supabase query
    let query = supabaseAdmin
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          product:Product(
            *,
            ageGroup:AgeGroup(*),
            texture:Texture(*)
          ),
          portionSize:PortionSize(*),
          package:Package(*)
        ),
        address:Address(*),
        user:User(id, name, email)
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(skip, skip + limitNum - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status as string)
    }

    const { data: orders, error: ordersError } = await query

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`)
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('Order')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status as string)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      throw new Error(`Failed to count orders: ${countError.message}`)
    }

    // Transform orders
    const transformedOrders = (orders || []).map(order => ({
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

    const totalPages = Math.ceil((totalCount || 0) / limitNum)
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
        totalCount: totalCount || 0,
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
    
    const { data: products, error: productsError } = await supabaseAdmin
      .from('Product')
      .select(`
        *,
        prices:Price(
          *,
          portionSize:PortionSize(*)
        ),
        inventory:Inventory(
          *,
          portionSize:PortionSize(*)
        )
      `)
      .in('id', productIds)
      .eq('isActive', true)

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products are not available' })
    }

    // Validate stock availability for all items
    const stockValidation = []
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) continue
      
      // Filter active prices
      const activePrices = product.prices?.filter((p: any) => p.isActive) || []
      const price = activePrices[0] // Use first available price
      if (!price) continue
      
      const inventory = product.inventory?.find((inv: any) => inv.portionSizeId === price.portionSizeId)
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
      const { data: addressData, error: addressError } = await supabaseAdmin
        .from('Address')
        .select(`
          *,
          profile:Profile(*)
        `)
        .eq('id', addressId)
        .eq('profile.userId', userId)
        .single()
      
      if (addressError) {
        return res.status(400).json({ error: 'Address not found' })
      }
      address = addressData
    } else if (deliveryInfo) {
      // Create new address from delivery info
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('Profile')
        .select('*')
        .eq('userId', userId)
        .single()
      
      if (profileError) {
        return res.status(400).json({ error: 'User profile not found' })
      }

      const { data: addressData, error: addressCreateError } = await supabaseAdmin
        .from('Address')
        .insert([{
          profileId: profile.id,
          type: 'DELIVERY',
          street: deliveryInfo.address,
          city: deliveryInfo.city,
          province: 'Western Cape', // Default province
          postalCode: deliveryInfo.postalCode,
          country: 'South Africa'
        }])
        .select()
        .single()

      if (addressCreateError) {
        throw new Error(`Failed to create address: ${addressCreateError.message}`)
      }
      address = addressData
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
      
      // Filter active prices and use the first available price if no portionSizeId specified
      const activePrices = product.prices?.filter((p: any) => p.isActive) || []
      const price = activePrices[0]
      
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

    // Create order first
    const { data: order, error: orderError } = await supabaseAdmin
      .from('Order')
      .insert([{
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus,
        totalZar,
        notes: notes || deliveryInfo?.specialInstructions || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : (deliveryInfo?.deliveryDate ? new Date(deliveryInfo.deliveryDate).toISOString() : null),
        paymentDueDate: paymentDueDate ? paymentDueDate.toISOString() : null,
        addressId: address?.id || null
      }])
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      orderId: order.id
    }))

    const { data: createdItems, error: itemsError } = await supabaseAdmin
      .from('OrderItem')
      .insert(orderItemsWithOrderId)
      .select(`
        *,
        product:Product(
          *,
          ageGroup:AgeGroup(*),
          texture:Texture(*)
        ),
        portionSize:PortionSize(*),
        package:Package(*)
      `)

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Fetch the complete order with all relationships
    const { data: completeOrder, error: completeOrderError } = await supabaseAdmin
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          product:Product(
            *,
            ageGroup:AgeGroup(*),
            texture:Texture(*)
          ),
          portionSize:PortionSize(*),
          package:Package(*)
        ),
        address:Address(*),
        user:User(id, name, email)
      `)
      .eq('id', order.id)
      .single()

    if (completeOrderError) {
      throw new Error(`Failed to fetch complete order: ${completeOrderError.message}`)
    }

    // Deduct inventory for all order items
    for (const item of orderItems) {
      const { data: inventory, error: inventoryError } = await supabaseAdmin
        .from('Inventory')
        .select('*')
        .eq('productId', item.productId)
        .eq('portionSizeId', item.portionSizeId)
        .single()

      if (inventoryError && inventoryError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch inventory: ${inventoryError.message}`)
      }

      if (inventory) {
        const { error: updateError } = await supabaseAdmin
          .from('Inventory')
          .update({
            currentStock: inventory.currentStock - item.quantity,
            reservedStock: inventory.reservedStock + item.quantity,
            updatedAt: new Date().toISOString()
          })
          .eq('productId', item.productId)
          .eq('portionSizeId', item.portionSizeId)

        if (updateError) {
          throw new Error(`Failed to update inventory: ${updateError.message}`)
        }

        logger.info('Inventory updated', {
          productId: item.productId,
          portionSizeId: item.portionSizeId,
          quantityDeducted: item.quantity,
          orderId: order.id
        })
      } else {
        // Create inventory record if it doesn't exist
        const { error: createError } = await supabaseAdmin
          .from('Inventory')
          .insert([{
            productId: item.productId,
            portionSizeId: item.portionSizeId,
            currentStock: -item.quantity, // Negative stock indicates overselling
            reservedStock: item.quantity,
            weeklyLimit: 0,
            lastRestocked: new Date().toISOString()
          }])

        if (createError) {
          throw new Error(`Failed to create inventory: ${createError.message}`)
        }

        logger.warn('Inventory record created with negative stock', {
          productId: item.productId,
          portionSizeId: item.portionSizeId,
          quantityDeducted: item.quantity,
          orderId: order.id
        })
      }
    }

    // Clear user's cart after successful order
    const { error: cartError } = await supabaseAdmin
      .from('CartItem')
      .delete()
      .eq('cart.userId', userId)

    if (cartError) {
      logger.warn('Failed to clear cart after order', {
        userId,
        orderId: order.id,
        error: cartError.message
      })
    }

    logger.info('Order created', { 
      userId, 
      orderId: completeOrder.id, 
      orderNumber: completeOrder.orderNumber,
      totalZar: completeOrder.totalZar,
      itemCount: completeOrder.items.length 
    })

    // Send order confirmation email
    try {
      const emailData: OrderNotificationData = {
        orderNumber: completeOrder.orderNumber,
        customerName: completeOrder.user.name || 'Valued Customer',
        customerEmail: completeOrder.user.email,
        orderStatus: completeOrder.status,
        paymentStatus: completeOrder.paymentStatus,
        totalAmount: completeOrder.totalZar,
        deliveryDate: completeOrder.deliveryDate,
        paymentDueDate: completeOrder.paymentDueDate,
        items: completeOrder.items.map(item => ({
          productName: item.product.name,
          portionSize: item.portionSize.name,
          quantity: item.quantity,
          unitPrice: item.unitPriceZar,
          lineTotal: item.lineTotalZar,
        })),
        address: completeOrder.address ? {
          street: completeOrder.address.street,
          city: completeOrder.address.city,
          province: completeOrder.address.province,
          postalCode: completeOrder.address.postalCode,
        } : undefined,
      }

      // Send order confirmation email with notification settings check
      const emailResult = await sendOrderNotificationWithCheck(emailData, 'confirmation')
      if (emailResult.success) {
        logger.info('Order confirmation email sent', { 
          orderId: completeOrder.id, 
          orderNumber: completeOrder.orderNumber,
          customerEmail: completeOrder.user.email 
        })
      } else {
        logger.info('Order confirmation email skipped', { 
          orderId: completeOrder.id, 
          orderNumber: completeOrder.orderNumber,
          reason: emailResult.reason 
        })
      }

      // Send admin notification for new order
      const adminResult = await sendAdminNotificationWithCheck('newOrderAlerts', {
        orderId: completeOrder.id,
        orderNumber: completeOrder.orderNumber,
        customerName: completeOrder.user.name,
        total: completeOrder.totalZar,
        adminEmail: process.env.ADMIN_EMAIL || 'admin@tinytastes.co.za'
      })
      
      if (adminResult.success) {
        logger.info('Admin new order notification sent', { 
          orderId: completeOrder.id, 
          orderNumber: completeOrder.orderNumber
        })
      } else {
        logger.info('Admin new order notification skipped', { 
          orderId: completeOrder.id, 
          orderNumber: completeOrder.orderNumber,
          reason: adminResult.reason 
        })
      }
    } catch (emailError) {
      logger.error('Error sending order confirmation email', {
        orderId: completeOrder.id,
        orderNumber: completeOrder.orderNumber,
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      })
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderNumber: completeOrder.orderNumber,
      order: {
        id: completeOrder.id,
        orderNumber: completeOrder.orderNumber,
        status: completeOrder.status,
        paymentStatus: completeOrder.paymentStatus,
        totalZar: completeOrder.totalZar,
        notes: completeOrder.notes,
        deliveryDate: completeOrder.deliveryDate,
        paymentDueDate: completeOrder.paymentDueDate,
        createdAt: completeOrder.createdAt,
        items: completeOrder.items.map(item => ({
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
        address: completeOrder.address ? {
          id: completeOrder.address.id,
          type: completeOrder.address.type,
          street: completeOrder.address.street,
          city: completeOrder.address.city,
          province: completeOrder.address.province,
          postalCode: completeOrder.address.postalCode,
          country: completeOrder.address.country
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



