import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh Baby Food
              <span className="text-emerald-600"> Delivered</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nutritious, organic baby food made with love and delivered fresh to your door. 
              Give your little one the best start in life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products" 
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors"
              >
                Shop Now
              </Link>
              <Link 
                href="/products" 
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Tiny Tastes?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality, most nutritious baby food for your little one.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Organic</h3>
              <p className="text-gray-600">
                All our ingredients are certified organic and sourced from trusted local farms.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Delivery</h3>
              <p className="text-gray-600">
                Made fresh daily and delivered to your door within 24 hours of preparation.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👶</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Age Appropriate</h3>
              <p className="text-gray-600">
                Carefully crafted recipes designed for each stage of your baby's development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust Tiny Tastes for their baby's nutrition.
          </p>
          <Link 
            href="/products" 
            className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Browse Our Products
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TT</span>
                </div>
                <span className="font-bold text-xl">Tiny Tastes</span>
              </div>
              <p className="text-gray-400">
                Fresh, organic baby food delivered to your door.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white">All Products</Link></li>
                <li><Link href="/products?age=6-8" className="hover:text-white">6-8 Months</Link></li>
                <li><Link href="/products?age=9-12" className="hover:text-white">9-12 Months</Link></li>
                <li><Link href="/products?age=12+" className="hover:text-white">12+ Months</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dev-login" className="hover:text-white">Login</Link></li>
                <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
                <li><Link href="/orders" className="hover:text-white">Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tiny Tastes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}