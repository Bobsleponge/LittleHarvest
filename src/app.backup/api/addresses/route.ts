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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            addresses: true,
          },
        },
      },
    })

    if (!user?.profile) {
      return NextResponse.json({ addresses: [] })
    }

    return NextResponse.json({ addresses: user.profile.addresses })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, street, city, province, postalCode, country, isDefault } = await request.json()

    if (!street || !city || !province || !postalCode) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // Get or create user profile
    let profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          firstName: session.user.name?.split(' ')[0] || 'User',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        },
      })
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { profileId: profile.id },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        profileId: profile.id,
        type: type || 'SHIPPING',
        street,
        city,
        province,
        postalCode,
        country: country || 'South Africa',
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
