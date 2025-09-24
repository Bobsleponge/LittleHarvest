import Link from 'next/link'

export function Footer() {
  return (
    <footer className="glass border-t border-white/20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-modern pulse-glow">
                <span className="text-white font-bold text-sm">TT</span>
              </div>
              <span className="font-bold text-white text-lg">Tiny Tastes</span>
            </div>
            <p className="text-sm text-readable-white">
              Fresh, nutritious baby food made with love and delivered to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-readable-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-readable-white">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-readable-white hover:text-white transition-colors duration-300 hover:scale-105 transform">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-readable-white">Contact Us</h3>
            <div className="space-y-2 text-sm text-readable-white">
              <p>📧 hello@tinytastes.co.za</p>
              <p>📞 +27 (0) 11 123 4567</p>
              <p>📍 Johannesburg, South Africa</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-readable-white">
          <p>&copy; 2024 Tiny Tastes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
