'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  Package, 
  DollarSign, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Share
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'
import { Product } from '@/lib/types'
import Image from 'next/image'

export default function AdminProductViewPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else if (response.status === 404) {
        setError('Product not found')
      } else {
        setError('Failed to fetch product')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('An error occurred while fetching the product')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!product) return
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) return

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleDuplicateProduct = async () => {
    if (!product) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          name: `${product.name} (Copy)`,
          slug: `${product.slug}-copy-${Date.now()}`
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/products/${data.product.id}`)
      } else {
        alert('Failed to duplicate product')
      }
    } catch (error) {
      console.error('Error duplicating product:', error)
      alert('Failed to duplicate product')
    }
  }

  const handleToggleStatus = async () => {
    if (!product) return

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive })
      })

      if (response.ok) {
        setProduct({ ...product, isActive: !product.isActive })
      } else {
        alert('Failed to update product status')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product status')
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        <Card className="gradient-card shadow-modern">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/products">Back to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        <Card className="gradient-card shadow-modern">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-gray-500 mb-4">The requested product could not be found.</p>
            <Button asChild>
              <Link href="/admin/products">Back to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Product Details & Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicateProduct}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Basic information about this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Product Name</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Slug</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{product.slug}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-700">{product.description || 'No description provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergens */}
          {(product.contains || product.mayContain) && (
            <Card className="gradient-card shadow-modern">
              <CardHeader>
                <CardTitle>Allergen Information</CardTitle>
                <CardDescription>Important allergen details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.contains && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contains</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.contains.split(',').map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergen.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.mayContain && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">May Contain</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.mayContain.split(',').map((allergen, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {allergen.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleToggleStatus}
              >
                {product.isActive ? 'Deactivate' : 'Activate'} Product
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteProduct}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Product
              </Button>
            </CardContent>
          </Card>

          {/* Product Classification */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Age Group</span>
                <Badge variant="outline">{product.ageGroup?.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Texture</span>
                <Badge variant="outline">{product.texture?.name}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Pricing Options</CardTitle>
              <CardDescription>{product.prices?.length || 0} price options available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.prices?.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{price.portionSize?.name}</div>
                    <div className="text-sm text-gray-500">
                      {price.portionSize?.measurement}
                      {price.portionSize?.description && ` • ${price.portionSize.description}`}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    R{Number(price.amountZar).toFixed(2)}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No pricing options available</p>
                  <p className="text-sm">Add pricing options in the edit page</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
