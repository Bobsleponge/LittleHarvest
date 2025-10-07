import Link from 'next/link'
import { useBrandSettings } from '../lib/ui-settings-context'

export function Header() {
  const brandSettings = useBrandSettings()

  return (
    <header className="bg-white shadow-sm border-b" style={{ height: 'var(--header-height, 64px)' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {brandSettings.logoUrl ? (
              <img 
                src={brandSettings.logoUrl} 
                alt={brandSettings.siteName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {brandSettings.siteName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-bold text-2xl text-gray-800">{brandSettings.siteName}</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-800 font-semibold">
              Products
            </Link>
            <Link href="/order" className="text-gray-600 hover:text-gray-800 font-semibold">
              Order Now
            </Link>
            <Link href="/track-order" className="text-gray-600 hover:text-gray-800 font-semibold">
              Track Order
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-gray-800 font-semibold">
              Cart
            </Link>
            <Link href="/dev-login" className="text-gray-600 hover:text-gray-800 font-semibold">
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header