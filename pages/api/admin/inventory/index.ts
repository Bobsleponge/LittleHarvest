import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../../src/lib/csrf'

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    switch (req.method) {
      case 'GET':
        return await getInventory(req, res)
      case 'POST':
        return await updateInventory(req, res)
      case 'PUT':
        return await bulkUpdateInventory(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Inventory API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function getInventory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '50', lowStock = 'false' } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = Math.min(parseInt(limit as string, 10), 100)
    const skip = (pageNum - 1) * limitNum
    const showLowStock = lowStock === 'true'

    const where: any = {}
    if (showLowStock) {
      where.currentStock = {
        lte: 10 // Show items with stock <= 10
      }
    }

    const [inventory, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: {
            include: {
              ageGroup: true,
              texture: true
            }
          },
          portionSize: true
        },
        orderBy: [
          { currentStock: 'asc' }, // Low stock first
          { product: { name: 'asc' } }
        ],
        skip,
        take: limitNum
      }),
      prisma.inventory.count({ where })
    ])

    // Calculate low stock alerts
    const lowStockItems = await prisma.inventory.count({
      where: {
        currentStock: {
          lte: 10
        }
      }
    })

    const outOfStockItems = await prisma.inventory.count({
      where: {
        currentStock: {
          lte: 0
        }
      }
    })

    const transformedInventory = inventory.map(item => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        ageGroup: item.product.ageGroup.name,
        texture: item.product.texture.name
      },
      portionSize: {
        id: item.portionSize.id,
        name: item.portionSize.name,
        measurement: item.portionSize.measurement
      },
      currentStock: item.currentStock,
      reservedStock: item.reservedStock,
      weeklyLimit: item.weeklyLimit,
      availableStock: item.currentStock - item.reservedStock,
      lastRestocked: item.lastRestocked,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      stockStatus: item.currentStock <= 0 ? 'OUT_OF_STOCK' : 
                   item.currentStock <= 10 ? 'LOW_STOCK' : 'IN_STOCK'
    }))

    const totalPages = Math.ceil(totalCount / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    logger.info('Inventory retrieved', { 
      count: transformedInventory.length, 
      totalCount,
      lowStockItems,
      outOfStockItems,
      page: pageNum 
    })

    res.status(200).json({
      inventory: transformedInventory,
      summary: {
        totalItems: totalCount,
        lowStockItems,
        outOfStockItems,
        inStockItems: totalCount - lowStockItems
      },
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
    logger.error('Get inventory error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: 'Failed to retrieve inventory' })
  }
}

async function updateInventory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productId, portionSizeId, currentStock, weeklyLimit } = req.body

    if (!productId || !portionSizeId || currentStock === undefined) {
      return res.status(400).json({ error: 'productId, portionSizeId, and currentStock are required' })
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Update or create inventory record
    const inventory = await prisma.inventory.upsert({
      where: {
        productId_portionSizeId: {
          productId,
          portionSizeId
        }
      },
      update: {
        currentStock: parseInt(currentStock),
        weeklyLimit: weeklyLimit ? parseInt(weeklyLimit) : undefined,
        lastRestocked: new Date(),
        updatedAt: new Date()
      },
      create: {
        productId,
        portionSizeId,
        currentStock: parseInt(currentStock),
        weeklyLimit: weeklyLimit ? parseInt(weeklyLimit) : 0,
        reservedStock: 0,
        lastRestocked: new Date()
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

    logger.info('Inventory updated', {
      productId,
      portionSizeId,
      currentStock: inventory.currentStock,
      weeklyLimit: inventory.weeklyLimit
    })

    res.status(200).json({
      message: 'Inventory updated successfully',
      inventory: {
        id: inventory.id,
        product: {
          id: inventory.product.id,
          name: inventory.product.name,
          ageGroup: inventory.product.ageGroup.name,
          texture: inventory.product.texture.name
        },
        portionSize: {
          id: inventory.portionSize.id,
          name: inventory.portionSize.name,
          measurement: inventory.portionSize.measurement
        },
        currentStock: inventory.currentStock,
        reservedStock: inventory.reservedStock,
        weeklyLimit: inventory.weeklyLimit,
        availableStock: inventory.currentStock - inventory.reservedStock,
        lastRestocked: inventory.lastRestocked
      }
    })

  } catch (error) {
    logger.error('Update inventory error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body
    })
    res.status(500).json({ error: 'Failed to update inventory' })
  }
}

async function bulkUpdateInventory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { updates } = req.body

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' })
    }

    const results = []
    
    for (const update of updates) {
      const { productId, portionSizeId, currentStock, weeklyLimit } = update

      if (!productId || !portionSizeId || currentStock === undefined) {
        results.push({
          productId,
          portionSizeId,
          success: false,
          error: 'Missing required fields'
        })
        continue
      }

      try {
        const inventory = await prisma.inventory.upsert({
          where: {
            productId_portionSizeId: {
              productId,
              portionSizeId
            }
          },
          update: {
            currentStock: parseInt(currentStock),
            weeklyLimit: weeklyLimit ? parseInt(weeklyLimit) : undefined,
            lastRestocked: new Date(),
            updatedAt: new Date()
          },
          create: {
            productId,
            portionSizeId,
            currentStock: parseInt(currentStock),
            weeklyLimit: weeklyLimit ? parseInt(weeklyLimit) : 0,
            reservedStock: 0,
            lastRestocked: new Date()
          }
        })

        results.push({
          productId,
          portionSizeId,
          success: true,
          currentStock: inventory.currentStock,
          weeklyLimit: inventory.weeklyLimit
        })
      } catch (error) {
        results.push({
          productId,
          portionSizeId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    logger.info('Bulk inventory update completed', {
      totalUpdates: updates.length,
      successCount,
      failureCount
    })

    res.status(200).json({
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: updates.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    logger.error('Bulk update inventory error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body
    })
    res.status(500).json({ error: 'Failed to perform bulk inventory update' })
  }
}
