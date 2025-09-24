import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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
