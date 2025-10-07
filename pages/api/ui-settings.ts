import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
        siteName: 'Little Harvest',
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

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({ 
      success: true, 
      settings: mergedSettings
    })
  } catch (error) {
    console.error('Error fetching public UI settings:', error)
    
    // Return default settings on error
    const defaultSettings = {
      brand: {
        siteName: 'Little Harvest',
        tagline: 'Nutritious meals for little ones',
        logoUrl: '',
        faviconUrl: ''
      },
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#ffffff',
        text: '#111827',
        muted: '#6b7280'
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

    return res.status(200).json({ 
      success: true, 
      settings: defaultSettings
    })
  }
}
