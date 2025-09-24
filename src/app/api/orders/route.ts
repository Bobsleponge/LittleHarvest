import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, calculatePaymentDueDate } from '@/lib/order-utils'
import { reserveStock, StockReservation } from '@/lib/inventory'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
            portionSize: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { addressId, deliveryDate, notes } = await request.json()

    if (!addressId || !deliveryDate) {
      return NextResponse.json(
        { error: 'Address ID and delivery date are required' },
        { status: 400 }
      )
    }

    logger.info('Creating new order', { 
      userId: session.user.id, 
      addressId, 
      deliveryDate 
    })

    // Get cart items
    const cartResponse = await fetch(`${request.nextUrl.origin}/api/cart`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })

    if (!cartResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 400 }
      )
    }

    const cartData = await cartResponse.json()
    const cartItems = cartData.items || []

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Check stock availability and prepare reservations
    const stockReservations: StockReservation[] = cartItems.map((item: any) => ({
      productId: item.productId,
      portionSizeId: item.portionSizeId,
      quantity: item.quantity
    }))

    // Reserve stock
    const stockReserved = await reserveStock(stockReservations)
    if (!stockReserved) {
      return NextResponse.json(
        { error: 'Insufficient stock available for some items' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.lineTotal, 0)
    const shipping = subtotal > 200 ? 0 : 50
    const total = subtotal + shipping

    // Generate order number and payment due date
    const orderNumber = await generateOrderNumber()
    const paymentDueDate = calculatePaymentDueDate()

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        addressId,
        totalZar: total,
        notes,
        deliveryDate: new Date(deliveryDate),
        paymentDueDate,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    })

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map((item: any) =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            portionSizeId: item.portionSizeId,
            quantity: item.quantity,
            unitPriceZar: item.unitPrice,
            lineTotalZar: item.lineTotal,
          },
        })
      )
    )

    // Clear cart after successful order creation
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    }

    logger.info('Order created successfully', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      userId: session.user.id 
    })

    return NextResponse.json({
      order: {
        ...order,
        items: orderItems,
      },
    })
  } catch (error) {
    logger.error('Error creating order', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}