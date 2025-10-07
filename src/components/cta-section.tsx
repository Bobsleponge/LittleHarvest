import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-16 bg-emerald-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
        <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
          Join thousands of families who trust Little Harvest for their baby's nutrition.
        </p>
        <Link 
          href="/products" 
          className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
        >
          Browse Our Products
        </Link>
      </div>
    </section>
  )
}
