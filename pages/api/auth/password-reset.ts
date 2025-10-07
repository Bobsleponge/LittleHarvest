import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../src/lib/auth'
import { prisma } from '../../src/lib/prisma'
import { logger } from '../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../src/lib/rate-limit'
import { withCSRFProtection } from '../../src/lib/csrf'
import { sendPasswordResetEmail } from '../../src/lib/email'
import { z } from 'zod'
import crypto from 'crypto'

const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.AUTH,
  (req) => req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Validate request body
    const validationResult = requestPasswordResetSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid email address',
        details: validationResult.error.errors 
      })
    }

    const { email } = validationResult.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    })

    // Always return success to prevent email enumeration attacks
    if (!user) {
      logger.warn('Password reset requested for non-existent email', { email })
      return res.status(200).json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store reset token in database (you might want to create a separate table for this)
    // For now, we'll use a simple approach with the existing user table
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You might want to add a resetToken field to your schema
        // For now, we'll just log it
      }
    })

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      customerName: user.name || 'Valued Customer',
      customerEmail: user.email,
      resetLink,
      expiresIn: '24 hours'
    })

    if (emailSent) {
      logger.info('Password reset email sent', { 
        userId: user.id, 
        email: user.email 
      })
      
      return res.status(200).json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    } else {
      logger.error('Failed to send password reset email', { 
        userId: user.id, 
        email: user.email 
      })
      
      return res.status(500).json({ 
        error: 'Failed to send password reset email' 
      })
    }

  } catch (error) {
    logger.error('Password reset API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))
