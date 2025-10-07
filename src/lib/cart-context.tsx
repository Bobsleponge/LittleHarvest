import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    description: string
    imageUrl?: string
    ageGroup: string
    texture: string
    contains?: string
    mayContain?: string
  }
  portionSize: {
    id: string
    name: string
    description: string
    measurement: string
  }
  quantity: number
  unitPrice: number
  lineTotal: number
  addedAt: string
  notes?: string
  childProfileId?: string
  shoppingMode: 'family' | 'child'
}

interface CartContextType {
  cartItems: CartItem[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  isLoading: boolean
  error: string | null
  refreshCart: () => Promise<void>
  addToCartSuccess: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch cart items from API
  const fetchCartItems = async () => {
    if (status === 'loading') {
      // Session is still loading, don't fetch yet
      setIsLoading(false)
      setCartItems([])
      setError(null)
      return
    }

    if (!session) {
      // No session, clear cart
      setIsLoading(false)
      setCartItems([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cart', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.cart?.items || [])
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load cart')
        setCartItems([])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      setError('Failed to load cart')
      setCartItems([])
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh cart (public method)
  const refreshCart = useCallback(async () => {
    await fetchCartItems()
  }, [])

  // Trigger cart refresh when item is added
  const addToCartSuccess = useCallback(() => {
    // Trigger immediate refresh
    fetchCartItems()
  }, [])

  // Load cart items when session changes or when manually refreshed
  useEffect(() => {
    fetchCartItems()
  }, [session?.user?.id, status])

  // Calculate totals
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = subtotal > 200 ? 0 : 25
  const total = subtotal + shipping

  const value: CartContextType = {
    cartItems,
    itemCount,
    subtotal,
    shipping,
    total,
    isLoading,
    error,
    refreshCart,
    addToCartSuccess
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
