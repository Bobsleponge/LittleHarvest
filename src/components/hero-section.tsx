import Link from 'next/link'

export function HeroSection() {
  return (
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
  )
}
