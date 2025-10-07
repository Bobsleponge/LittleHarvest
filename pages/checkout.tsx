import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navigation from '../src/components/navigation'
import Footer from '../src/components/footer'
import { useCart } from '../src/lib/cart-context'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

// CartItem interface is imported from cart-context

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { cartItems, total, subtotal, shipping } = useCart()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: 'eft',
    specialInstructions: ''
  })

  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderReference, setOrderReference] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  // Generate unique reference number for EFT payments
  const generateReferenceNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TT${timestamp}${random}`
  }

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        email: session.user.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        deliveryDate: '',
        deliveryTime: '',
        paymentMethod: 'eft',
        specialInstructions: ''
      }))
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/dev-login'
    }
  }, [status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const referenceNumber = generateReferenceNumber()
      setOrderReference(referenceNumber)
      
      // Create order via API
      const orderData = {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        deliveryInfo: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          deliveryDate: formData.deliveryDate,
          deliveryTime: formData.deliveryTime,
          specialInstructions: formData.specialInstructions
        },
        paymentInfo: {
          method: formData.paymentMethod,
          referenceNumber: referenceNumber,
          amount: total
        },
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
          childProfileId: item.childProfileId,
          shoppingMode: item.shoppingMode
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        setOrderNumber(result.orderNumber)
        setOrderPlaced(true)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading if checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  // Show empty cart message
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="checkout" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-4">Add some products to your cart before checking out.</p>
            <Link 
              href="/products"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="checkout" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
              
              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">R{total}</span>
                  </div>
                  {formData.paymentMethod === 'eft' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">EFT Transfer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference Number:</span>
                        <span className="font-medium text-emerald-600">{orderReference}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* EFT Payment Instructions */}
              {formData.paymentMethod === 'eft' && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-blue-900 mb-3">💳 EFT Payment Instructions</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Bank:</strong> Standard Bank</p>
                    <p><strong>Account Name:</strong> Little Harvest (Pty) Ltd</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>Branch Code:</strong> 051001</p>
                    <p><strong>Reference:</strong> <span className="font-mono font-bold">{orderReference}</span></p>
                    <p className="mt-3 text-blue-700">
                      <strong>Important:</strong> Please use the exact reference number above when making your payment. 
                      This ensures your payment is matched to your order.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link 
                  href="/orders"
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors block"
                >
                  View Orders
                </Link>
                <Link 
                  href="/products"
                  className="w-full border border-emerald-600 text-emerald-600 py-3 px-4 rounded-lg font-medium hover:bg-emerald-50 transition-colors block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="checkout" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Delivery Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date *</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time *</label>
                  <select
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select time</option>
                    <option value="morning">Morning (8:00 - 12:00)</option>
                    <option value="afternoon">Afternoon (12:00 - 16:00)</option>
                    <option value="evening">Evening (16:00 - 20:00)</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="eft"
                      checked={formData.paymentMethod === 'eft'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">EFT Transfer</div>
                      <div className="text-sm text-gray-600">Pay via bank transfer with unique reference number</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when your order is delivered</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => {
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <span className="text-2xl hidden">🍎</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500">Note: {item.notes}</p>
                      )}
                    </div>
                    <span className="font-medium">R{item.lineTotal}</span>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t pt-4">
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
              <div className="flex justify-between text-lg font-semibold border-t pt-3">
                <span>Total</span>
                <span>R{total}</span>
              </div>
            </div>

            {/* Payment Notice */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <h3 className="font-medium text-emerald-800 mb-2">💳 Payment Information</h3>
              <p className="text-sm text-emerald-700">
                {formData.paymentMethod === 'eft' 
                  ? 'You will receive a unique reference number for EFT payment after placing your order.'
                  : 'Payment will be collected when your order is delivered.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
