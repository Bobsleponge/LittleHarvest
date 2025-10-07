import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Get low stock alerts for products that need restocking
 */
export async function getLowStockAlerts(threshold: number = 5): Promise<any[]> {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        currentStock: {
          lte: threshold
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        },
        portionSize: {
          select: {
            id: true,
            name: true,
            measurement: true
          }
        }
      }
    })

    logger.debug('Low stock alerts retrieved', { 
      threshold, 
      alertCount: lowStockItems.length 
    })

    return lowStockItems
  } catch (error) {
    logger.error('Error getting low stock alerts', {
      threshold,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    return []
  }
}

/**
 * Restock inventory for a specific product/portion size combination
 */
export async function restockInventory(
  productId: string,
  portionSizeId: string,
  additionalStock: number,
  weeklyLimit?: number
): Promise<boolean> {
  try {
    logger.info('Restocking inventory', { 
      productId, 
      portionSizeId, 
      additionalStock, 
      weeklyLimit 
    })

    const updateData: any = {
      currentStock: {
        increment: additionalStock
      },
      lastRestocked: new Date()
    }

    if (weeklyLimit !== undefined) {
      updateData.weeklyLimit = weeklyLimit
    }

    await prisma.inventory.update({
      where: {
        productId_portionSizeId: {
          productId,
          portionSizeId
        }
      },
      data: updateData
    })

    logger.info('Inventory restocked successfully', { 
      productId, 
      portionSizeId, 
      additionalStock 
    })

    return true
  } catch (error) {
    logger.error('Error restocking inventory', {
      productId,
      portionSizeId,
      additionalStock,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    return false
  }
}

/**
 * Bulk restock multiple inventory items
 */
export async function bulkRestockInventory(restockItems: Array<{
  productId: string
  portionSizeId: string
  additionalStock: number
  weeklyLimit?: number
}>): Promise<{ success: number; errors: number }> {
  try {
    logger.info('Starting bulk restock', { itemCount: restockItems.length })

    let success = 0
    let errors = 0

    for (const item of restockItems) {
      const restocked = await restockInventory(
        item.productId,
        item.portionSizeId,
        item.additionalStock,
        item.weeklyLimit
      )

      if (restocked) {
        success++
      } else {
        errors++
      }
    }

    logger.info('Bulk restock completed', { success, errors })

    return { success, errors }
  } catch (error) {
    logger.error('Error in bulk restock', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return { success: 0, errors: 1 }
  }
}

/**
 * Get inventory statistics
 */
export async function getInventoryStatistics(): Promise<{
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalCurrentStock: number
  totalReservedStock: number
  totalWeeklyLimit: number
}> {
  try {
    const [
      totalItems,
      lowStockItems,
      outOfStockItems,
      stockTotals
    ] = await Promise.all([
      prisma.inventory.count(),
      prisma.inventory.count({ where: { currentStock: { lte: 5 } } }),
      prisma.inventory.count({ where: { currentStock: { lte: 0 } } }),
      prisma.inventory.aggregate({
        _sum: {
          currentStock: true,
          reservedStock: true,
          weeklyLimit: true
        }
      })
    ])

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalCurrentStock: stockTotals._sum.currentStock || 0,
      totalReservedStock: stockTotals._sum.reservedStock || 0,
      totalWeeklyLimit: stockTotals._sum.weeklyLimit || 0
    }
  } catch (error) {
    logger.error('Error getting inventory statistics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return {
      totalItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalCurrentStock: 0,
      totalReservedStock: 0,
      totalWeeklyLimit: 0
    }
  }
}

/**
 * Get inventory items that need weekly restocking
 */
export async function getWeeklyRestockItems(): Promise<any[]> {
  try {
    // Get items where current stock is below 30% of weekly limit
    const restockItems = await prisma.inventory.findMany({
      where: {
        weeklyLimit: {
          gt: 0
        },
        currentStock: {
          lt: 10 // Low stock threshold
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        },
        portionSize: {
          select: {
            id: true,
            name: true,
            measurement: true
          }
        }
      }
    })

    // Filter items that need restocking (current stock < 30% of weekly limit)
    const itemsNeedingRestock = restockItems.filter(item => {
      const restockThreshold = item.weeklyLimit * 0.3
      return item.currentStock < restockThreshold
    })

    logger.debug('Weekly restock items retrieved', { 
      count: itemsNeedingRestock.length 
    })

    return itemsNeedingRestock
  } catch (error) {
    logger.error('Error getting weekly restock items', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return []
  }
}

/**
 * Create inventory record for a new product/portion size combination
 */
export async function createInventoryRecord(
  productId: string,
  portionSizeId: string,
  initialStock: number = 0,
  weeklyLimit: number = 0
): Promise<boolean> {
  try {
    logger.info('Creating inventory record', { 
      productId, 
      portionSizeId, 
      initialStock, 
      weeklyLimit 
    })

    await prisma.inventory.create({
      data: {
        productId,
        portionSizeId,
        currentStock: initialStock,
        weeklyLimit,
        reservedStock: 0,
        lastRestocked: new Date()
      }
    })

    logger.info('Inventory record created successfully', { 
      productId, 
      portionSizeId 
    })

    return true
  } catch (error) {
    logger.error('Error creating inventory record', {
      productId,
      portionSizeId,
      initialStock,
      weeklyLimit,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}

/**
 * Update weekly limits for inventory items
 */
export async function updateWeeklyLimits(
  updates: Array<{
    inventoryId: string
    weeklyLimit: number
  }>
): Promise<{ success: number; errors: number }> {
  try {
    logger.info('Updating weekly limits', { updateCount: updates.length })

    let success = 0
    let errors = 0

    for (const update of updates) {
      try {
        await prisma.inventory.update({
          where: { id: update.inventoryId },
          data: { weeklyLimit: update.weeklyLimit }
        })
        success++
      } catch (error) {
        logger.error('Error updating weekly limit', {
          inventoryId: update.inventoryId,
          weeklyLimit: update.weeklyLimit,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, error as Error)
        errors++
      }
    }

    logger.info('Weekly limits updated', { success, errors })

    return { success, errors }
  } catch (error) {
    logger.error('Error in weekly limits update', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return { success: 0, errors: 1 }
  }
}
