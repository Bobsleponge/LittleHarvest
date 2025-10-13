import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { supabaseAdmin } from '../../../../src/lib/supabaseClient'
import { logger } from '../../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'

export default withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session: any = null
  
  try {
    session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    switch (req.method) {
      case 'GET':
        return await getProducts(req, res)
      case 'POST':
        return await createProduct(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Admin products API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      userId: session?.user?.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch all products with their relationships for admin view
    const { data: products, error: productsError } = await supabaseAdmin
      .from('Product')
      .select(`
        *,
        ageGroup:AgeGroup(*),
        texture:Texture(*),
        prices:Price(
          *,
          portionSize:PortionSize(*)
        ),
        inventory:Inventory(*)
      `)
      .order('name', { ascending: true })

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    // Transform the data to match admin frontend expectations
    const transformedProducts = (products || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.prices?.[0]?.amountZar || 0,
      image: '🍎', // Default emoji, can be enhanced later
      imageUrl: product.imageUrl || '',
      ageGroup: product.ageGroup?.name || '',
      texture: product.texture?.name || '',
      category: 'Baby Food', // Default category, can be enhanced later
      stock: product.inventory?.[0]?.currentStock || 0,
      minStock: product.inventory?.[0]?.weeklyLimit || 10,
      maxStock: product.inventory?.[0]?.currentStock * 2 || 100,
      unitCost: product.prices?.[0]?.amountZar * 0.6 || 0, // Mock cost calculation
      supplier: 'Little Harvest', // Default supplier
      status: product.isActive ? 'active' : 'inactive',
      createdAt: product.createdAt.split('T')[0],
      updatedAt: product.updatedAt.split('T')[0],
      lastRestocked: product.updatedAt.split('T')[0],
      ingredients: product.contains ? product.contains.split(',').map(i => i.trim()) : [],
      allergens: product.mayContain ? product.mayContain.split(',').map(i => i.trim()) : [],
      nutritionInfo: { 
        calories: Math.floor(Math.random() * 100) + 50, // Mock nutrition data
        protein: Math.floor(Math.random() * 10) + 2,
        carbs: Math.floor(Math.random() * 20) + 10,
        fat: Math.floor(Math.random() * 5) + 1
      },
      tags: ['organic', 'fresh', 'nutritious'] // Default tags
    }))

    logger.info('Admin products fetched', { 
      count: transformedProducts.length
    })

    res.status(200).json({ 
      products: transformedProducts,
      count: transformedProducts.length
    })

  } catch (error) {
    logger.error('Get admin products error', { 
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

    const { data: product, error: productError } = await supabaseAdmin
      .from('Product')
      .insert([{
        name,
        slug,
        description,
        ageGroupId,
        textureId,
        contains: contains || '',
        mayContain: mayContain || '',
        imageUrl: imageUrl || '',
        isActive: true
      }])
      .select(`
        *,
        ageGroup:AgeGroup(*),
        texture:Texture(*),
        prices:Price(
          *,
          portionSize:PortionSize(*)
        )
      `)
      .single()

    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`)
    }

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
