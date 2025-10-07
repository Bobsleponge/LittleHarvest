import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type DateRange = '1d' | '7d' | '30d' | '90d' | '1y' | 'all'

interface AdminDateContextType {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  getDateFilter: () => { startDate: Date | null; endDate: Date | null }
  formatDateRange: () => string
}

const AdminDateContext = createContext<AdminDateContextType | undefined>(undefined)

interface AdminDateProviderProps {
  children: ReactNode
}

export function AdminDateProvider({ children }: AdminDateProviderProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  // Load saved date range from localStorage on mount
  useEffect(() => {
    const savedDateRange = localStorage.getItem('admin-date-range') as DateRange
    if (savedDateRange && ['1d', '7d', '30d', '90d', '1y', 'all'].includes(savedDateRange)) {
      setDateRange(savedDateRange)
    }
  }, [])

  // Save date range to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin-date-range', dateRange)
  }, [dateRange])

  const getDateFilter = () => {
    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date | null = null

    switch (dateRange) {
      case '1d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case 'all':
        startDate = null
        endDate = null
        break
    }

    return { startDate, endDate }
  }

  const formatDateRange = () => {
    const { startDate, endDate } = getDateFilter()
    
    if (!startDate || !endDate) {
      return 'All Time'
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }

    if (dateRange === '1d') {
      return startDate.toLocaleDateString('en-US', formatOptions)
    }

    const startStr = startDate.toLocaleDateString('en-US', formatOptions)
    const endStr = endDate.toLocaleDateString('en-US', formatOptions)
    
    return `${startStr} - ${endStr}`
  }

  const value: AdminDateContextType = {
    dateRange,
    setDateRange,
    getDateFilter,
    formatDateRange
  }

  return (
    <AdminDateContext.Provider value={value}>
      {children}
    </AdminDateContext.Provider>
  )
}

export function useAdminDate() {
  const context = useContext(AdminDateContext)
  if (context === undefined) {
    throw new Error('useAdminDate must be used within an AdminDateProvider')
  }
  return context
}
