'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Leaf, Truck, Shield, Sparkles, Zap, Award } from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every meal is crafted with care and attention to detail, ensuring your little one gets the best nutrition.",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    icon: Leaf,
    title: "100% Organic",
    description: "All ingredients are certified organic, free from harmful pesticides and chemicals.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Truck,
    title: "Fresh Delivery",
    description: "Delivered fresh to your door within 24 hours of preparation, maintaining optimal nutrition.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Rigorous quality control and safety standards ensure every product meets the highest standards.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Zap,
    title: "Quick & Easy",
    description: "Convenient packaging and easy-to-serve portions make mealtime stress-free for busy parents.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    icon: Award,
    title: "Expert Approved",
    description: "Developed with pediatric nutritionists and approved by child development experts.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
]

export function ModernFeatures() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Why Choose Tiny Tastes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent">
            Everything Your Baby Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine nutrition science with culinary expertise to create meals that are both delicious and beneficial for your baby's development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

