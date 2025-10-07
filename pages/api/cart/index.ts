import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../src/lib/csrf'
import { validateWithJoi, validationSchemas } from '../../../src/lib/joi-validation'

export default withAPIRateLimit(
  RATE_LIMITS.CART,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Cart API called:', req.method)
    console.log('Request headers:', req.headers)
    console.log('Request cookies:', req.headers.cookie)
    
    const session = await getServerSession(req, res, authOptions)
    console.log('Session from getServerSession:', session)
    
    if (!session?.user?.id) {
      console.log('No session or user ID found')
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userId = session.user.id
    console.log('User ID:', userId)

    switch (req.method) {
      case 'GET':
        return await getCart(req, res, userId)
      case 'POST':
        return await addToCart(req, res, userId)
      case 'PUT':
        return await updateCartItem(req, res, userId)
      case 'DELETE':
        return await removeFromCart(req, res, userId)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Cart API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getCart(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                ageGroup: true,
                texture: true,
                prices: {
                  where: { isActive: true },
                  include: { portionSize: true }
                }
              }
            },
            portionSize: true
          }
        }
      }
    })

    if (!cart) {
      // Check if user exists before creating cart
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found. Please log out and log in again.',
          code: 'USER_NOT_FOUND'
        })
      }
      
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  ageGroup: true,
                  texture: true,
                  prices: {
                    where: { isActive: true },
                    include: { portionSize: true }
                  }
                }
              },
              portionSize: true
            }
          }
        }
      })
    }

    // Transform cart items
    const cartItems = cart.items.map(item => {
      const price = item.product.prices.find(p => p.portionSizeId === item.portionSizeId)
      return {
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          imageUrl: item.product.imageUrl,
          ageGroup: item.product.ageGroup.name,
          texture: item.product.texture.name,
          contains: item.product.contains,
          mayContain: item.product.mayContain
        },
        portionSize: {
          id: item.portionSize.id,
          name: item.portionSize.name,
          description: item.portionSize.description,
          measurement: item.portionSize.measurement
        },
        quantity: item.quantity,
        unitPrice: price?.amountZar || 0,
        lineTotal: (price?.amountZar || 0) * item.quantity,
        addedAt: item.createdAt
      }
    })

    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    logger.info('Cart retrieved', { userId, itemCount, total })

    res.status(200).json({
      cart: {
        id: cart.id,
        items: cartItems,
        total,
        itemCount,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    })

  } catch (error) {
    logger.error('Get cart error', { error: error instanceof Error ? error.message : 'Unknown error', userId })
    res.status(500).json({ error: 'Failed to retrieve cart' })
  }
}

async function addToCart(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    console.log('addToCart called with userId:', userId)
    console.log('Request body:', req.body)
    
    logger.info('Cart add request', { userId, body: req.body })
    
    const validation = validateWithJoi(validationSchemas.cartItem)(req.body)
    if (!validation.success) {
      logger.error('Cart validation failed', { 
        userId, 
        body: req.body, 
        errors: validation.errors 
      })
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      })
    }

    const { productId, portionSizeId, quantity = 1, notes, childProfileId, shoppingMode } = validation.data
    
    // Clean up childProfileId - convert empty string to null
    const cleanChildProfileId = childProfileId && childProfileId.trim() !== '' ? childProfileId : null

    // Query the actual product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          where: { isActive: true },
          include: { portionSize: true }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Get the first available price/portion size
    const availablePrice = product.prices[0]
    if (!availablePrice) {
      return res.status(400).json({ error: 'Product has no available prices' })
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      // Check if user exists before creating cart
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found. Please log out and log in again.',
          code: 'USER_NOT_FOUND'
        })
      }
      
      cart = await prisma.cart.create({ data: { userId } })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_portionSizeId: {
          cartId: cart.id,
          productId: productId,
          portionSizeId: availablePrice.portionSizeId
        }
      }
    })

    if (existingItem) {
      // Update quantity and other fields
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity,
          notes: notes || existingItem.notes,
          childProfileId: cleanChildProfileId || existingItem.childProfileId,
          shoppingMode: shoppingMode || existingItem.shoppingMode
        },
        include: {
          product: {
            include: {
              ageGroup: true,
              texture: true
            }
          },
          portionSize: true
        }
      })

      logger.info('Cart item updated', { 
        userId, 
        productId, 
        portionSizeId, 
        newQuantity: updatedItem.quantity 
      })

      res.status(200).json({ 
        message: 'Item updated in cart',
        item: {
          id: updatedItem.id,
          product: updatedItem.product,
          portionSize: updatedItem.portionSize,
          quantity: updatedItem.quantity
        }
      })
    } else {
      // Add new item
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          portionSizeId: availablePrice.portionSizeId,
          quantity,
          notes: notes || null,
          childProfileId: cleanChildProfileId,
          shoppingMode: shoppingMode || 'family'
        },
        include: {
          product: {
            include: {
              ageGroup: true,
              texture: true
            }
          },
          portionSize: true
        }
      })

      logger.info('Item added to cart', { 
        userId, 
        productId, 
        portionSizeId, 
        quantity 
      })

      res.status(201).json({ 
        message: 'Item added to cart',
        item: {
          id: newItem.id,
          product: newItem.product,
          portionSize: newItem.portionSize,
          quantity: newItem.quantity
        }
      })
    }

  } catch (error) {
    console.error('addToCart error:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    logger.error('Add to cart error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      body: req.body 
    })
    res.status(500).json({ error: 'Failed to add item to cart' })
  }
}

async function updateCartItem(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validation = validateWithJoi(validationSchemas.cartItemUpdate)(req.body)
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      })
    }

    const { itemId, quantity } = validation.data

    // Get cart
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id
      }
    })

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' })
    }

    if (quantity <= 0) {
      // Remove item
      await prisma.cartItem.delete({ where: { id: itemId } })
      
      logger.info('Item removed from cart', { userId, itemId })
      
      res.status(200).json({ message: 'Item removed from cart' })
    } else {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: {
          product: {
            include: {
              ageGroup: true,
              texture: true
            }
          },
          portionSize: true
        }
      })

      logger.info('Cart item quantity updated', { 
        userId, 
        itemId, 
        newQuantity: quantity 
      })

      res.status(200).json({ 
        message: 'Cart item updated',
        item: {
          id: updatedItem.id,
          product: updatedItem.product,
          portionSize: updatedItem.portionSize,
          quantity: updatedItem.quantity
        }
      })
    }

  } catch (error) {
    logger.error('Update cart item error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      body: req.body 
    })
    res.status(500).json({ error: 'Failed to update cart item' })
  }
}

async function removeFromCart(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Try to get itemId from body first, then from query
    const { itemId } = req.body || req.query

    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    // Get cart
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id
      }
    })

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' })
    }

    // Remove item
    await prisma.cartItem.delete({ where: { id: itemId } })

    logger.info('Item removed from cart', { userId, itemId })

    res.status(200).json({ message: 'Item removed from cart' })

  } catch (error) {
    logger.error('Remove from cart error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      itemId: req.query.itemId 
    })
    res.status(500).json({ error: 'Failed to remove item from cart' })
  }
}



