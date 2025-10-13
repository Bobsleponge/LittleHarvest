import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Navigation from '../src/components/navigation'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  quantity: number
}

export default function CartPage() {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          setCartItems(data.items || [])
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="cart" />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="cart" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your cart</p>
            <a href="/auth/signin" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="cart" />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <a href="/products" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-6">Cart Items ({cartItems.length})</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="text-4xl">{item.product.image}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R{item.product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>R{cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <a href="/checkout" className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors block text-center">
                    Proceed to Checkout
                  </a>
                  <a href="/products" className="w-full border border-emerald-600 text-emerald-600 py-3 px-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors block text-center">
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}