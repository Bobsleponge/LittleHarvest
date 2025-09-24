import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cache, cacheKeys } from '@/lib/cache'

const portionSizeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().optional(),
  measurement: z.string().min(1, 'Measurement is required').max(50, 'Measurement is too long'),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portionSizes = await prisma.portionSize.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ portionSizes })
  } catch (error) {
    console.error('Error fetching portion sizes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portion sizes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = portionSizeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, description, measurement } = validation.data

    // Check if portion size already exists
    const existingPortionSize = await prisma.portionSize.findFirst({
      where: { 
        name: name,
        measurement: measurement
      },
    })

    if (existingPortionSize) {
      return NextResponse.json(
        { error: 'A portion size with this name and measurement already exists' },
        { status: 400 }
      )
    }

    // Create new portion size
    const portionSize = await prisma.portionSize.create({
      data: {
        name,
        description: description || null,
        measurement,
      },
    })

    // Invalidate product cache since portion sizes affect product pricing
    cache.delete(cacheKeys.products({}))

    return NextResponse.json({ portionSize })
  } catch (error) {
    console.error('Error creating portion size:', error)
    return NextResponse.json(
      { error: 'Failed to create portion size' },
      { status: 500 }
    )
  }
}
