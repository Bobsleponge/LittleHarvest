import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'

export default withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session: any = null
  
  try {
    // TEMPORARY: Allow public access for testing
    // TODO: Re-enable authentication in production
    session = await getServerSession(req, res, authOptions)

    // Skip authentication check for GET requests during development
    if (req.method === 'GET' && process.env.NODE_ENV === 'development') {
      // Allow public access for testing
    } else {
      if (!session?.user?.id) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })

      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' })
      }
    }

    switch (req.method) {
      case 'GET':
        return await getIngredients(req, res)
      case 'POST':
        return await createIngredient(req, res)
      case 'PUT':
        return await updateIngredient(req, res)
      case 'DELETE':
        return await deleteIngredient(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Admin ingredients API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      userId: session?.user?.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getIngredients(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    })

    // Transform the data to match frontend expectations
    const transformedIngredients = ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock,
      minStock: ingredient.minStock,
      maxStock: ingredient.maxStock,
      unitCost: ingredient.unitCost,
      supplier: ingredient.supplier,
      status: ingredient.status as 'active' | 'inactive',
      lastRestocked: ingredient.lastRestocked.toISOString().split('T')[0],
      notes: ingredient.notes || ''
    }))

    logger.info('Admin ingredients fetched', { 
      count: transformedIngredients.length
    })

    res.status(200).json({ 
      ingredients: transformedIngredients,
      count: transformedIngredients.length
    })

  } catch (error) {
    logger.error('Get admin ingredients error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to fetch ingredients' })
  }
}

async function createIngredient(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      name, 
      category, 
      unit, 
      currentStock, 
      minStock, 
      maxStock, 
      unitCost, 
      supplier, 
      status, 
      notes 
    } = req.body

    if (!name || !category || !unit || !supplier) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        category,
        unit,
        currentStock: parseFloat(currentStock) || 0,
        minStock: parseFloat(minStock) || 0,
        maxStock: parseFloat(maxStock) || 0,
        unitCost: parseFloat(unitCost) || 0,
        supplier,
        status: status || 'active',
        notes: notes || ''
      }
    })

    logger.info('Ingredient created', { 
      ingredientId: ingredient.id,
      name: ingredient.name
    })

    res.status(201).json({ ingredient })

  } catch (error) {
    logger.error('Create ingredient error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to create ingredient' })
  }
}

async function updateIngredient(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    const { 
      name, 
      category, 
      unit, 
      currentStock, 
      minStock, 
      maxStock, 
      unitCost, 
      supplier, 
      status, 
      notes 
    } = req.body

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ingredient ID' })
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        category,
        unit,
        currentStock: parseFloat(currentStock) || 0,
        minStock: parseFloat(minStock) || 0,
        maxStock: parseFloat(maxStock) || 0,
        unitCost: parseFloat(unitCost) || 0,
        supplier,
        status: status || 'active',
        notes: notes || '',
        lastRestocked: new Date()
      }
    })

    logger.info('Ingredient updated', { 
      ingredientId: ingredient.id,
      name: ingredient.name
    })

    res.status(200).json({ ingredient })

  } catch (error) {
    logger.error('Update ingredient error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to update ingredient' })
  }
}

async function deleteIngredient(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ingredient ID' })
    }

    await prisma.ingredient.delete({
      where: { id }
    })

    logger.info('Ingredient deleted', { 
      ingredientId: id
    })

    res.status(200).json({ message: 'Ingredient deleted successfully' })

  } catch (error) {
    logger.error('Delete ingredient error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to delete ingredient' })
  }
}
