import { NextApiRequest, NextApiResponse } from 'next'
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        error: 'Development login only available in development mode'
      })
    }

    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Find the dev account
    const devAccount = DEV_ACCOUNTS.find(account => account.email === email)

    if (!devAccount) {
      return res.status(400).json({ error: 'Invalid email' })
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: devAccount.email },
    })

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: devAccount.email,
          name: devAccount.name,
          role: devAccount.role,
          emailVerified: new Date(),
        },
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Dev login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}