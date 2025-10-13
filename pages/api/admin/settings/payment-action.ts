import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit } from '../../../../src/lib/rate-limit'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Action is required' })
    }

    logger.info('Payment action requested', {
      action
    })

    switch (action) {
      case 'testConnection':
        await testPaymentConnection(req, res, 'admin-user')
        return
      
      case 'testPayment':
        await testPaymentProcessing(req, res, 'admin-user')
        return
      
      case 'syncWebhooks':
        await syncPaymentWebhooks(req, res, 'admin-user')
        return
      
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    logger.error('Payment action error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function testPaymentConnection(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    logger.info('Starting payment connection test', { userId })

    // Get payment settings from database with timeout
    const paymentSettings = await Promise.race([
      prisma.storeSettings.findMany({
        where: {
          category: 'payment',
          isActive: true
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]) as any[]

    const settings = paymentSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    const gateway = settings.paymentGateway || 'stripe'
    logger.info('Testing payment gateway', { gateway, userId })

    let connectionResult = { success: false, message: '', details: {} }

    // Test connection with timeout
    const testPromise = (async () => {
      switch (gateway) {
        case 'peach':
          return await testPeachPaymentsConnection(settings)
        case 'stripe':
          return await testStripeConnection(settings)
        case 'payfast':
          return await testPayFastConnection(settings)
        default:
          return {
            success: false,
            message: `Gateway ${gateway} not implemented`,
            details: {}
          }
      }
    })()

    connectionResult = await Promise.race([
      testPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 10000)
      )
    ]) as any

    logger.info('Payment connection test completed', {
      userId,
      gateway,
      result: connectionResult
    })

    return res.status(200).json({
      success: connectionResult.success,
      message: connectionResult.message,
      gateway,
      details: connectionResult.details
    })
  } catch (error) {
    logger.error('Payment connection test error', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Failed to test payment connection',
      gateway: 'unknown'
    })
  }
}

async function testPaymentProcessing(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get payment settings from database
    const paymentSettings = await prisma.storeSettings.findMany({
      where: {
        category: 'payment',
        isActive: true
      }
    })

    const settings = paymentSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    const gateway = settings.paymentGateway || 'stripe'

    let testResult = { success: false, message: '', transactionId: null }

    switch (gateway) {
      case 'peach':
        testResult = await testPeachPaymentsTransaction(settings)
        break
      case 'stripe':
        testResult = await testStripeTransaction(settings)
        break
      case 'payfast':
        testResult = await testPayFastTransaction(settings)
        break
      default:
        testResult = {
          success: false,
          message: `Gateway ${gateway} not implemented`,
          transactionId: null
        }
    }

    logger.info('Payment test transaction completed', {
      userId,
      gateway,
      result: testResult
    })

    return res.status(200).json({
      success: testResult.success,
      message: testResult.message,
      gateway,
      transactionId: testResult.transactionId
    })
  } catch (error) {
    logger.error('Payment test transaction error', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to test payment processing' })
  }
}

async function syncPaymentWebhooks(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get payment settings from database
    const paymentSettings = await prisma.storeSettings.findMany({
      where: {
        category: 'payment',
        isActive: true
      }
    })

    const settings = paymentSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    const gateway = settings.paymentGateway || 'stripe'

    let syncResult = { success: false, message: '', webhooks: [] }

    switch (gateway) {
      case 'peach':
        syncResult = await syncPeachPaymentsWebhooks(settings)
        break
      case 'stripe':
        syncResult = await syncStripeWebhooks(settings)
        break
      case 'payfast':
        syncResult = await syncPayFastWebhooks(settings)
        break
      default:
        syncResult = {
          success: false,
          message: `Gateway ${gateway} not implemented`,
          webhooks: []
        }
    }

    logger.info('Payment webhook sync completed', {
      userId,
      gateway,
      result: syncResult
    })

    return res.status(200).json({
      success: syncResult.success,
      message: syncResult.message,
      gateway,
      webhooks: syncResult.webhooks
    })
  } catch (error) {
    logger.error('Payment webhook sync error', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to sync payment webhooks' })
  }
}

