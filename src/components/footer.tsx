import Link from 'next/link'
import { useBrandSettings, useSocialSettings, useContactSettings } from '../lib/ui-settings-context'
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

function Footer() {
  const brandSettings = useBrandSettings()
  const socialSettings = useSocialSettings()
  const contactSettings = useContactSettings()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {brandSettings.logoUrl ? (
                <img 
                  src={brandSettings.logoUrl} 
                  alt={brandSettings.siteName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {brandSettings.siteName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-bold text-xl">{brandSettings.siteName}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {brandSettings.tagline || 'Fresh, organic baby food delivered to your door.'}
            </p>
            
            {/* Social Media Links */}
            {(socialSettings.facebook || socialSettings.instagram || socialSettings.twitter || socialSettings.linkedin) && (
              <div className="flex space-x-4">
                {socialSettings.facebook && (
                  <a href={socialSettings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialSettings.instagram && (
                  <a href={socialSettings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialSettings.twitter && (
                  <a href={socialSettings.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialSettings.linkedin && (
                  <a href={socialSettings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
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
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              {contactSettings.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contactSettings.email}`} className="hover:text-white">
                    {contactSettings.email}
                  </a>
                </li>
              )}
              {contactSettings.phone && (
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${contactSettings.phone}`} className="hover:text-white">
                    {contactSettings.phone}
                  </a>
                </li>
              )}
              {contactSettings.address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="hover:text-white">
                    {contactSettings.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 {brandSettings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer