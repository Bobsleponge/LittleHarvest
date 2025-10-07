import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../lib/cart-context'

export default function FloatingCartIcon() {
  const { itemCount, total, isLoading } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  // Show floating cart when there are items
  React.useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true)
    } else {
      // Hide after a delay when cart becomes empty
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [itemCount])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse Animation - moved behind the main icon */}
      {itemCount > 0 && (
        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20 pointer-events-none"></div>
      )}
      
      <Link 
        href="/cart"
        className="group relative flex items-center justify-center w-16 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        {/* Cart Icon */}
        <svg 
          className="w-8 h-8 relative z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse z-20">
            {itemCount > 99 ? '99+' : itemCount}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-emerald-600 rounded-full flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
            <div className="font-semibold">Cart ({itemCount} items)</div>
            <div className="text-emerald-400">R{total.toFixed(2)}</div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </Link>
    </div>
  )
}
