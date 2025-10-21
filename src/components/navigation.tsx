import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useBrandSettings, useColorSettings } from '../lib/ui-settings-context'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { data: session } = useSession()
  const brandSettings = useBrandSettings()
  const colorSettings = useColorSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header 
      className="shadow-lg min-h-[80px]"
      style={{ 
        background: `linear-gradient(to right, ${colorSettings.primary}, ${colorSettings.secondary})`
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between min-h-[48px]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            {brandSettings.logoUrl ? (
              <img 
                src={brandSettings.logoUrl} 
                alt={brandSettings.siteName}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 flex-shrink-0">
                <span className="text-white font-bold text-lg">🍼</span>
              </div>
            )}
            <div className="min-w-0 flex-shrink">
              <span className="font-bold text-xl text-white truncate block max-w-[200px] lg:max-w-[300px]">
                {brandSettings.siteName}
              </span>
              <p className="text-white/80 text-xs truncate max-w-[200px] lg:max-w-[300px]">
                {brandSettings.tagline || 'Fresh Baby Food'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            <Link
              href="/products"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm text-sm ${
                currentPage === 'products'
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:text-white hover:bg-white/20'
              }`}
            >
              🛍️ Products
            </Link>
            <Link
              href="/cart"
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                currentPage === 'cart'
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/20'
              }`}
            >
              🛒 Cart
            </Link>
            {session && (
              <Link
                href="/child-profiles"
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  currentPage === 'child-profiles'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                👶 Profiles
              </Link>
            )}
            {session && (session.user as any)?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  currentPage === 'admin'
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                👑 Admin
              </Link>
            )}
          </nav>

          {/* User Section & Mobile Menu Button */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {session ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-white font-medium text-sm truncate max-w-[120px]">
                    {session.user?.name}
                  </p>
                  <p className="text-white/80 text-xs">Customer</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">👤</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-2 py-1 rounded-md bg-white/20 text-white text-xs hover:bg-white/30 transition-all duration-200 flex-shrink-0"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/dev-login" 
                className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm flex-shrink-0"
              >
                Login
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md bg-white/20 text-white hover:bg-white/30 transition-all duration-200 flex-shrink-0"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 'products'
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                🛍️ Products
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 'cart'
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:text-white hover:bg-white/20'
                }`}
              >
                🛒 Cart
              </Link>
              {session && (
                <Link
                  href="/child-profiles"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 'child-profiles'
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/20'
                  }`}
                >
                  👶 Profiles
                </Link>
              )}
              {session && (session.user as any)?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 'admin'
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/20'
                  }`}
                >
                  👑 Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}