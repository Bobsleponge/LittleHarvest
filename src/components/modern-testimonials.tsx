'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Mother of 2",
    content: "Little Harvest has been a lifesaver! My little one absolutely loves the sweet potato puree, and I love knowing he's getting the best nutrition.",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Father of 1",
    content: "The quality is outstanding and the convenience is unmatched. Fresh delivery right to our door makes busy parenting so much easier.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emma Rodriguez",
    role: "Mother of 3",
    content: "As a pediatric nurse, I'm very particular about what my children eat. Little Harvest meets all my standards and more!",
    rating: 5,
    avatar: "ER",
  },
]

export function ModernTestimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent">
            What Parents Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real parents are saying about Little Harvest.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-emerald-200">
                  <Quote className="h-8 w-8" />
                </div>
                
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

