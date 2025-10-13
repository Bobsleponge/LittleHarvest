import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'
import { testEmailServiceWithSettings } from '../../../../src/lib/notification-service'

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.SETTINGS,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { action } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Notification action is required' })
    }

    logger.info('Notification action requested', { userId: session.user.id, action })

    switch (action) {
      case 'testEmail':
        // Test email service with notification settings
        const testResult = await testEmailServiceWithSettings()
        logger.info('Email service test completed', { userId: session.user.id, result: testResult })
        return res.status(200).json({ 
          success: testResult.success, 
          message: testResult.reason || 'Email service test completed' 
        })

      case 'testSMS':
        // Test SMS service
        await testSMSService(session.user.id)
        logger.info('SMS service test completed', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'SMS service test completed. Check logs for results.' 
        })

      case 'sendTestNotification':
        // Send test notification with settings check
        const notificationResult = await testEmailServiceWithSettings()
        logger.info('Test notification sent', { userId: session.user.id, result: notificationResult })
        return res.status(200).json({ 
          success: notificationResult.success, 
          message: notificationResult.reason || 'Test notification sent successfully' 
        })

      case 'enableAllNotifications':
        // Enable all notification types
        await enableAllNotifications(session.user.id)
        logger.info('All notifications enabled', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'All notification types have been enabled' 
        })

      case 'disableMarketing':
        // Disable marketing notifications only
        await disableMarketingNotifications(session.user.id)
        logger.info('Marketing notifications disabled', { userId: session.user.id })
        return res.status(200).json({ 
          success: true, 
          message: 'Marketing notifications have been disabled' 
        })

      default:
        return res.status(400).json({ error: 'Unknown notification action' })
    }
  } catch (error) {
    logger.error('Notification action API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      action: req.body?.action 
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function testSMSService(userId: string) {
  try {
    // In a real implementation, you would:
    // 1. Check SMS service configuration
    // 2. Send a test SMS
    // 3. Verify delivery
    
    logger.info('SMS service test initiated', { userId })
    
    // Simulate SMS service check
    const smsConfig = {
      provider: process.env.SMS_PROVIDER,
      apiKey: process.env.SMS_API_KEY,
      fromNumber: process.env.SMS_FROM_NUMBER
    }
    
    if (!smsConfig.provider || !smsConfig.apiKey) {
      throw new Error('SMS service not configured')
    }
    
    logger.info('SMS service configuration valid', { userId, config: smsConfig })
  } catch (error) {
    logger.error('SMS service test failed', { userId, error })
    throw error
  }
}

async function enableAllNotifications(userId: string) {
  try {
    const notificationSettings = [
      'emailNotifications',
      'smsNotifications',
      'orderConfirmations',
      'deliveryUpdates',
      'marketingEmails',
      'smsDeliveryAlerts',
      'smsOrderConfirmations',
      'newOrderAlerts',
      'lowStockAlerts',
      'paymentIssueAlerts',
      'systemAlerts'
    ]

    for (const setting of notificationSettings) {
      await prisma.storeSettings.upsert({
        where: { 
          category_key: {
            category: 'notifications',
            key: setting
          }
        },
        update: { 
          value: JSON.stringify(true),
          updatedBy: userId,
          updatedAt: new Date()
        },
        create: {
          category: 'notifications',
          key: setting,
          value: JSON.stringify(true),
          isActive: true,
          updatedBy: userId
        }
      })
    }

    logger.info('All notifications enabled', { userId, count: notificationSettings.length })
  } catch (error) {
    logger.error('Failed to enable all notifications', { userId, error })
    throw error
  }
}

async function disableMarketingNotifications(userId: string) {
  try {
    const marketingSettings = [
      'marketingEmails',
      'smsOrderConfirmations' // Optional: disable SMS marketing too
    ]

    for (const setting of marketingSettings) {
      await prisma.storeSettings.upsert({
        where: { 
          category_key: {
            category: 'notifications',
            key: setting
          }
        },
        update: { 
          value: JSON.stringify(false),
          updatedBy: userId,
          updatedAt: new Date()
        },
        create: {
          category: 'notifications',
          key: setting,
          value: JSON.stringify(false),
          isActive: true,
          updatedBy: userId
        }
      })
    }

    logger.info('Marketing notifications disabled', { userId, settings: marketingSettings })
  } catch (error) {
    logger.error('Failed to disable marketing notifications', { userId, error })
    throw error
  }
}
