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
    const { data: ingredients, error: ingredientsError } = await supabaseAdmin
      .from('Ingredient')
      .select('*')
      .order('name', { ascending: true })

    if (ingredientsError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientsError.message}`)
    }

    // Transform the data to match frontend expectations
    const transformedIngredients = (ingredients || []).map(ingredient => ({
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
      lastRestocked: ingredient.lastRestocked ? ingredient.lastRestocked.split('T')[0] : '',
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

    const { data: ingredient, error: createError } = await supabaseAdmin
      .from('Ingredient')
      .insert([{
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
      }])
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create ingredient: ${createError.message}`)
    }

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

    const { data: ingredient, error: updateError } = await supabaseAdmin
      .from('Ingredient')
      .update({
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
        lastRestocked: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update ingredient: ${updateError.message}`)
    }

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

    const { error: deleteError } = await supabaseAdmin
      .from('Ingredient')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error(`Failed to delete ingredient: ${deleteError.message}`)
    }

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
