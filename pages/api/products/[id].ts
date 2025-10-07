import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'

export default withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    // Allow public access for GET requests (viewing individual products)
    if (req.method === 'GET') {
      return await getProduct(req, res)
    }
    
    // Require authentication for other methods
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    switch (req.method) {
      case 'PUT':
        return await updateProduct(req, res, id)
      case 'DELETE':
        return await deleteProduct(req, res, id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Product API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      productId: req.query.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getProduct(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    // Fetch product with its relationships
    const product = await prisma.product.findUnique({
      where: { 
        id: id,
        isActive: true 
      },
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          where: { isActive: true },
          include: { portionSize: true }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Transform the data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.prices[0]?.amountZar || 0,
      image: '🍎', // Default emoji, can be enhanced later
      imageUrl: product.imageUrl || '',
      ageGroup: product.ageGroup?.name || '',
      texture: product.texture?.name || '',
      ingredients: product.contains ? product.contains.split(',').map(i => i.trim()) : [],
      stock: 25, // Mock stock for now, can be enhanced with inventory
      category: 'Baby Food' // Default category, can be enhanced later
    }

    logger.info('Product fetched', { 
      productId: id
    })

    res.status(200).json({ 
      product: transformedProduct
    })

  } catch (error) {
    logger.error('Get product error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      productId: id
    })
    res.status(500).json({ error: 'Failed to fetch product' })
  }
}
