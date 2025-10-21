import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Connected to actual project
const supabase = createClient(
  'https://blvyyxkoxcrlgxggkqle.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdnl5eGtveGNybGd4Z2drcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTQxMDEsImV4cCI6MjA3NTgzMDEwMX0.2yqNHjmCpju2ZsZ4YbgnUYHTH2xoVqHhHZf16TkRDxg'
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: uiSettings, error } = await supabase
      .from('StoreSettings')
      .select('*')
      .eq('category', 'ui')
      .eq('isActive', true)
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching public UI settings:', error)
      // Return default settings if database error
      const defaultSettings = {
        brand: {
          name: 'Harviz & Co',
          logo: '🌱',
          tagline: 'Nutritious meals for little ones',
          primaryColor: '#10b981',
          secondaryColor: '#f3f4f6'
        },
        layout: {
          headerStyle: 'modern',
          footerStyle: 'minimal',
          sidebarCollapsed: false
        },
        features: {
          enableReviews: true,
          enableWishlist: true,
          enableNotifications: true,
          enableSocialLogin: true
        }
      }
      return res.status(200).json(defaultSettings)
    }

    // Transform settings into a more usable format
    const settings = (uiSettings || []).reduce((acc, setting) => {
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
        siteName: 'Harviz & Co',
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
        muted: '#6b7280', // gray-500
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      themes: {
        light: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#ffffff',
          text: '#111827',
          muted: '#6b7280',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        dark: {
          primary: '#34d399',
          secondary: '#10b981',
          accent: '#6ee7b7',
          background: '#111827',
          text: '#f9fafb',
          muted: '#9ca3af',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#60a5fa'
        },
        custom: [],
        active: 'light'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFont: 'Inter, system-ui, sans-serif',
        fontSize: 'medium',
        lineHeight: 'normal'
      },
      layout: {
        headerHeight: 64,
        sidebarWidth: 256,
        borderRadius: 'medium',
        spacing: 'normal'
      },
      animations: {
        transitions: true,
        duration: 200,
        easing: 'ease-in-out',
        reducedMotion: false
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'normal',
        focusVisible: true
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
      },
      advanced: {
        customCSS: '',
        customJS: '',
        themePresets: [
          {
            name: 'Ocean Breeze',
            colors: {
              primary: '#0ea5e9',
              secondary: '#0284c7',
              accent: '#38bdf8',
              background: '#f0f9ff',
              text: '#0c4a6e',
              muted: '#64748b',
              success: '#10b981',
              warning: '#f59e0b',
              error: '#ef4444',
              info: '#3b82f6'
            }
          },
          {
            name: 'Sunset Glow',
            colors: {
              primary: '#f97316',
              secondary: '#ea580c',
              accent: '#fb923c',
              background: '#fff7ed',
              text: '#9a3412',
              muted: '#78716c',
              success: '#10b981',
              warning: '#f59e0b',
              error: '#ef4444',
              info: '#3b82f6'
            }
          }
        ]
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
        siteName: 'Harviz & Co',
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
        muted: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      themes: {
        light: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#ffffff',
          text: '#111827',
          muted: '#6b7280',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        dark: {
          primary: '#34d399',
          secondary: '#10b981',
          accent: '#6ee7b7',
          background: '#111827',
          text: '#f9fafb',
          muted: '#9ca3af',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#60a5fa'
        },
        custom: [],
        active: 'light'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFont: 'Inter, system-ui, sans-serif',
        fontSize: 'medium',
        lineHeight: 'normal'
      },
      layout: {
        headerHeight: 64,
        sidebarWidth: 256,
        borderRadius: 'medium',
        spacing: 'normal'
      },
      animations: {
        transitions: true,
        duration: 200,
        easing: 'ease-in-out',
        reducedMotion: false
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'normal',
        focusVisible: true
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
      },
      advanced: {
        customCSS: '',
        customJS: '',
        themePresets: []
      }
    }

    return res.status(200).json({ 
      success: true, 
      settings: defaultSettings
    })
  }
}
