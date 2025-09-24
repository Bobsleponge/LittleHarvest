import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Leaf, Heart, Shield, Truck } from 'lucide-react'
import { Product, ProductDetailsProps } from '@/lib/types'

export function ProductDetails({ product }: ProductDetailsProps) {
  const features = [
    {
      icon: Leaf,
      title: '100% Organic',
      description: 'Made with certified organic ingredients sourced from trusted local farms.',
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Prepared by nutrition experts who understand the importance of quality baby food.',
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Rigorously tested for safety and nutritional content by certified laboratories.',
    },
    {
      icon: Truck,
      title: 'Fresh Delivery',
      description: 'Delivered fresh to your door within 24 hours of preparation.',
    },
  ]

  return (
    <div className="space-y-8 mb-12">
      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Why Choose This Product?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Nutritional Information */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Nutritional Information</CardTitle>
            <CardDescription>
              Perfect for {product.ageGroup.name} ({product.ageGroup.minMonths}-{product.ageGroup.maxMonths} months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Texture</h4>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {product.texture.name}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Age Recommendation</h4>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {product.ageGroup.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Storage Instructions */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Storage & Preparation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Storage</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Refrigerate immediately upon delivery</li>
                  <li>• Use within 3 days of delivery</li>
                  <li>• Freeze for up to 3 months</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Preparation</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Thaw in refrigerator overnight</li>
                  <li>• Warm gently before serving</li>
                  <li>• Test temperature before feeding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
