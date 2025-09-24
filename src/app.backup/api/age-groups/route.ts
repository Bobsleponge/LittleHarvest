import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const ageGroups = await prisma.ageGroup.findMany({
      orderBy: { minMonths: 'asc' },
    })

    return NextResponse.json({ ageGroups })
  } catch (error) {
    console.error('Error fetching age groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch age groups' },
      { status: 500 }
    )
  }
}
