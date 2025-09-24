import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Development accounts for quick login
const DEV_ACCOUNTS = [
  {
    email: 'admin@tinytastes.co.za',
    name: 'Admin User',
    role: 'ADMIN' as const,
  },
  {
    email: 'manager@tinytastes.co.za',
    name: 'Manager User',
    role: 'ADMIN' as const,
  },
  {
    email: 'customer@example.com',
    name: 'Jane Smith',
    role: 'CUSTOMER' as const,
  },
  {
    email: 'parent@example.com',
    name: 'John Doe',
    role: 'CUSTOMER' as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Development login only available in development mode' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if it's a valid dev account
    const devAccount = DEV_ACCOUNTS.find(account => account.email === email)
    if (!devAccount) {
      return NextResponse.json(
        { error: 'Invalid development account' },
        { status: 400 }
      )
    }

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Create the user if it doesn't exist
      user = await prisma.user.create({
        data: {
          email: devAccount.email,
          name: devAccount.name,
          role: devAccount.role,
          emailVerified: new Date(), // Auto-verify for development
        },
      })

      // Create profile if it doesn't exist
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          firstName: devAccount.name.split(' ')[0],
          lastName: devAccount.name.split(' ').slice(1).join(' ') || '',
        },
      })
    }

    // Return success - the frontend will handle the session
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Error in dev login:', error)
    return NextResponse.json(
      { error: 'Failed to process development login' },
      { status: 500 }
    )
  }
}
