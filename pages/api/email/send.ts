import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../src/lib/auth'
import { logger } from '../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../src/lib/rate-limit'
import { withCSRFProtection } from '../../src/lib/csrf'
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendAccountVerificationEmail,
  sendOrderNotification,
  WelcomeEmailData,
  PasswordResetData,
  AccountVerificationData,
  OrderNotificationData
} from '../../src/lib/email'
import { z } from 'zod'

// Validation schemas
const welcomeEmailSchema = z.object({
  type: z.literal('welcome'),
  data: z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
  })
})

const passwordResetSchema = z.object({
  type: z.literal('password-reset'),
  data: z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    resetLink: z.string().url(),
    expiresIn: z.string().min(1),
  })
})

const accountVerificationSchema = z.object({
  type: z.literal('account-verification'),
  data: z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    verificationLink: z.string().url(),
  })
})

const orderNotificationSchema = z.object({
  type: z.literal('order-confirmation') | z.literal('order-payment') | z.literal('order-cancellation'),
  data: z.object({
    orderNumber: z.string().min(1),
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    orderStatus: z.string().min(1),
    paymentStatus: z.string().min(1),
    totalAmount: z.number().positive(),
    deliveryDate: z.string().optional(),
    paymentDueDate: z.string().optional(),
    items: z.array(z.object({
      productName: z.string().min(1),
      portionSize: z.string().min(1),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      lineTotal: z.number().positive(),
    })),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      province: z.string().min(1),
      postalCode: z.string().min(1),
    }).optional(),
  })
})

const emailRequestSchema = z.discriminatedUnion('type', [
  welcomeEmailSchema,
  passwordResetSchema,
  accountVerificationSchema,
  orderNotificationSchema,
])

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Validate request body
    const validationResult = emailRequestSchema.safeParse(req.body)
    if (!validationResult.success) {
      logger.warn('Invalid email request', { 
        errors: validationResult.error.errors,
        body: req.body 
      })
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: validationResult.error.errors 
      })
    }

    const { type, data } = validationResult.data

    let success = false

    switch (type) {
      case 'welcome':
        success = await sendWelcomeEmail(data as WelcomeEmailData)
        break

      case 'password-reset':
        success = await sendPasswordResetEmail(data as PasswordResetData)
        break

      case 'account-verification':
        success = await sendAccountVerificationEmail(data as AccountVerificationData)
        break

      case 'order-confirmation':
        success = await sendOrderNotification(data as OrderNotificationData, 'confirmation')
        break

      case 'order-payment':
        success = await sendOrderNotification(data as OrderNotificationData, 'payment')
        break

      case 'order-cancellation':
        success = await sendOrderNotification(data as OrderNotificationData, 'cancellation')
        break

      default:
        return res.status(400).json({ error: 'Unknown email type' })
    }

    if (success) {
      logger.info('Email sent successfully', { type, recipient: data.customerEmail })
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully' 
      })
    } else {
      logger.error('Failed to send email', { type, recipient: data.customerEmail })
      return res.status(500).json({ 
        error: 'Failed to send email' 
      })
    }

  } catch (error) {
    logger.error('Email API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      body: req.body
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))
