import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">TT</span>
            </div>
            <span className="font-bold text-2xl text-gray-800">Tiny Tastes</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-gray-800 font-semibold">
              Products
            </Link>
            <Link href="/order" className="text-gray-600 hover:text-gray-800 font-semibold">
              Order Now
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