import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { processExpiredPayments, getOrdersApproachingDeadline, getPaymentStatistics } from '@/lib/payment-timeout'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized expired payment processing attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Admin triggered expired payment processing', { 
      userId: session.user.id 
    })

    // Process expired payments
    const result = await processExpiredPayments()

    // Get updated statistics
    const statistics = await getPaymentStatistics()

    // Get orders approaching deadline
    const approachingOrders = await getOrdersApproachingDeadline()

    logger.info('Expired payment processing completed', { 
      userId: session.user.id,
      result,
      statistics
    })

    return NextResponse.json({
      success: true,
      result,
      statistics,
      approachingOrders
    })

  } catch (error) {
    logger.error('Error in expired payment processing endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to process expired payments' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized payment statistics access attempt', { userId: session?.user?.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get payment statistics
    const statistics = await getPaymentStatistics()

    // Get orders approaching deadline
    const approachingOrders = await getOrdersApproachingDeadline()

    return NextResponse.json({
      statistics,
      approachingOrders
    })

  } catch (error) {
    logger.error('Error getting payment statistics', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, error as Error)
    
    return NextResponse.json(
      { error: 'Failed to get payment statistics' },
      { status: 500 }
    )
  }
}
