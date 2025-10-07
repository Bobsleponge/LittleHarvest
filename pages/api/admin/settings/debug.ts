import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Settings API called:', req.method)
    
    const session = await getServerSession(req, res, authOptions)
    console.log('Session:', session ? { id: session.user?.id, email: session.user?.email, role: session.user?.role } : 'No session')
    
    if (!session?.user?.id) {
      console.log('No session found')
      return res.status(401).json({ error: 'No session found - please log in' })
    }
    
    if (session.user.role !== 'ADMIN') {
      console.log('User is not admin:', session.user.role)
      return res.status(403).json({ error: `Access denied - user role is ${session.user.role}, ADMIN required` })
    }

    console.log('User is admin, proceeding with request')

    switch (req.method) {
      case 'GET':
        return await getSettings(req, res, session.user.id)
      case 'POST':
        return await updateSettings(req, res, session.user.id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Settings API error:', error)
    logger.error('Settings API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method 
    })
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}

async function getSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    console.log('Getting settings for user:', userId)
    
    const { category } = req.query
    console.log('Category filter:', category)
    
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

    console.log('Found settings:', settings.length)

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

    console.log('Transformed settings:', Object.keys(settingsByCategory))

    logger.info('Settings retrieved', { 
      userId, 
      category: category || 'all',
      count: settings.length 
    })

    return res.status(200).json({ 
      success: true, 
      settings: settingsByCategory,
      raw: settings,
      debug: {
        userId,
        category: category || 'all',
        settingsCount: settings.length,
        categories: Object.keys(settingsByCategory)
      }
    })
  } catch (error) {
    console.error('Error retrieving settings:', error)
    logger.error('Error retrieving settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to retrieve settings', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}

async function updateSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { category, settings, changeReason } = req.body

    if (!category || !settings) {
      return res.status(400).json({ error: 'Category and settings are required' })
    }

    const results = []
    const errors = []

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      try {
        // Get current setting to track changes
        const currentSetting = await prisma.storeSettings.findUnique({
          where: {
            category_key: {
              category,
              key
            }
          }
        })

        const newValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

        // Create or update the setting
        const updatedSetting = await prisma.storeSettings.upsert({
          where: {
            category_key: {
              category,
              key
            }
          },
          update: {
            value: newValue,
            updatedBy: userId,
            updatedAt: new Date()
          },
          create: {
            category,
            key,
            value: newValue,
            updatedBy: userId
          }
        })

        // Record the change in history
        if (currentSetting && currentSetting.value !== newValue) {
          await prisma.settingsHistory.create({
            data: {
              category,
              key,
              oldValue: currentSetting.value,
              newValue,
              changedBy: userId,
              changeReason
            }
          })
        }

        results.push({
          key,
          value: updatedSetting.value,
          updated: true
        })

        logger.info('Setting updated', { 
          userId, 
          category, 
          key, 
          changeReason 
        })

      } catch (error) {
        errors.push({
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (errors.length > 0) {
      logger.warn('Some settings failed to update', { 
        userId, 
        category, 
        errors 
      })
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Settings updated successfully',
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    logger.error('Error updating settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to update settings' })
  }
}
