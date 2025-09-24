import { useState } from 'react'
import Link from 'next/link'

const adminAccounts = [
  { email: 'admin@tinytastes.co.za', name: 'Admin User', role: 'ADMIN' },
  { email: 'manager@tinytastes.co.za', name: 'Manager User', role: 'ADMIN' },
]

const customerAccounts = [
  { email: 'customer@example.com', name: 'Customer User', role: 'CUSTOMER' },
  { email: 'parent@example.com', name: 'Parent User', role: 'CUSTOMER' },
]

export default function DevLoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleQuickLogin = async (email: string) => {
    try {
      setLoading(email)
      setError(null)
      setSuccess(null)

      // Call the dev-login API to create/get the user
      const response = await fetch('/api/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Login failed. Please try again.')
        return
      }

      const data = await response.json()

      if (data.success) {
        setSuccess(`Successfully logged in as ${data.user.name} (${data.user.role})`)
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'ADMIN') {
            window.location.href = '/admin'
          } else {
            window.location.href = '/products'
          }
        }, 1500)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">TT</span>
              </div>
              <span className="font-bold text-3xl text-gray-800">Tiny Tastes</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Development Login</h1>
            <p className="text-gray-600">Quick login for development and testing</p>
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

          {/* Admin Accounts */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">👑</span>
              Admin Accounts
            </h2>
            <div className="space-y-3">
              {adminAccounts.map((account) => (
                <div key={account.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{account.name}</div>
                    <div className="text-sm text-gray-600">{account.email}</div>
                    <div className="text-xs text-emerald-600 font-medium">{account.role}</div>
                  </div>
                  <button
                    onClick={() => handleQuickLogin(account.email)}
                    disabled={loading === account.email}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === account.email ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Accounts */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">👶</span>
              Customer Accounts
            </h2>
            <div className="space-y-3">
              {customerAccounts.map((account) => (
                <div key={account.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{account.name}</div>
                    <div className="text-sm text-gray-600">{account.email}</div>
                    <div className="text-xs text-blue-600 font-medium">{account.role}</div>
                  </div>
                  <button
                    onClick={() => handleQuickLogin(account.email)}
                    disabled={loading === account.email}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === account.email ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
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
