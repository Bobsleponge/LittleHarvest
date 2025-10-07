import Link from 'next/link'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Navigation from '../src/components/navigation'
import Footer from '../src/components/footer'
import { useBrandSettings, useColorSettings } from '../src/lib/ui-settings-context'

export default function HomePage() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const brandSettings = useBrandSettings()
  const colorSettings = useColorSettings()

  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role || 'CUSTOMER'

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom right, 
          color-mix(in srgb, ${colorSettings.primary} 5%, white), 
          white, 
          color-mix(in srgb, ${colorSettings.accent} 5%, white)
        )`
      }}
    >
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Smart Baby Food
            <span 
              className="block"
              style={{ color: colorSettings.primary }}
            >
              Delivery Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Personalized baby food delivery with child profiles, allergen tracking, and smart shopping. 
            Order for individual children or the whole family with safety-first meal planning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              style={{ 
                backgroundColor: colorSettings.primary,
                '--hover-color': colorSettings.secondary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colorSettings.secondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colorSettings.primary
              }}
            >
              Browse Products
            </Link>
            {isLoggedIn ? (
              <Link
                href="/child-profiles"
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                style={{ 
                  backgroundColor: colorSettings.accent,
                  '--hover-color': colorSettings.secondary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorSettings.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorSettings.accent
                }}
              >
                Manage Profiles
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                style={{ 
                  backgroundColor: colorSettings.accent,
                  '--hover-color': colorSettings.secondary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorSettings.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorSettings.accent
                }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Smart Features for Modern Parents
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `color-mix(in srgb, ${colorSettings.primary} 10%, white)` }}
              >
                <span className="text-2xl">👶</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Child Profiles</h3>
              <p className="text-gray-600 text-sm">
                Create profiles for each child with allergies, dietary needs, and food preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `color-mix(in srgb, ${colorSettings.primary} 10%, white)` }}
              >
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Allergen Safety</h3>
              <p className="text-gray-600 text-sm">
                Automatic warnings when products contain ingredients your child is allergic to.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `color-mix(in srgb, ${colorSettings.primary} 10%, white)` }}
              >
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Shopping</h3>
              <p className="text-gray-600 text-sm">
                Shop for individual children or the whole family with personalized recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `color-mix(in srgb, ${colorSettings.primary} 10%, white)` }}
              >
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Ordering</h3>
              <p className="text-gray-600 text-sm">
                Simple cart system with floating cart icon and seamless checkout process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-12 h-12 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: colorSettings.primary }}
              >
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Create Child Profiles</h3>
              <p className="text-gray-600">
                Add your children's information including allergies, dietary requirements, and food preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-12 h-12 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: colorSettings.primary }}
              >
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Browse & Select</h3>
              <p className="text-gray-600">
                Choose products with automatic safety checks based on your child's profile.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-12 h-12 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                style={{ backgroundColor: colorSettings.primary }}
              >
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Order & Enjoy</h3>
              <p className="text-gray-600">
                Add to cart, checkout, and receive safe, personalized meals for your little ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 px-4"
        style={{
          background: `linear-gradient(to right, ${colorSettings.primary}, ${colorSettings.accent})`
        }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Smart Baby Food Journey
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join parents who prioritize safety and convenience with personalized meal planning.
          </p>
          
          {isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/child-profiles"
                className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                style={{ color: colorSettings.primary }}
              >
                Set Up Child Profiles
              </Link>
              <Link
                href="/products"
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                style={{ 
                  backgroundColor: colorSettings.secondary,
                  '--hover-color': colorSettings.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorSettings.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorSettings.secondary
                }}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              style={{ color: colorSettings.primary }}
            >
              Get Started Free
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}