// Peach Payments Integration Functions
async function testPeachPaymentsConnection(settings: Record<string, any>) {
  try {
    const merchantId = settings.peachMerchantId
    const apiKey = settings.peachApiKey
    const environment = settings.peachEnvironment || 'sandbox'

    if (!merchantId || !apiKey) {
      return {
        success: false,
        message: 'Peach Payments credentials not configured',
        details: { missing: ['merchantId', 'apiKey'].filter(key => !settings[key]) }
      }
    }

    // Test API connection
    const baseUrl = environment === 'production' 
      ? 'https://api.peachpayments.com' 
      : 'https://api.sandbox.peachpayments.com'

    const response = await fetch(`${baseUrl}/v1/merchants/${merchantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Peach Payments connection successful',
        details: {
          merchantId: data.merchantId,
          environment,
          status: data.status
        }
      }
    } else {
      return {
        success: false,
        message: `Peach Payments connection failed: ${response.statusText}`,
        details: { status: response.status }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Peach Payments connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {}
    }
  }
}

async function testPeachPaymentsTransaction(settings: Record<string, any>) {
  try {
    const merchantId = settings.peachMerchantId
    const apiKey = settings.peachApiKey
    const environment = settings.peachEnvironment || 'sandbox'

    if (!merchantId || !apiKey) {
      return {
        success: false,
        message: 'Peach Payments credentials not configured',
        transactionId: null
      }
    }

    const baseUrl = environment === 'production' 
      ? 'https://api.peachpayments.com' 
      : 'https://api.sandbox.peachpayments.com'

    // Create a test transaction
    const testTransaction = {
      amount: 100, // R1.00 test amount
      currency: 'ZAR',
      merchantTransactionId: `test_${Date.now()}`,
      paymentType: 'DB', // Debit
      customer: {
        givenName: 'Test',
        surname: 'User',
        email: 'test@littleharvest.co.za'
      },
      billing: {
        street1: '123 Test Street',
        city: 'Johannesburg',
        country: 'ZA',
        postcode: '2000'
      }
    }

    const response = await fetch(`${baseUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTransaction)
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Peach Payments test transaction successful',
        transactionId: data.id
      }
    } else {
      return {
        success: false,
        message: `Peach Payments test transaction failed: ${response.statusText}`,
        transactionId: null
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Peach Payments test transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      transactionId: null
    }
  }
}

async function syncPeachPaymentsWebhooks(settings: Record<string, any>) {
  try {
    const merchantId = settings.peachMerchantId
    const apiKey = settings.peachApiKey
    const environment = settings.peachEnvironment || 'sandbox'

    if (!merchantId || !apiKey) {
      return {
        success: false,
        message: 'Peach Payments credentials not configured',
        webhooks: []
      }
    }

    const baseUrl = environment === 'production' 
      ? 'https://api.peachpayments.com' 
      : 'https://api.sandbox.peachpayments.com'

    // Get existing webhooks
    const response = await fetch(`${baseUrl}/v1/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: 'Peach Payments webhooks synced successfully',
        webhooks: data.webhooks || []
      }
    } else {
      return {
        success: false,
        message: `Failed to sync Peach Payments webhooks: ${response.statusText}`,
        webhooks: []
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Peach Payments webhook sync error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      webhooks: []
    }
  }
}

// Stripe Integration Functions (Placeholder)
async function testStripeConnection(settings: Record<string, any>) {
  return {
    success: false,
    message: 'Stripe integration not implemented yet',
    details: {}
  }
}

async function testStripeTransaction(settings: Record<string, any>) {
  return {
    success: false,
    message: 'Stripe integration not implemented yet',
    transactionId: null
  }
}

async function syncStripeWebhooks(settings: Record<string, any>) {
  return {
    success: false,
    message: 'Stripe integration not implemented yet',
    webhooks: []
  }
}

// PayFast Integration Functions (Placeholder)
async function testPayFastConnection(settings: Record<string, any>) {
  return {
    success: false,
    message: 'PayFast integration not implemented yet',
    details: {}
  }
}

async function testPayFastTransaction(settings: Record<string, any>) {
  return {
    success: false,
    message: 'PayFast integration not implemented yet',
    transactionId: null
  }
}

async function syncPayFastWebhooks(settings: Record<string, any>) {
  return {
    success: false,
    message: 'PayFast integration not implemented yet',
    webhooks: []
  }
}

export default handler
