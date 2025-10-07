import { useState } from 'react'
import Link from 'next/link'
import { useBrandSettings, useColorSettings } from '../src/lib/ui-settings-context'

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const brandSettings = useBrandSettings()
  const colorSettings = useColorSettings()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    agreeToTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (mode === 'login' || mode === 'register') {
      if (!formData.password) {
        setError('Password is required')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }
    if (mode === 'register') {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (!formData.agreeToTerms) {
        setError('Please agree to the terms and conditions')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) return

    setLoading(true)

    try {
      if (mode === 'login') {
        // Simulate login API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Determine user role based on email
        const userRole = formData.email.includes('admin') ? 'ADMIN' : 'CUSTOMER'
        const userName = formData.email.includes('admin') ? 'Admin User' : 'Customer User'
        
        // Create user session
        const userSession = {
          email: formData.email,
          name: userName,
          role: userRole,
          loginTime: new Date().toISOString()
        }
        
        // Store session in localStorage
        localStorage.setItem('userSession', JSON.stringify(userSession))
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userSession',
          newValue: JSON.stringify(userSession)
        }))
        
        // Show success message and redirect
        if (userRole === 'ADMIN') {
          setSuccess('Login successful! Redirecting to admin panel...')
          setTimeout(() => {
            window.location.href = '/admin'
          }, 1500)
        } else {
          setSuccess('Login successful! Redirecting to homepage...')
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        }
      } else if (mode === 'register') {
        // Simulate registration API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSuccess('Registration successful! Please check your email to verify your account.')
        setMode('login')
      } else if (mode === 'forgot-password') {
        // Simulate forgot password API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSuccess('Password reset instructions have been sent to your email.')
        setMode('login')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      agreeToTerms: false
    })
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div 
      className="min-h-screen py-12"
      style={{
        background: `linear-gradient(to bottom right, 
          color-mix(in srgb, ${colorSettings.primary} 5%, white), 
          white, 
          color-mix(in srgb, ${colorSettings.accent} 5%, white)
        )`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center space-x-3 mb-4">
                {brandSettings.logoUrl ? (
                  <img 
                    src={brandSettings.logoUrl} 
                    alt={brandSettings.siteName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to right, ${colorSettings.primary}, ${colorSettings.accent})`
                    }}
                  >
                    <span className="text-white font-bold text-xl">
                      {brandSettings.siteName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-bold text-3xl text-gray-800">{brandSettings.siteName}</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot-password' && 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {mode === 'login' && 'Sign in to your account to continue'}
              {mode === 'register' && `Join thousands of families who trust ${brandSettings.siteName}`}
              {mode === 'forgot-password' && 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Auth Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register Fields */}
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full input-focus"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full input-focus"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password Fields */}
              {(mode === 'login' || mode === 'register') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="••••••••"
                    />
                  </div>
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full input-focus"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Terms Agreement */}
              {mode === 'register' && (
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="link-primary-dynamic hover:text-emerald-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="link-primary-dynamic hover:text-emerald-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-dynamic py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot-password' && 'Send Reset Instructions'}
                  </>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => switchMode('forgot-password')}
                    className="link-primary-dynamic hover:text-emerald-700 text-sm font-medium"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      onClick={() => switchMode('register')}
                      className="link-primary-dynamic hover:text-emerald-700 font-medium"
                    >
                      Sign up here
                    </button>
                  </div>
                </>
              )}
              {mode === 'register' && (
                <div className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Sign in here
                  </button>
                </div>
              )}
              {mode === 'forgot-password' && (
                <div className="text-gray-600 text-sm">
                  Remember your password?{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Sign in here
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Login for Development */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Login (Development)</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'admin@tinytastes.co.za', password: 'admin123' }))
                  setMode('login')
                }}
                className="w-full text-left px-3 py-2 bg-white rounded border text-sm hover:bg-gray-50"
              >
                👑 Admin Account
              </button>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'customer@example.com', password: 'customer123' }))
                  setMode('login')
                }}
                className="w-full text-left px-3 py-2 bg-white rounded border text-sm hover:bg-gray-50"
              >
                👶 Customer Account
              </button>
              <button
                onClick={() => {
                  // Quick login as admin
                  const userSession = {
                    email: 'admin@tinytastes.co.za',
                    name: 'Admin User',
                    role: 'ADMIN',
                    loginTime: new Date().toISOString()
                  }
                  localStorage.setItem('userSession', JSON.stringify(userSession))
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'userSession',
                    newValue: JSON.stringify(userSession)
                  }))
                  window.location.href = '/admin'
                }}
                className="w-full text-left px-3 py-2 bg-emerald-100 rounded border text-sm hover:bg-emerald-200 text-emerald-800"
              >
                🚀 Quick Admin Login
              </button>
              <button
                onClick={() => {
                  // Quick login as customer
                  const userSession = {
                    email: 'customer@example.com',
                    name: 'Customer User',
                    role: 'CUSTOMER',
                    loginTime: new Date().toISOString()
                  }
                  localStorage.setItem('userSession', JSON.stringify(userSession))
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'userSession',
                    newValue: JSON.stringify(userSession)
                  }))
                  window.location.href = '/'
                }}
                className="w-full text-left px-3 py-2 bg-blue-100 rounded border text-sm hover:bg-blue-200 text-blue-800"
              >
                🚀 Quick Customer Login
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
