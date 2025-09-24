import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { bulkRestockInventory, getInventoryStatistics, getWeeklyRestockItems } from '@/lib/stock-management'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized bulk inventory operation attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { operation, items } = body

    if (!operation || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Operation and items array are required' },
        { status: 400 }
      )
    }

    logger.info('Admin performing bulk inventory operation', { 
      userId: session.user.id, 
      operation,
      itemCount: items.length 
    })

    let result

    switch (operation) {
      case 'restock':
        result = await bulkRestockInventory(items)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    // Get updated statistics
    const statistics = await getInventoryStatistics()

    logger.info('Bulk inventory operation completed', { 
      userId: session.user.id, 
      operation,
      result,
      statistics
    })

    return NextResponse.json({
      success: true,
      result,
      statistics
    })

  } catch (error) {
    logger.error('Error in bulk inventory operation', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to perform bulk inventory operation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized inventory statistics access attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    logger.info('Admin fetching inventory data', { 
      userId: session.user.id, 
      type 
    })

    let data

    switch (type) {
      case 'statistics':
        data = await getInventoryStatistics()
        break
      
      case 'weekly-restock':
        data = await getWeeklyRestockItems()
        break
      
      default:
        // Return both statistics and weekly restock items
        const [statistics, weeklyRestockItems] = await Promise.all([
          getInventoryStatistics(),
          getWeeklyRestockItems()
        ])
        data = { statistics, weeklyRestockItems }
    }

    return NextResponse.json(data)

  } catch (error) {
    logger.error('Error getting inventory data', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to get inventory data' },
      { status: 500 }
    )
  }
}
