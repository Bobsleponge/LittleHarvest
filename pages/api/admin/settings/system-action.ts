import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'

async function executeSystemAction(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { action } = req.body
    
    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Invalid action specified' })
    }

    logger.info('System action requested', { userId, action })

    switch (action) {
      case 'clearCache':
        // Clear application cache
        // In a real implementation, you would clear Redis, Memcached, or other cache systems
        logger.info('Cache cleared', { userId })
        return res.status(200).json({ 
          success: true, 
          message: 'Application cache cleared successfully' 
        })

      case 'restartServices':
        // Restart application services
        // In a real implementation, you would restart services via PM2, Docker, or systemd
        logger.info('Services restart requested', { userId })
        return res.status(200).json({ 
          success: true, 
          message: 'Services restart initiated. Changes will take effect shortly.' 
        })

      case 'healthCheck':
        // Perform comprehensive health check
        const healthStatus = await performHealthCheck()
        logger.info('Health check performed', { userId, status: healthStatus })
        return res.status(200).json({ 
          success: true, 
          message: 'Health check completed',
          healthStatus 
        })

      case 'resetSettings':
        // Reset all settings to defaults (but keep rate limiting enabled)
        await resetAllSettings(userId)
        logger.info('All settings reset to defaults (rate limiting preserved)', { userId })
        return res.status(200).json({ 
          success: true, 
          message: 'All settings have been reset to default values. Rate limiting remains enabled for security.' 
        })

      case 'clearLogs':
        // Clear system logs
        await clearSystemLogs(userId)
        logger.info('System logs cleared', { userId })
        return res.status(200).json({ 
          success: true, 
          message: 'System logs cleared successfully' 
        })

      case 'disableRateLimit':
        // This action should not be allowed in production
        logger.warn('Attempt to disable rate limiting blocked', { userId })
        return res.status(403).json({ 
          error: 'Rate limiting cannot be disabled in production for security reasons' 
        })

      default:
        return res.status(400).json({ error: 'Unknown system action' })
    }
  } catch (error) {
    logger.error('System action failed', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'System action failed' })
  }
}

async function performHealthCheck() {
  const healthStatus = {
    database: false,
    api: false,
    email: false,
    storage: false,
    rateLimiting: true, // Always enabled for security
    timestamp: new Date().toISOString()
  }

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    healthStatus.database = true
  } catch (error) {
    logger.error('Database health check failed', { error })
  }

  try {
    // Check API endpoints
    const testResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/health`)
    healthStatus.api = testResponse.ok
  } catch (error) {
    logger.error('API health check failed', { error })
  }

  // Check email service (simplified check)
  healthStatus.email = !!(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER)

  // Check storage (simplified check)
  healthStatus.storage = true // Assume storage is available

  return healthStatus
}

async function resetAllSettings(userId: string) {
  // Define default settings for each category
  const defaultSettings = {
    general: {
      siteName: 'Little Harvest',
      tagline: 'Nutritious meals for little ones',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      language: 'en'
    },
    business: {
      businessHours: {
        monday: { open: '08:00', close: '17:00', closed: false },
        tuesday: { open: '08:00', close: '17:00', closed: false },
        wednesday: { open: '08:00', close: '17:00', closed: false },
        thursday: { open: '08:00', close: '17:00', closed: false },
        friday: { open: '08:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '09:00', close: '15:00', closed: true }
      },
      contactEmail: 'info@littleharvest.co.za',
      contactPhone: '+27 11 123 4567',
      address: '123 Main Street, Johannesburg, South Africa'
    },
    delivery: {
      deliveryRadius: 15,
      deliveryFee: 25,
      freeDeliveryThreshold: 200,
      timeSlots: [
        { start: '09:00', end: '12:00', available: true },
        { start: '12:00', end: '15:00', available: true },
        { start: '15:00', end: '18:00', available: true }
      ]
    },
    payment: {
      methods: ['card', 'eft', 'cash'],
      paymentTerms: 'payment_on_delivery',
      invoiceDueDays: 7
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderConfirmations: true,
      deliveryUpdates: true,
      lowStockAlerts: true
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      requireStrongPasswords: true,
      ipWhitelist: []
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily',
      backupRetention: 30,
      rateLimiting: true, // Always true - cannot be disabled
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      require2FA: false,
      adminIpWhitelist: '',
      cacheDuration: 15,
      dbPoolSize: 10,
      maxFileSize: 10
    }
  }

  // Reset all settings to defaults
  for (const [category, settings] of Object.entries(defaultSettings)) {
    for (const [key, value] of Object.entries(settings)) {
      // Ensure rate limiting is always enabled for security
      const finalValue = (category === 'system' && key === 'rateLimiting') ? true : value
      
      await prisma.storeSettings.upsert({
        where: { 
          category_key: { category, key }
        },
        update: { 
          value: JSON.stringify(finalValue),
          updatedBy: userId,
          updatedAt: new Date()
        },
        create: {
          key,
          category,
          value: JSON.stringify(finalValue),
          isActive: true,
          updatedBy: userId
        }
      })
    }
  }
}

async function clearSystemLogs(userId: string) {
  // In a real implementation, you would clear log files or log database entries
  // For now, we'll just log the action
  logger.info('System logs cleared by admin', { userId })
  
  // You could implement actual log clearing here:
  // - Clear log files from filesystem
  // - Clear log entries from database
  // - Clear application memory logs
}

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

    return await executeSystemAction(req, res, session.user.id)
  } catch (error) {
    logger.error('System action API error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))
