import { useState } from 'react'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  ageGroup: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Organic Apple Puree',
      price: 45,
      quantity: 2,
      image: '🍎',
      ageGroup: '6-8 months'
    },
    {
      id: '2',
      name: 'Sweet Potato Mash',
      price: 42,
      quantity: 1,
      image: '🍠',
      ageGroup: '6-8 months'
    }
  ])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 200 ? 0 : 25
  const total = subtotal + shipping

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {cartItems.length === 0 ? (
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
                        <div className="text-4xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">Age: {item.ageGroup}</p>
                          <p className="text-lg font-semibold text-emerald-600">R{item.price}</p>
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
                            R{item.price * item.quantity}
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
    </div>
  )
}
