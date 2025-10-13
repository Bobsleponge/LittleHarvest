import { supabaseAdmin } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

export interface StockReservation {
  productId: string
  portionSizeId: string
  quantity: number
}

export interface StockCheckResult {
  available: boolean
  availableStock: number
  reservedStock: number
  totalStock: number
}

/**
 * Check if sufficient stock is available for a product/portion size combination
 */
export async function checkStockAvailability(
  productId: string, 
  portionSizeId: string, 
  requestedQuantity: number
): Promise<StockCheckResult> {
  try {
    const { data: inventory, error } = await supabaseAdmin
      .from('Inventory')
      .select('*')
      .eq('productId', productId)
      .eq('portionSizeId', portionSizeId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch inventory: ${error.message}`)
    }

    if (!inventory) {
      logger.warn('Inventory record not found', { productId, portionSizeId })
      return {
        available: false,
        availableStock: 0,
        reservedStock: 0,
        totalStock: 0
      }
    }

    const availableStock = inventory.currentStock - inventory.reservedStock
    const isAvailable = availableStock >= requestedQuantity

    logger.debug('Stock availability checked', {
      productId,
      portionSizeId,
      requestedQuantity,
      availableStock,
      reservedStock: inventory.reservedStock,
      totalStock: inventory.currentStock,
      isAvailable
    })

    return {
      available: isAvailable,
      availableStock,
      reservedStock: inventory.reservedStock,
      totalStock: inventory.currentStock
    }
  } catch (error) {
    logger.error('Error checking stock availability', {
      productId,
      portionSizeId,
      requestedQuantity,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return {
      available: false,
      availableStock: 0,
      reservedStock: 0,
      totalStock: 0
    }
  }
}

/**
 * Reserve stock for a pending order
 */
export async function reserveStock(reservations: StockReservation[]): Promise<boolean> {
  try {
    logger.info('Reserving stock for order', { reservations })

    // Check all stock availability first
    for (const reservation of reservations) {
      const stockCheck = await checkStockAvailability(
        reservation.productId,
        reservation.portionSizeId,
        reservation.quantity
      )
      
      if (!stockCheck.available) {
        logger.warn('Insufficient stock for reservation', {
          productId: reservation.productId,
          portionSizeId: reservation.portionSizeId,
          requestedQuantity: reservation.quantity,
          availableStock: stockCheck.availableStock
        })
        return false
      }
    }

    // Reserve stock for all items
    for (const reservation of reservations) {
      await prisma.inventory.update({
        where: {
          productId_portionSizeId: {
            productId: reservation.productId,
            portionSizeId: reservation.portionSizeId
          }
        },
        data: {
          reservedStock: {
            increment: reservation.quantity
          }
        }
      })
    }

    logger.info('Stock reserved successfully', { reservations })
    return true
  } catch (error) {
    logger.error('Error reserving stock', {
      reservations,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    return false
  }
}

/**
 * Release reserved stock (when order is cancelled or payment expires)
 */
export async function releaseStock(reservations: StockReservation[]): Promise<boolean> {
  try {
    logger.info('Releasing reserved stock', { reservations })

    for (const reservation of reservations) {
      await prisma.inventory.update({
        where: {
          productId_portionSizeId: {
            productId: reservation.productId,
            portionSizeId: reservation.portionSizeId
          }
        },
        data: {
          reservedStock: {
            decrement: reservation.quantity
          }
        }
      })
    }

    logger.info('Stock released successfully', { reservations })
    return true
  } catch (error) {
    logger.error('Error releasing stock', {
      reservations,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    return false
  }
}

/**
 * Confirm stock reservation (when order is paid and confirmed)
 */
export async function confirmStock(reservations: StockReservation[]): Promise<boolean> {
  try {
    logger.info('Confirming stock reservation', { reservations })

    for (const reservation of reservations) {
      await prisma.inventory.update({
        where: {
          productId_portionSizeId: {
            productId: reservation.productId,
            portionSizeId: reservation.portionSizeId
          }
        },
        data: {
          currentStock: {
            decrement: reservation.quantity
          },
          reservedStock: {
            decrement: reservation.quantity
          }
        }
      })
    }

    logger.info('Stock confirmed successfully', { reservations })
    return true
  } catch (error) {
    logger.error('Error confirming stock', {
      reservations,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    return false
  }
}

/**
 * Restock inventory (admin function)
 */
export async function restockInventory(
  productId: string,
  portionSizeId: string,
  additionalStock: number
): Promise<boolean> {
  try {
    logger.info('Restocking inventory', { productId, portionSizeId, additionalStock })

    await prisma.inventory.update({
      where: {
        productId_portionSizeId: {
          productId,
          portionSizeId
        }
      },
      data: {
        currentStock: {
          increment: additionalStock
        },
        lastRestocked: new Date()
      }
    })

    logger.info('Inventory restocked successfully', { productId, portionSizeId, additionalStock })
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
 * Get low stock alerts
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
