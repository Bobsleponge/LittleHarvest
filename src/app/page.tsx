import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, User, ArrowRight, LogIn, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gradient mb-6">
            Tiny Tastes
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            Fresh Baby Food Made with Love 🍼
          </p>
          
          {/* Main Login Section */}
          <Card className="max-w-2xl mx-auto shadow-lg border-0">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
                Welcome to Tiny Tastes!
              </h2>
              <p className="text-lg text-gray-600 mb-8 text-center">
                Choose your access level to get started
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Admin Access */}
                <Button 
                  size="lg" 
                  className="h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white" 
                  asChild
                >
                  <Link href="/dev-login">
                    <Shield className="mr-3 h-6 w-6" />
                    Admin Portal
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                
                {/* Customer Access */}
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-16 text-lg font-semibold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
                  asChild
                >
                  <Link href="/dev-login">
                    <User className="mr-3 h-6 w-6" />
                    Customer Portal
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Quick access for testing and development
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/products" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Browse Products
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link href="/cart" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Shopping Cart
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link href="/profile" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    User Profile
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}