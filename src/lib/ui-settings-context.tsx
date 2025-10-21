'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  muted: string
  success: string
  warning: string
  error: string
  info: string
}

interface UISettings {
  brand: {
    siteName: string
    tagline: string
    logoUrl: string
    faviconUrl: string
  }
  colors: ColorScheme
  themes: {
    light: ColorScheme
    dark: ColorScheme
    custom: Array<{
      name: string
      colors: ColorScheme
      id: string
    }>
    active: 'light' | 'dark' | string // string for custom theme ID
  }
  typography: {
    fontFamily: string
    headingFont: string
    fontSize: 'small' | 'medium' | 'large'
    lineHeight: 'tight' | 'normal' | 'relaxed'
  }
  layout: {
    headerHeight: number
    sidebarWidth: number
    borderRadius: 'none' | 'small' | 'medium' | 'large'
    spacing: 'compact' | 'normal' | 'comfortable'
  }
  animations: {
    transitions: boolean
    duration: number
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
    reducedMotion: boolean
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    fontSize: 'small' | 'medium' | 'large'
    focusVisible: boolean
  }
  social: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
  }
  contact: {
    email: string
    phone: string
    address: string
  }
  advanced: {
    customCSS: string
    customJS: string
    themePresets: Array<{
      name: string
      description: string
      settings: Partial<UISettings>
      id: string
    }>
  }
}

interface UISettingsContextType {
  settings: UISettings
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined)

const defaultSettings: UISettings = {
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
    fontSize: 'medium',
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
        id: 'default',
        name: 'Default Theme',
        description: 'Clean and professional default theme',
        settings: {}
      },
      {
        id: 'nature',
        name: 'Nature Theme',
        description: 'Earth tones inspired by natural ingredients',
        settings: {
          colors: {
            primary: '#16a34a',
            secondary: '#15803d',
            accent: '#22c55e',
            background: '#f0fdf4',
            text: '#14532d',
            muted: '#65a30d',
            success: '#16a34a',
            warning: '#eab308',
            error: '#dc2626',
            info: '#2563eb'
          }
        }
      },
      {
        id: 'sunset',
        name: 'Sunset Theme',
        description: 'Warm sunset colors for a cozy feel',
        settings: {
          colors: {
            primary: '#f97316',
            secondary: '#ea580c',
            accent: '#fb923c',
            background: '#fff7ed',
            text: '#9a3412',
            muted: '#c2410c',
            success: '#16a34a',
            warning: '#eab308',
            error: '#dc2626',
            info: '#2563eb'
          }
        }
      }
    ]
  }
}

interface UISettingsProviderProps {
  children: ReactNode
}

