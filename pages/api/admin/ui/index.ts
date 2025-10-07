import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS, getRateLimitKey } from '../../../../src/lib/rate-limit'

// UI Settings validation schema
const validateUISettings = (settings: any) => {
  const errors: string[] = []
  
  // Brand settings validation
  if (settings.brand) {
    if (settings.brand.siteName && typeof settings.brand.siteName !== 'string') {
      errors.push('Site name must be a string')
    }
    if (settings.brand.tagline && typeof settings.brand.tagline !== 'string') {
      errors.push('Tagline must be a string')
    }
    if (settings.brand.logoUrl && typeof settings.brand.logoUrl !== 'string') {
      errors.push('Logo URL must be a string')
    }
    if (settings.brand.faviconUrl && typeof settings.brand.faviconUrl !== 'string') {
      errors.push('Favicon URL must be a string')
    }
  }
  
  // Color settings validation
  if (settings.colors) {
    const colorKeys = ['primary', 'secondary', 'accent', 'background', 'text', 'muted']
    for (const key of colorKeys) {
      if (settings.colors[key] && typeof settings.colors[key] !== 'string') {
        errors.push(`${key} color must be a string`)
      }
    }
  }
  
  // Typography settings validation
  if (settings.typography) {
    if (settings.typography.fontFamily && typeof settings.typography.fontFamily !== 'string') {
      errors.push('Font family must be a string')
    }
    if (settings.typography.headingFont && typeof settings.typography.headingFont !== 'string') {
      errors.push('Heading font must be a string')
    }
  }
  
  // Layout settings validation
  if (settings.layout) {
    if (settings.layout.headerHeight && typeof settings.layout.headerHeight !== 'number') {
      errors.push('Header height must be a number')
    }
    if (settings.layout.sidebarWidth && typeof settings.layout.sidebarWidth !== 'number') {
      errors.push('Sidebar width must be a number')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

async function getUISettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const uiSettings = await prisma.storeSettings.findMany({
      where: {
        category: 'ui',
        isActive: true
      },
      orderBy: { key: 'asc' }
    })

    // Transform settings into a more usable format
    const settings = uiSettings.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value)
      } catch {
        acc[setting.key] = setting.value
      }
      return acc
    }, {} as Record<string, any>)

    // Default UI settings if none exist
    const defaultSettings = {
      brand: {
        siteName: 'Tiny Tastes',
        tagline: 'Nutritious meals for little ones',
        logoUrl: '',
        faviconUrl: ''
      },
      colors: {
        primary: '#10b981', // emerald-500
        secondary: '#059669', // emerald-600
        accent: '#34d399', // emerald-400
        background: '#ffffff',
        text: '#111827', // gray-900
        muted: '#6b7280' // gray-500
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFont: 'Inter, system-ui, sans-serif'
      },
      layout: {
        headerHeight: 64,
        sidebarWidth: 256
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      },
      contact: {
        email: '',
        phone: '',
        address: ''
      }
    }

    const mergedSettings = { ...defaultSettings, ...settings }

    logger.info('UI settings retrieved', { 
      userId, 
      count: uiSettings.length 
    })

    return res.status(200).json({ 
      success: true, 
      settings: mergedSettings,
      raw: uiSettings 
    })
  } catch (error) {
    logger.error('Error retrieving UI settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to retrieve UI settings' })
  }
}

async function updateUISettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { settings } = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' })
    }

    // Validate settings
    const validationResult = validateUISettings(settings)
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
            category: 'ui',
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
          category: 'ui',
          value: JSON.stringify(value),
          description: `UI setting for ${key}`,
          isActive: true,
          updatedBy: userId
        }
      })
    })

    await Promise.all(updatePromises)

    // Log the change in settings history
    await prisma.settingsHistory.create({
      data: {
        category: 'ui',
        key: 'ui_settings',
        oldValue: null,
        newValue: JSON.stringify(settings),
        changedBy: userId,
        changeReason: 'UI settings updated via admin panel'
      }
    })

    logger.info('UI settings updated', { 
      userId, 
      keys: Object.keys(settings),
      count: Object.keys(settings).length 
    })

    return res.status(200).json({ 
      success: true, 
      message: 'UI settings updated successfully' 
    })
  } catch (error) {
    logger.error('Error updating UI settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to update UI settings' })
  }
}

async function resetUISettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Delete all existing UI settings
    await prisma.storeSettings.deleteMany({
      where: {
        category: 'ui'
      }
    })

    // Log the reset in settings history
    await prisma.settingsHistory.create({
      data: {
        category: 'ui',
        key: 'ui_settings',
        oldValue: null,
        newValue: 'RESET_TO_DEFAULTS',
        changedBy: userId,
        changeReason: 'UI settings reset to defaults'
      }
    })

    logger.info('UI settings reset to defaults', { userId })

    return res.status(200).json({ 
      success: true, 
      message: 'UI settings reset to defaults successfully' 
    })
  } catch (error) {
    logger.error('Error resetting UI settings', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Failed to reset UI settings' })
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
        return await getUISettings(req, res, session.user.id)
      case 'POST':
        return await updateUISettings(req, res, session.user.id)
      case 'DELETE':
        return await resetUISettings(req, res, session.user.id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('UI settings API error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))
