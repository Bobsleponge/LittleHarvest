import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('dev-login', {
        email,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        window.location.href = '/admin'
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDevLogin = async (email: string) => {
    setLoading(true)
    setError('')

    try {
      // First create/get the user via dev-login API
      const response = await fetch('/api/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      // Then sign in with NextAuth
      const result = await signIn('dev-login', {
        email,
        redirect: false,
      })

      if (result?.error) {
        setError('Login failed')
      } else {
        window.location.href = '/admin'
      }
    } catch (err) {
      setError('Dev login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">TT</span>
              </div>
              <span className="font-bold text-3xl text-gray-800">Tiny Tastes</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Sign In</h1>
            <p className="text-gray-600">Sign in to access the admin panel</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="admin@tinytastes.co.za"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Dev Login Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Dev Login</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDevLogin('admin@tinytastes.co.za')}
                disabled={loading}
                className="w-full text-left px-3 py-2 bg-emerald-100 rounded border text-sm hover:bg-emerald-200 text-emerald-800 disabled:opacity-50"
              >
                👑 Admin User (admin@tinytastes.co.za)
              </button>
              <button
                onClick={() => handleDevLogin('manager@tinytastes.co.za')}
                disabled={loading}
                className="w-full text-left px-3 py-2 bg-emerald-100 rounded border text-sm hover:bg-emerald-200 text-emerald-800 disabled:opacity-50"
              >
                👑 Manager User (manager@tinytastes.co.za)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
