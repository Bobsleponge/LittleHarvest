'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { User, Shield, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

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

  const handleQuickLogin = async (email: string) => {
    try {
      setLoading(email)
      setError(null)
      
      const result = await signIn('dev-login', { 
        email, 
        callbackUrl: '/',
        redirect: false 
      })
      
      console.log('Login result:', result)
      
      if (result?.error) {
        setError('Login failed. Please try again.')
        console.error('Login error:', result.error)
      } else if (result?.ok) {
        // Check if this is an admin user and redirect accordingly
        const isAdmin = adminAccounts.some(account => account.email === email)
        console.log('Is admin:', isAdmin, 'Email:', email)
        if (isAdmin) {
          console.log('Redirecting to admin dashboard')
          window.location.href = '/admin'
        } else {
          console.log('Redirecting to home page')
          window.location.href = '/'
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Development Environment
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent">
            Quick Login
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose an account to quickly log in for testing purposes. Perfect for development and demo scenarios.
          </p>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              {error}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Accounts */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Admin Accounts</CardTitle>
                <CardDescription className="text-gray-600">
                  Access admin dashboard and management features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="w-full bg-red-600 hover:bg-red-700 text-white group justify-start disabled:opacity-50"
                    >
                      {loading === account.email ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <User className="mr-3 h-5 w-5" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold">{account.name}</div>
                        <div className="text-sm opacity-90">{account.email}</div>
                      </div>
                      {loading !== account.email && (
                        <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Customer Accounts</CardTitle>
                <CardDescription className="text-gray-600">
                  Browse products and place orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group justify-start disabled:opacity-50"
                    >
                      {loading === account.email ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <User className="mr-3 h-5 w-5" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold">{account.name}</div>
                        <div className="text-sm opacity-90">{account.email}</div>
                      </div>
                      {loading !== account.email && (
                        <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
          className="text-center mt-12"
        >
          <Button variant="outline" className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50" asChild>
            <Link href="/">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}