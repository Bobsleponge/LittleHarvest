import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { supabaseAdmin } from '../../../../src/lib/supabaseClient'
import { logger } from '../../../../src/lib/logger'
import { validateSettings, validateBusinessHours, validateDeliveryTimeSlots, validatePaymentMethods, validateIpWhitelist } from '../../../../src/lib/settings-validation'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS, getRateLimitKey } from '../../../../src/lib/rate-limit'

async function getSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { category } = req.query
    
    const whereClause = category ? { category: category as string } : {}
    
    let query = supabaseAdmin
      .from('StoreSettings')
      .select('*')
      .eq('isActive', true)
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (category) {
      query = query.eq('category', category as string)
    }

    const { data: settings, error } = await query

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`)
    }

    // Transform settings into a more usable format
    const settingsByCategory = (settings || []).reduce((acc, setting) => {
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
      count: settings?.length || 0
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
    const { category, settings } = req.body
    
    if (!category || !settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data - category and settings required' })
    }

    // Validate settings based on category
    const validationResult = validateSettings(category, settings)
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        error: 'Invalid settings', 
        details: validationResult.errors 
      })
    }

    // Update settings in database
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      // Ensure rate limiting is always enabled for system category
      const finalValue = (category === 'system' && key === 'rateLimiting') ? true : value
      
      return supabaseAdmin
        .from('StoreSettings')
        .upsert({
          category: category,
          key: key,
          value: JSON.stringify(finalValue),
          updatedBy: userId,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'category,key'
        })
        .select()
        .single()
    })

    await Promise.all(updatePromises)

    // Log the change to settings history
    await prisma.settingsHistory.create({
      data: {
        category: category,
        key: 'bulk_update',
        oldValue: null,
        newValue: JSON.stringify(Object.keys(settings)),
        changedBy: userId,
        changeReason: `Updated ${Object.keys(settings).length} ${category} settings`
      }
    })

    logger.info('Settings updated', { 
      userId, 
      category,
      keys: Object.keys(settings),
      count: Object.keys(settings).length 
    })

    return res.status(200).json({ 
      success: true, 
      message: `${category} settings updated successfully` 
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