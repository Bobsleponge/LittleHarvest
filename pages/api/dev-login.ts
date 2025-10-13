import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../src/lib/supabaseClient'
import bcrypt from 'bcryptjs'

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
  // Security check: Only allow in development with explicit flag
  if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_DEV_AUTH !== 'true') {
    return res.status(404).json({ error: 'Not found' })
  }
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

    // Use Supabase to create or update user
    const hashedPassword = await bcrypt.hash('dev123', 10)
    
    // First, try to find existing user
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', devAccount.email)
      .single()

    let user
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('User')
        .update({
          password: hashedPassword,
          role: devAccount.role,
          name: devAccount.name,
          updatedAt: new Date().toISOString(),
        })
        .eq('email', devAccount.email)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`)
      }
      user = updatedUser
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('User')
        .insert({
          email: devAccount.email,
          name: devAccount.name,
          role: devAccount.role,
          emailVerified: new Date().toISOString(),
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`)
      }
      user = newUser
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}