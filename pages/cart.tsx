import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Navigation from '../src/components/navigation'
import Footer from '../src/components/footer'
import { useCart } from '../src/lib/cart-context'

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
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const { cartItems, isLoading, refreshCart } = useCart()
  const [error, setError] = useState<string | null>(null)

  // Update item quantity
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId: id,
          quantity: newQuantity
        })
      })

      if (response.ok) {
        // Refresh cart items
        await refreshCart()
      } else {
        const errorData = await response.json()
        alert(`Failed to update quantity: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Failed to update quantity')
    }
  }

  // Remove item from cart
  const removeItem = async (id: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId: id
        })
      })

      if (response.ok) {
        // Refresh cart items
        await refreshCart()
      } else {
        const errorData = await response.json()
        alert(`Failed to remove item: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item')
    }
  }

  // Load cart items when session changes
  useEffect(() => {
    if (session) {
      refreshCart()
    }
  }, [session, status, refreshCart])

  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = subtotal > 200 ? 0 : 25
  const total = subtotal + shipping

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Show login required
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">TT</span>
                  </div>
                  <span className="font-bold text-2xl text-gray-800">Tiny Tastes</span>
                </Link>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/products" className="text-gray-600 hover:text-gray-800 font-semibold">Products</Link>
                <Link href="/cart" className="text-emerald-600 font-semibold">Cart</Link>
                <Link href="/dev-login" className="text-gray-600 hover:text-gray-800 font-semibold">Login</Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">Please log in to view your cart</p>
            <Link 
              href="/dev-login"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show cart loading state (when session exists but cart is still loading)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="cart" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {error ? (
          /* Error State */
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Cart</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={refreshCart}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some delicious baby food to get started!</p>
            <Link 
              href="/products"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
                </div>
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                if (nextElement) {
                                  nextElement.style.display = 'block'
                                }
                              }}
                            />
                          ) : null}
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl" style={{ display: item.product.imageUrl ? 'none' : 'flex' }}>
                            🍼
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">Age: {item.product.ageGroup}</p>
                          <p className="text-sm text-gray-600">Texture: {item.product.texture}</p>
                          <p className="text-sm text-gray-600">Portion: {item.portionSize.name}</p>
                          <p className="text-lg font-semibold text-emerald-600">R{item.unitPrice}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            R{item.lineTotal}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `R${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-sm text-emerald-600">
                      Add R{200 - subtotal} more for free shipping!
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>R{total}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link 
                    href="/checkout"
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link 
                    href="/products"
                    className="w-full border border-emerald-600 text-emerald-600 py-3 px-4 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Shipping Info */}
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-medium text-emerald-800 mb-2">🚚 Free Shipping</h3>
                  <p className="text-sm text-emerald-700">
                    Free delivery on orders over R200. Same-day delivery available in Cape Town.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
