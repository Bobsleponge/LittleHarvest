'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { signIn, useSession, getSession, signOut } from 'next-auth/react'
import { User, Shield, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

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
  const { data: session, status } = useSession()
  const router = useRouter()

  // Memoize admin account emails for faster lookup
  const adminEmails = useMemo(() => 
    new Set(adminAccounts.map(account => account.email)), 
    []
  )

  // Memoize redirect logic
  const redirectUser = useCallback((email: string) => {
    const isAdmin = adminEmails.has(email)
    const targetPath = isAdmin ? '/admin' : '/products'
    console.log('Redirecting user:', { email, isAdmin, targetPath })
    router.replace(targetPath)
  }, [adminEmails, router])

  // Redirect if already logged in
  useEffect(() => {
    console.log('Dev login page - Session status:', status)
    console.log('Dev login page - Session data:', session)
    
    if (status === 'authenticated' && session?.user?.email) {
      console.log('User is authenticated, checking role...')
      console.log('User email:', session.user.email)
      console.log('User role:', (session.user as any).role)
      redirectUser(session.user.email)
    }
  }, [session, status, redirectUser])

  const handleQuickLogin = useCallback(async (email: string) => {
    try {
      setLoading(email)
      setError(null)
      
      // First, create or get the user via the dev-login API
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
      
      const { success } = await response.json()
      
      if (success) {
        console.log('✅ Dev-login API successful, now signing in with NextAuth...')
        
        // Now sign in with the dev-login provider
        const result = await signIn('dev-login', { 
          email, 
          callbackUrl: '/',
          redirect: false 
        })
        
        console.log('🔐 NextAuth signIn result:', result)
        
        if (result?.error) {
          setError(`Authentication failed: ${result.error}`)
          console.error('SignIn error:', result.error)
        } else if (result?.ok) {
          console.log('✅ NextAuth signIn successful, refreshing session...')
          
          // Refresh the session to get updated user data
          const updatedSession = await getSession()
          console.log('🔄 Updated session:', updatedSession)
          
          // Small delay to ensure session is updated
          setTimeout(() => {
            console.log('🚀 Redirecting user...')
            redirectUser(email)
          }, 100)
        } else {
          console.log('❌ Unexpected signIn result:', result)
          setError('Unexpected authentication result. Please try again.')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }, [redirectUser])

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, redirect immediately
  if (status === 'authenticated' && session?.user?.email) {
    redirectUser(session.user.email)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Redirecting...</p>
          <p className="text-sm text-gray-500 mt-2">Logged in as: {session.user.name}</p>
          <Button 
            onClick={() => signOut({ callbackUrl: '/dev-login' })}
            variant="outline"
            className="mt-4"
          >
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl float" style={{ animationDelay: '2s' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 glass text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-modern"
          >
            <Sparkles className="h-5 w-5" />
            Development Environment
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-gradient drop-shadow-lg">
            Quick Login
          </h1>
          <p className="text-2xl text-white/90 max-w-3xl mx-auto font-light drop-shadow-md">
            Choose an account to quickly log in for testing purposes. Perfect for development and demo scenarios.
          </p>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 glass border border-red-300/50 rounded-xl text-red-100 shadow-modern-lg"
            >
              {error}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Admin Accounts */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full glass border-0 shadow-modern-xl card-hover">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                  <Shield className="h-10 w-10 text-red-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">Admin Accounts</CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  Access admin dashboard and management features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {adminAccounts.map((account, index) => (
                  <motion.div
                    key={account.email}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleQuickLogin(account.email)}
                      disabled={loading !== null}
                      className="w-full h-16 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white group justify-start disabled:opacity-50 btn-modern shadow-modern-lg text-lg font-semibold"
                    >
                      {loading === account.email ? (
                        <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                      ) : (
                        <User className="mr-4 h-6 w-6" />
                      )}
                      <div className="text-left">
                        <div className="font-bold">{account.name}</div>
                        <div className="text-sm opacity-90">{account.email}</div>
                      </div>
                      {loading !== account.email && (
                        <ArrowRight className="ml-auto h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Accounts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full glass border-0 shadow-modern-xl card-hover">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                  <User className="h-10 w-10 text-emerald-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">Customer Accounts</CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  Browse products and place orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {customerAccounts.map((account, index) => (
                  <motion.div
                    key={account.email}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleQuickLogin(account.email)}
                      disabled={loading !== null}
                      className="w-full h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white group justify-start disabled:opacity-50 btn-modern shadow-modern-lg text-lg font-semibold"
                    >
                      {loading === account.email ? (
                        <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                      ) : (
                        <User className="mr-4 h-6 w-6" />
                      )}
                      <div className="text-left">
                        <div className="font-bold">{account.name}</div>
                        <div className="text-sm opacity-90">{account.email}</div>
                      </div>
                      {loading !== account.email && (
                        <ArrowRight className="ml-auto h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button className="glass border border-white/20 text-white hover:bg-white/10 btn-modern shadow-modern-lg px-8 py-4 text-lg font-semibold" asChild>
            <Link href="/">
              <ArrowRight className="mr-3 h-5 w-5 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}