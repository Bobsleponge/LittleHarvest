import Link from 'next/link'

export function Footer() {
  return (
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
  )
}