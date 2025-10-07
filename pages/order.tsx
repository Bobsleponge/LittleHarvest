import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../src/components/header'
import Footer from '../src/components/footer'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  ageRange: string
  ingredients: string[]
  nutritionInfo: string
}

interface CartItem {
  product: Product
  quantity: number
}

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTime: 'morning',
    paymentMethod: 'card'
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required'
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address'
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required'
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required'
    } else {
      const selectedDate = new Date(formData.deliveryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.deliveryDate = 'Delivery date cannot be in the past'
      }
    }

    if (cart.length === 0) {
      newErrors.cart = 'Please add at least one item to your cart'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const orderData = {
        ...formData,
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        setOrderNumber(result.orderNumber)
        setShowSuccessAnimation(true)
        
        // Show success animation for 2 seconds before showing success page
        setTimeout(() => {
          setOrderSuccess(true)
          setCart([])
          setFormData({
            customerName: '',
            customerEmail: '',
            deliveryAddress: '',
            deliveryDate: '',
            deliveryTime: 'morning',
            paymentMethod: 'card'
          })
        }, 2000)
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to place order. Please try again.' })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setErrors({ submit: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccessAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-8xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Order...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for choosing Little Harvest! Your order has been received and is being processed.
              </p>
              <div className="bg-emerald-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-emerald-800 mb-2">Order Details</h2>
                <p className="text-emerald-700 font-medium">Order Number: {orderNumber}</p>
                <p className="text-emerald-700">Total: R{getTotal()}</p>
              </div>
              <div className="space-y-4">
                <Link
                  href="/"
                  className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/admin/orders"
                  className="inline-block ml-4 border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                >
                  View Orders (Admin)
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Place Your Order</h1>
            <p className="text-lg text-gray-600">Choose from our selection of nutritious baby foods</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{product.image}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <p className="text-xs text-emerald-600 mb-2">Age: {product.ageRange}</p>
                          <p className="text-lg font-bold text-emerald-600">R{product.price}</p>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart and Order Form */}
            <div className="space-y-6">
              {/* Cart */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cart</h2>
                
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3">
                        <div className="text-2xl">{item.product.image}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">R{item.product.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="font-bold text-emerald-600">R{getTotal()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Form */}
              {cart.length > 0 && (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.customerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.customerName && (
                        <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.customerEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address *
                      </label>
                      <textarea
                        required
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.deliveryAddress && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.deliveryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Time *
                      </label>
                      <select
                        required
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="morning">Morning (8:00 - 12:00)</option>
                        <option value="afternoon">Afternoon (12:00 - 16:00)</option>
                        <option value="evening">Evening (16:00 - 20:00)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method *
                      </label>
                      <select
                        required
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="card">Credit/Debit Card</option>
                        <option value="cash">Cash on Delivery</option>
                        <option value="eft">EFT Transfer</option>
                      </select>
                    </div>

                    {errors.cart && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{errors.cart}</p>
                      </div>
                    )}

                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Placing Order...' : `Place Order - R${getTotal()}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
