import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized inventory access attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const lowStock = searchParams.get('lowStock') === 'true'

    logger.info('Admin fetching inventory', { 
      userId: session.user.id, 
      productId, 
      lowStock 
    })

    // Build where clause
    const whereClause: any = {}
    if (productId) {
      whereClause.productId = productId
    }
    if (lowStock) {
      whereClause.currentStock = { lte: 5 } // Low stock threshold
    }

    const inventory = await prisma.inventory.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { currentStock: 'asc' }, // Show low stock first
        { product: { name: 'asc' } }
      ]
    })

    logger.info('Inventory fetched successfully', { 
      userId: session.user.id, 
      inventoryCount: inventory.length 
    })

    return NextResponse.json({ inventory })

  } catch (error) {
    logger.error('Error fetching inventory', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized inventory creation attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, portionSizeId, currentStock, weeklyLimit } = body

    if (!productId || !portionSizeId || currentStock === undefined || weeklyLimit === undefined) {
      return NextResponse.json(
        { error: 'Product ID, portion size ID, current stock, and weekly limit are required' },
        { status: 400 }
      )
    }

    logger.info('Admin creating inventory record', { 
      userId: session.user.id, 
      productId, 
      portionSizeId, 
      currentStock, 
      weeklyLimit 
    })

    // Check if inventory record already exists
    const existingInventory = await prisma.inventory.findUnique({
      where: {
        productId_portionSizeId: {
          productId,
          portionSizeId
        }
      }
    })

    if (existingInventory) {
      return NextResponse.json(
        { error: 'Inventory record already exists for this product and portion size' },
        { status: 400 }
      )
    }

    const inventory = await prisma.inventory.create({
      data: {
        productId,
        portionSizeId,
        currentStock,
        weeklyLimit,
        reservedStock: 0,
        lastRestocked: new Date()
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
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

    logger.info('Inventory record created successfully', { 
      userId: session.user.id, 
      inventoryId: inventory.id 
    })

    return NextResponse.json({ inventory })

  } catch (error) {
    logger.error('Error creating inventory record', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to create inventory record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized inventory update attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inventoryId, currentStock, weeklyLimit, reservedStock } = body

    if (!inventoryId) {
      return NextResponse.json(
        { error: 'Inventory ID is required' },
        { status: 400 }
      )
    }

    logger.info('Admin updating inventory', { 
      userId: session.user.id, 
      inventoryId, 
      currentStock, 
      weeklyLimit, 
      reservedStock 
    })

    const updateData: any = {}
    if (currentStock !== undefined) updateData.currentStock = currentStock
    if (weeklyLimit !== undefined) updateData.weeklyLimit = weeklyLimit
    if (reservedStock !== undefined) updateData.reservedStock = reservedStock

    const inventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
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

    logger.info('Inventory updated successfully', { 
      userId: session.user.id, 
      inventoryId: inventory.id 
    })

    return NextResponse.json({ inventory })

  } catch (error) {
    logger.error('Error updating inventory', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}
