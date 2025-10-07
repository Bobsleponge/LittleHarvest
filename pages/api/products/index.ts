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
    
    // Allow public access for GET requests (viewing products)
    if (req.method === 'GET') {
      return await getProducts(req, res)
    }
    
    // Require authentication for other methods
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    switch (req.method) {
      case 'POST':
        return await createProduct(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Products API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch products with their relationships
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          where: { isActive: true },
          include: { portionSize: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to match frontend expectations
    const transformedProducts = products.map(product => ({
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
    }))

    logger.info('Products fetched', { 
      count: transformedProducts.length
    })

    res.status(200).json({ 
      products: transformedProducts,
      count: transformedProducts.length
    })

  } catch (error) {
    logger.error('Get products error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}

async function createProduct(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, ageGroupId, textureId, contains, mayContain, imageUrl } = req.body

    if (!name || !ageGroupId || !textureId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        ageGroupId,
        textureId,
        contains: contains || '',
        mayContain: mayContain || '',
        imageUrl: imageUrl || '',
        isActive: true
      },
      include: {
        ageGroup: true,
        texture: true,
        prices: {
          include: { portionSize: true }
        }
      }
    })

    logger.info('Product created', { 
      productId: product.id,
      name: product.name
    })

    res.status(201).json({ product })

  } catch (error) {
    logger.error('Create product error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to create product' })
  }
}