export function FeaturesSection() {
  const features = [
    {
      icon: '🌱',
      title: '100% Organic',
      description: 'All our ingredients are certified organic and sourced from trusted local farms.'
    },
    {
      icon: '🚚',
      title: 'Fresh Delivery',
      description: 'Made fresh daily and delivered to your door within 24 hours of preparation.'
    },
    {
      icon: '👶',
      title: 'Age Appropriate',
      description: 'Carefully crafted recipes designed for each stage of your baby\'s development.'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Little Harvest?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the highest quality, most nutritious baby food for your little one.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
