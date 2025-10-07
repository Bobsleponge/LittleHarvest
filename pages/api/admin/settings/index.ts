import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { validateSettings, validateBusinessHours, validateDeliveryTimeSlots, validatePaymentMethods, validateIpWhitelist } from '../../../../src/lib/settings-validation'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS, getRateLimitKey } from '../../../../src/lib/rate-limit'

async function getSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { category } = req.query
    
    const whereClause = category ? { category: category as string } : {}
    
    const settings = await prisma.storeSettings.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Transform settings into a more usable format
    const settingsByCategory = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      
      // Parse JSON values
      try {
        acc[setting.category][setting.key] = JSON.parse(setting.value)
      } catch {
        acc[setting.category][setting.key] = setting.value
      }
      
      return acc
    }, {} as Record<string, Record<string, any>>)

    logger.info('Settings retrieved', { 
      userId, 
      category: category || 'all',
      count: settings.length 
    })

    return res.status(200).json({ 
      success: true, 
      settings: settingsByCategory,
      raw: settings 
    })
  } catch (error) {
    logger.error('Error retrieving settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to retrieve settings' })
  }
}

async function updateSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { settings } = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' })
    }

    // Validate settings
    const validationResult = validateSettings('general', settings)
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        error: 'Invalid settings', 
        details: validationResult.errors 
      })
    }

    // Update settings in database
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      return prisma.storeSettings.upsert({
        where: { 
          category_key: {
            category: 'general',
            key: key
          }
        },
        update: { 
          value: JSON.stringify(value),
          updatedBy: userId,
          updatedAt: new Date()
        },
        create: {
          key,
          category: 'general',
          value: JSON.stringify(value),
          isActive: true,
          updatedBy: userId
        }
      })
    })

    await Promise.all(updatePromises)

    logger.info('Settings updated', { 
      userId, 
      keys: Object.keys(settings),
      count: Object.keys(settings).length 
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Settings updated successfully' 
    })
  } catch (error) {
    logger.error('Error updating settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to update settings' })
  }
}

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.SETTINGS,
  (req) => getRateLimitKey(req, req.user?.id)
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        return await getSettings(req, res, session.user.id)
      case 'POST':
        return await updateSettings(req, res, session.user.id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Settings API error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))