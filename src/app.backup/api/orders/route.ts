import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')

    const whereClause: any = {
      userId: session.user.id
    }

    if (status) {
      whereClause.status = status
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            },
            portionSize: {
              select: {
                name: true,
                measurement: true
              }
            }
          }
        },
        address: {
          select: {
            street: true,
            city: true,
            province: true,
            postalCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}