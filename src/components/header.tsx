'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, LogIn } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Tiny Tastes
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
              Products
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 font-medium">
              Cart
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>

            {/* User menu */}
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5 mr-2" />
                    {session.user?.name || 'Profile'}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {process.env.NODE_ENV === 'development' ? (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dev-login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                      <Link href="/dev-login">
                        Get Started
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/signin">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}