export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">TT</span>
            </div>
            <span className="font-bold text-2xl text-gray-800">
              Tiny Tastes
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/products" className="text-gray-600 hover:text-gray-800 font-semibold">
              Products
            </a>
            <a href="/cart" className="text-gray-600 hover:text-gray-800 font-semibold">
              Cart
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <a href="/cart" className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded hover:bg-gray-100">
              Cart
            </a>
            <a href="/dev-login" className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded hover:bg-gray-100">
              Login
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}