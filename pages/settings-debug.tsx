'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

function SettingsDebugPageContent() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testSettingsAPI = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('Testing settings API...')
      
      // Test the debug endpoint
      const response = await fetch('/api/admin/settings/debug')
      const data = await response.json()
      
      console.log('API Response:', data)
      
      setDebugInfo({
        status: response.status,
        data,
        session: session ? {
          id: session.user?.id,
          email: session.user?.email,
          role: session.user?.role
        } : null
      })
      
      if (!response.ok) {
        setError(`API Error: ${response.status} - ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Test error:', err)
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testRegularAPI = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('Testing regular settings API...')
      
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      console.log('Regular API Response:', data)
      
      setDebugInfo({
        status: response.status,
        data,
        session: session ? {
          id: session.user?.id,
          email: session.user?.email,
          role: session.user?.role
        } : null
      })
      
      if (!response.ok) {
        setError(`API Error: ${response.status} - ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Test error:', err)
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings API Debug</h1>
          
          {/* Session Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Session Status</h2>
            {session ? (
              <div className="text-sm">
                <p><strong>User ID:</strong> {session.user?.id}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
                <p><strong>Status:</strong> <span className="text-green-600">Authenticated</span></p>
              </div>
            ) : (
              <div className="text-sm">
                <p><strong>Status:</strong> <span className="text-red-600">Not authenticated</span></p>
                <p className="mt-2">
                  <Link href="/dev-login" className="text-emerald-600 hover:text-emerald-700">
                    Go to Dev Login →
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={testSettingsAPI}
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Debug API'}
            </button>
            
            <button
              onClick={testRegularAPI}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Regular API'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">API Response:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Quick Links */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Quick Links:</h3>
            <div className="flex space-x-4">
              <Link href="/dev-login" className="text-emerald-600 hover:text-emerald-700">
                Dev Login
              </Link>
              <Link href="/admin/settings" className="text-emerald-600 hover:text-emerald-700">
                Settings Page
              </Link>
              <Link href="/admin" className="text-emerald-600 hover:text-emerald-700">
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsDebugPage() {
  return (
    <SessionProvider>
      <SettingsDebugPageContent />
    </SessionProvider>
  )
}

export default dynamic(() => Promise.resolve(SettingsDebugPage), {
  ssr: false
})
