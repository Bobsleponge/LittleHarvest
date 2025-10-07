'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface UISettings {
  brand: {
    siteName: string
    tagline: string
    logoUrl: string
    faviconUrl: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  typography: {
    fontFamily: string
    headingFont: string
  }
  layout: {
    headerHeight: number
    sidebarWidth: number
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
        setSettings(data.settings)
      } else {
        throw new Error('Failed to fetch UI settings')
      }
    } catch (err) {
      console.error('Error fetching UI settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Keep default settings on error
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

  // Apply CSS custom properties for colors
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', settings.colors.primary)
    root.style.setProperty('--color-secondary', settings.colors.secondary)
    root.style.setProperty('--color-accent', settings.colors.accent)
    root.style.setProperty('--color-background', settings.colors.background)
    root.style.setProperty('--color-text', settings.colors.text)
    root.style.setProperty('--color-muted', settings.colors.muted)
    
    // Apply font families
    root.style.setProperty('--font-family', settings.typography.fontFamily)
    root.style.setProperty('--font-heading', settings.typography.headingFont)
    
    // Apply layout dimensions
    root.style.setProperty('--header-height', `${settings.layout.headerHeight}px`)
    root.style.setProperty('--sidebar-width', `${settings.layout.sidebarWidth}px`)
  }, [settings])

  // Update document title and favicon
  useEffect(() => {
    if (settings.brand.siteName) {
      document.title = settings.brand.siteName
    }
    
    if (settings.brand.faviconUrl) {
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
  }, [settings.brand])

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

// Utility functions for easy access to specific settings
export function useBrandSettings() {
  const { settings } = useUISettings()
  return settings.brand
}

export function useColorSettings() {
  const { settings } = useUISettings()
  return settings.colors
}

export function useTypographySettings() {
  const { settings } = useUISettings()
  return settings.typography
}

export function useLayoutSettings() {
  const { settings } = useUISettings()
  return settings.layout
}

export function useSocialSettings() {
  const { settings } = useUISettings()
  return settings.social
}

export function useContactSettings() {
  const { settings } = useUISettings()
  return settings.contact
}
