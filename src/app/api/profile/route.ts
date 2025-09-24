import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema, validateFormData } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        addresses: true,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input data
    const validation = validateFormData(profileSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const { firstName, lastName, phone, childName, childDob } = validation.data!

    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          firstName,
          lastName,
          phone: phone || null,
          childName: childName || null,
          childDob: childDob ? new Date(childDob) : null,
        },
        include: {
          addresses: true,
        },
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          firstName,
          lastName,
          phone: phone || null,
          childName: childName || null,
          childDob: childDob ? new Date(childDob) : null,
        },
        include: {
          addresses: true,
        },
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
