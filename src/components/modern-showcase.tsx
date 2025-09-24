'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Star, Clock, Users } from 'lucide-react'

const products = [
  {
    name: "Sweet Potato & Carrot Puree",
    description: "Rich in beta-carotene and natural sweetness, perfect for introducing vegetables.",
    image: "/images/products/sweet-potato-carrot.jpg",
    age: "6+ months",
    rating: 4.9,
    reviews: 1247,
  },
  {
    name: "Apple & Pear Medley",
    description: "A delightful combination of sweet fruits, gentle on sensitive tummies.",
    image: "/images/products/apple-pear.jpg",
    age: "4+ months",
    rating: 4.8,
    reviews: 892,
  },
  {
    name: "Beef & Butternut Lentil",
    description: "Protein-rich meal with iron and zinc for healthy growth and development.",
    image: "/images/products/beef-butternut.jpg",
    age: "8+ months",
    rating: 4.9,
    reviews: 1156,
  },
]

export function ModernShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent">
            Popular Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our most loved baby food products, carefully crafted for different stages of your baby's development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{product.age}</span>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{product.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{product.reviews} reviews</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group">
                    View Product
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