export function UISettingsProvider({ children }: UISettingsProviderProps) {
  const [settings, setSettings] = useState<UISettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/ui-settings')
      if (response.ok) {
        const data = await response.json()
        // Ensure we have a valid settings object with proper structure
        if (data.settings && typeof data.settings === 'object') {
          setSettings(data.settings)
        } else {
          // If the API returns unexpected data structure, use default settings
          setSettings(defaultSettings)
        }
      } else {
        throw new Error('Failed to fetch UI settings')
      }
    } catch (err) {
      console.error('Error fetching UI settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Keep default settings on error
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Apply CSS custom properties for colors and enhanced features
  useEffect(() => {
    if (!settings) return
    
    const root = document.documentElement
    
    // Get active theme colors with proper fallbacks
    const themes = settings.themes || defaultSettings.themes
    const activeThemeId = themes.active || 'light'
    
    let activeTheme: ColorScheme
    
    if (activeThemeId === 'light') {
      activeTheme = themes.light || defaultSettings.themes.light
    } else if (activeThemeId === 'dark') {
      activeTheme = themes.dark || defaultSettings.themes.dark
    } else {
      // Custom theme
      const customTheme = themes.custom?.find(t => t.id === activeThemeId)
      activeTheme = customTheme?.colors || settings.colors || defaultSettings.colors
    }
    
    // Apply color scheme
    root.style.setProperty('--color-primary', activeTheme.primary)
    root.style.setProperty('--color-secondary', activeTheme.secondary)
    root.style.setProperty('--color-accent', activeTheme.accent)
    root.style.setProperty('--color-background', activeTheme.background)
    root.style.setProperty('--color-text', activeTheme.text)
    root.style.setProperty('--color-muted', activeTheme.muted)
    root.style.setProperty('--color-success', activeTheme.success)
    root.style.setProperty('--color-warning', activeTheme.warning)
    root.style.setProperty('--color-error', activeTheme.error)
    root.style.setProperty('--color-info', activeTheme.info)
    
    // Apply typography
    root.style.setProperty('--font-family', settings.typography?.fontFamily || defaultSettings.typography.fontFamily)
    root.style.setProperty('--font-heading', settings.typography?.headingFont || defaultSettings.typography.headingFont)
    
    // Apply font size scaling
    const fontSizeMultiplier = settings.typography?.fontSize === 'small' ? 0.875 : 
                              settings.typography?.fontSize === 'large' ? 1.125 : 1
    root.style.setProperty('--font-size-multiplier', fontSizeMultiplier.toString())
    
    // Apply line height
    const lineHeight = settings.typography?.lineHeight === 'tight' ? 1.25 :
                      settings.typography?.lineHeight === 'relaxed' ? 1.75 : 1.5
    root.style.setProperty('--line-height', lineHeight.toString())
    
    // Apply layout dimensions
    root.style.setProperty('--header-height', `${settings.layout?.headerHeight || defaultSettings.layout.headerHeight}px`)
    root.style.setProperty('--sidebar-width', `${settings.layout?.sidebarWidth || defaultSettings.layout.sidebarWidth}px`)
    
    // Apply border radius
    const borderRadius = settings.layout?.borderRadius === 'none' ? '0px' :
                        settings.layout?.borderRadius === 'small' ? '4px' :
                        settings.layout?.borderRadius === 'large' ? '12px' : '8px'
    root.style.setProperty('--border-radius', borderRadius)
    
    // Apply spacing
    const spacing = settings.layout?.spacing === 'compact' ? '0.5rem' :
                   settings.layout?.spacing === 'comfortable' ? '1.5rem' : '1rem'
    root.style.setProperty('--spacing', spacing)
    
    // Apply animations
    root.style.setProperty('--transition-duration', `${settings.animations?.duration || defaultSettings.animations.duration}ms`)
    root.style.setProperty('--transition-easing', settings.animations?.easing || defaultSettings.animations.easing)
    root.style.setProperty('--transition-enabled', settings.animations?.transitions ? '1' : '0')
    
    // Apply accessibility settings
    root.style.setProperty('--high-contrast', settings.accessibility?.highContrast ? '1' : '0')
    root.style.setProperty('--reduced-motion', settings.accessibility?.reducedMotion ? '1' : '0')
    root.style.setProperty('--focus-visible', settings.accessibility?.focusVisible ? '1' : '0')
    
    // Apply custom CSS if provided
    if (settings.advanced?.customCSS) {
      const styleId = 'custom-ui-styles'
      let customStyle = document.getElementById(styleId)
      if (!customStyle) {
        customStyle = document.createElement('style')
        customStyle.id = styleId
        document.head.appendChild(customStyle)
      }
      customStyle.textContent = settings.advanced.customCSS
    }
    
    // Apply custom JS if provided
    if (settings.advanced?.customJS) {
      try {
        // Execute custom JavaScript (be careful with this in production)
        eval(settings.advanced.customJS)
      } catch (error) {
        console.warn('Custom JavaScript execution failed:', error)
      }
    }
    
    // Update document class for theme switching
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${settings.themes?.active || 'light'}`)
    
    // Update document class for accessibility
    root.classList.toggle('high-contrast', settings.accessibility?.highContrast || false)
    root.classList.toggle('reduced-motion', settings.accessibility?.reducedMotion || false)
    root.classList.toggle('large-text', settings.accessibility?.fontSize === 'large')
    
  }, [settings])

  // Update document title and favicon
  useEffect(() => {
    if (settings?.brand?.siteName) {
      document.title = settings.brand.siteName
    }
    
    if (settings?.brand?.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = settings.brand.faviconUrl
      } else {
        const newFavicon = document.createElement('link')
        newFavicon.rel = 'icon'
        newFavicon.href = settings.brand.faviconUrl
        document.head.appendChild(newFavicon)
      }
    }
  }, [settings?.brand])

  const value: UISettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings
  }

  return (
    <UISettingsContext.Provider value={value}>
      {children}
    </UISettingsContext.Provider>
  )
}

export function useUISettings(): UISettingsContextType {
  const context = useContext(UISettingsContext)
  if (context === undefined) {
    throw new Error('useUISettings must be used within a UISettingsProvider')
  }
  return context
}

// Enhanced utility functions for easy access to specific settings
export function useBrandSettings() {
  const { settings } = useUISettings()
  return settings?.brand || defaultSettings.brand
}

export function useColorSettings() {
  const { settings } = useUISettings()
  return settings?.colors || defaultSettings.colors
}

export function useThemeSettings() {
  const { settings } = useUISettings()
  return settings?.themes || defaultSettings.themes
}

export function useActiveTheme() {
  const { settings } = useUISettings()
  const themes = settings?.themes || defaultSettings.themes
  const activeTheme = themes.active === 'light' 
    ? themes.light 
    : themes.active === 'dark' 
      ? themes.dark 
      : themes.custom?.find(t => t.id === themes.active)?.colors || settings?.colors || defaultSettings.colors
  return activeTheme
}

export function useAnimationSettings() {
  const { settings } = useUISettings()
  return settings?.animations || defaultSettings.animations
}

export function useAccessibilitySettings() {
  const { settings } = useUISettings()
  return settings?.accessibility || defaultSettings.accessibility
}

export function useLayoutSettings() {
  const { settings } = useUISettings()
  return settings?.layout || defaultSettings.layout
}

export function useTypographySettings() {
  const { settings } = useUISettings()
  return settings?.typography || defaultSettings.typography
}

// Theme management utilities
export function useThemeManager() {
  const { settings, refreshSettings } = useUISettings()
  
  const switchTheme = async (themeId: string) => {
    // This would typically call an API to update the theme
    // For now, we'll just refresh settings
    await refreshSettings()
  }
  
  const createCustomTheme = async (name: string, colors: ColorScheme) => {
    // This would typically call an API to create a new theme
    await refreshSettings()
  }
  
  const deleteCustomTheme = async (themeId: string) => {
    // This would typically call an API to delete a theme
    await refreshSettings()
  }
  
  const exportTheme = () => {
    const brandName = settings?.brand?.siteName || defaultSettings.brand.siteName
    const themeData = {
      name: brandName,
      version: '1.0.0',
      settings: settings || defaultSettings,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brandName}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const importTheme = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string)
          resolve(themeData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
  
  const themes = settings?.themes || defaultSettings.themes
  return {
    switchTheme,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    availableThemes: [
      { id: 'light', name: 'Light Theme', colors: themes.light },
      { id: 'dark', name: 'Dark Theme', colors: themes.dark },
      ...(themes.custom || [])
    ],
    activeTheme: themes.active
  }
}

export function useSocialSettings() {
  const { settings } = useUISettings()
  return settings?.social || defaultSettings.social
}

export function useContactSettings() {
  const { settings } = useUISettings()
  return settings?.contact || defaultSettings.contact
}
