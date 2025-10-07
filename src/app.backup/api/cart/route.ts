import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cartItemSchema, validateFormData } from '@/lib/validations'
import { cache, cacheKeys, CACHE_TTL } from '@/lib/cache'
import { withRateLimit, RATE_LIMITS, getRateLimitKey } from '@/lib/rate-limit'
import { logger, perfLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get from cache first
    const cacheKey = cacheKeys.userCart(session.user.id)
    const cachedCart = cache.get(cacheKey)
    if (cachedCart) {
      return NextResponse.json({ items: cachedCart })
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                ageGroup: {
                  select: { id: true, name: true, minMonths: true, maxMonths: true }
                },
                texture: {
                  select: { id: true, name: true }
                },
              },
            },
            portionSize: {
              select: { id: true, name: true, measurement: true }
            },
          },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  imageUrl: true,
                  ageGroup: true,
                  texture: true,
                },
              },
              portionSize: true,
            },
          },
        },
      })
    }

    // Transform cart items to match frontend expectations
    const cartItems = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      portionSizeId: item.portionSizeId,
      quantity: item.quantity,
      product: item.product,
      portionSize: item.portionSize,
      unitPrice: 0, // Will be calculated from prices
      lineTotal: 0, // Will be calculated
    }))

    // Get prices for cart items
    const cartItemsWithPrices = await Promise.all(
      cartItems.map(async (item) => {
        const price = await prisma.price.findUnique({
          where: {
            productId_portionSizeId: {
              productId: item.productId,
              portionSizeId: item.portionSizeId,
            },
          },
        })

        const unitPrice = price ? Number(price.amountZar) : 0
        const lineTotal = unitPrice * item.quantity

        return {
          ...item,
          unitPrice,
          lineTotal,
        }
      })
    )

            // Cache the result
            cache.set(cacheKey, cartItemsWithPrices, CACHE_TTL.USER_DATA)

            return NextResponse.json({ items: cartItemsWithPrices })
          } catch (error) {
            console.error('Error fetching cart:', error)
            return NextResponse.json(
              { error: 'Failed to fetch cart' },
              { status: 500 }
            )
          }
        }

export async function POST(request: NextRequest) {
  return perfLogger.timeAsync('cart:add', async () => {
    const session = await getServerSession(authOptions)
    
    try {

      if (!session?.user?.id) {
        logger.warn('Unauthorized cart access attempt')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      logger.info('Adding item to cart', { userId: session.user.id })

      // Apply rate limiting
      const rateLimitCheck = withRateLimit(
        RATE_LIMITS.CART,
        (req) => getRateLimitKey(req, session.user.id)
      )
      
      const rateLimitResponse = rateLimitCheck(request)
      if (rateLimitResponse) {
        logger.logSecurityEvent('rate_limit_exceeded', { 
          userId: session.user.id, 
          endpoint: 'cart:add' 
        })
        return rateLimitResponse
      }

    const body = await request.json()
    
    // Validate input data
    const validation = validateFormData(cartItemSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const { productId, portionSizeId, quantity } = validation.data!

    // Get product and price information
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          where: { 
            portionSizeId,
            isActive: true 
          },
          include: {
            portionSize: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const price = product.prices[0]
    if (!price) {
      return NextResponse.json(
        { error: 'Price not found for this portion size' },
        { status: 404 }
      )
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_portionSizeId: {
          cartId: cart.id,
          productId,
          portionSizeId,
        },
      },
    })

    let cartItem
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              ageGroup: true,
              texture: true,
            },
          },
          portionSize: true,
        },
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          portionSizeId,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              ageGroup: true,
              texture: true,
            },
          },
          portionSize: true,
        },
      })
    }

    const unitPrice = Number(price.amountZar)
    const lineTotal = unitPrice * cartItem.quantity

            const responseItem = {
              id: cartItem.id,
              productId: cartItem.productId,
              portionSizeId: cartItem.portionSizeId,
              quantity: cartItem.quantity,
              product: cartItem.product,
              portionSize: cartItem.portionSize,
              unitPrice,
              lineTotal,
            }

            // Invalidate cart cache
            cache.delete(cacheKeys.userCart(session.user.id))

            logger.logBusinessEvent('product_added_to_cart', session.user.id, {
              productId: responseItem.productId,
              portionSizeId: responseItem.portionSizeId,
              quantity: responseItem.quantity,
            })

            return NextResponse.json({ success: true, item: responseItem })
    } catch (error) {
      logger.error('Error adding to cart', { 
        userId: session?.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, error as Error)
      return NextResponse.json(
        { error: 'Failed to add to cart' },
        { status: 500 }
      )
    }
  }, { endpoint: 'cart:add' })
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (!itemId || !quantity) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    // Update cart item quantity
    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Invalidate cart cache
    cache.delete(cacheKeys.userCart(session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Remove cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    // Invalidate cart cache
    cache.delete(cacheKeys.userCart(session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}
