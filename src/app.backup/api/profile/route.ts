import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
            addresses: {
              orderBy: { isDefault: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, street, city, province, postalCode, country } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
      }
    })

    // Update or create default address
    if (street && city && province && postalCode) {
      // First ensure user has a profile
      let profile = await prisma.profile.findUnique({
        where: { userId: session.user.id }
      })

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            userId: session.user.id,
            firstName: name?.split(' ')[0] || '',
            lastName: name?.split(' ').slice(1).join(' ') || ''
          }
        })
      }

      const existingAddress = await prisma.address.findFirst({
        where: {
          profileId: profile.id,
          isDefault: true
        }
      })

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            street,
            city,
            province,
            postalCode,
            country: country || 'South Africa',
            type: 'SHIPPING'
          }
        })
      } else {
        await prisma.address.create({
          data: {
            profileId: profile.id,
            street,
            city,
            province,
            postalCode,
            country: country || 'South Africa',
            type: 'SHIPPING',
            isDefault: true
          }
        })
      }
    }

    // Fetch updated user with addresses
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            addresses: {
              orderBy: { isDefault: 'desc' }
            }
          }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}