import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const textures = await prisma.texture.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ textures })
  } catch (error) {
    console.error('Error fetching textures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch textures' },
      { status: 500 }
    )
  }
}
