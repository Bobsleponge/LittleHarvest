import React, { createContext, useContext, useState, useEffect } from 'react'

interface NotificationContextType {
  unreadCount: number
  totalCount: number
  highPriorityCount: number
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [highPriorityCount, setHighPriorityCount] = useState(0)

  const fetchNotificationCounts = async () => {
    try {
      // Fetch products and orders data to calculate notification counts
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ])

      const productsData = await productsResponse.json()
      const ordersData = await ordersResponse.json()

      // Calculate notification counts based on the same logic as the notifications page
      let totalNotifications = 0
      let unreadNotifications = 0
      let highPriorityNotifications = 0

      // Count stock alerts
      const products = productsData.products || []
      products.forEach((product: any) => {
        if (product.stock === 0) {
          totalNotifications++
          unreadNotifications++
          highPriorityNotifications++
        } else if (product.stock <= (product.minStock || 5)) {
          totalNotifications++
          unreadNotifications++
          highPriorityNotifications++
        }
      })

      // Count order notifications
      const orders = ordersData.orders || []
      orders.forEach((order: any) => {
        if (order.status === 'pending') {
          totalNotifications++
          unreadNotifications++
          highPriorityNotifications++
        }
        if (order.status === 'processing') {
          const orderTime = new Date(order.date)
          const now = new Date()
          const hoursDiff = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)
          if (hoursDiff > 2) {
            totalNotifications++
            unreadNotifications++
            highPriorityNotifications++
          }
        }
      })

      setUnreadCount(unreadNotifications)
      setTotalCount(totalNotifications)
      setHighPriorityCount(highPriorityNotifications)
    } catch (error) {
      console.error('Error fetching notification counts:', error)
      // Set fallback values
      setUnreadCount(0)
      setTotalCount(0)
      setHighPriorityCount(0)
    }
  }

  const refreshNotifications = () => {
    fetchNotificationCounts()
  }

  useEffect(() => {
    fetchNotificationCounts()
    
    // Refresh every 30 seconds to keep counts updated
    const interval = setInterval(fetchNotificationCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      totalCount,
      highPriorityCount,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
