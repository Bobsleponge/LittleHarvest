'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Package, 
  AlertCircle,
  CheckCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'
import { Product } from '@/lib/types'
import { FileUpload } from '@/components/file-upload'
import { PriceManager } from '@/components/admin/price-manager'

export default function AdminProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ageGroups, setAgeGroups] = useState<any[]>([])
  const [textures, setTextures] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    ageGroupId: '',
    textureId: '',
    imageUrl: '',
    contains: '',
    mayContain: '',
    isActive: true
  })

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
      fetchFilterOptions()
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        setProduct(product)
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          ageGroupId: product.ageGroupId || '',
          textureId: product.textureId || '',
          imageUrl: product.imageUrl || '',
          contains: product.contains || '',
          mayContain: product.mayContain || '',
          isActive: product.isActive ?? true
        })
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

  const fetchFilterOptions = async () => {
    try {
      const [ageResponse, textureResponse] = await Promise.all([
        fetch('/api/age-groups'),
        fetch('/api/textures')
      ])
      
      if (ageResponse.ok) {
        const ageData = await ageResponse.json()
        setAgeGroups(ageData.ageGroups || [])
      }
      
      if (textureResponse.ok) {
        const textureData = await textureResponse.json()
        setTextures(textureData.textures || [])
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push(`/admin/products/${params.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setError('An error occurred while updating the product')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/products/${params.id}`)
  }

  if (loading) {
    return <LoadingPage />
  }

  if (error && !product) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/products/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="gradient-card shadow-modern border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="product-url-slug"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Classification</CardTitle>
              <CardDescription>Product categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group *</Label>
                  <Select value={formData.ageGroupId} onValueChange={(value) => handleInputChange('ageGroupId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map((ageGroup) => (
                        <SelectItem key={ageGroup.id} value={ageGroup.id}>
                          {ageGroup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="texture">Texture *</Label>
                  <Select value={formData.textureId} onValueChange={(value) => handleInputChange('textureId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select texture" />
                    </SelectTrigger>
                    <SelectContent>
                      {textures.map((texture) => (
                        <SelectItem key={texture.id} value={texture.id}>
                          {texture.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allergen Information */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Allergen Information</CardTitle>
              <CardDescription>Important allergen details for parents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contains">Contains (comma-separated)</Label>
                <Input
                  id="contains"
                  value={formData.contains}
                  onChange={(e) => handleInputChange('contains', e.target.value)}
                  placeholder="milk, eggs, nuts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mayContain">May Contain (comma-separated)</Label>
                <Input
                  id="mayContain"
                  value={formData.mayContain}
                  onChange={(e) => handleInputChange('mayContain', e.target.value)}
                  placeholder="soy, wheat"
                />
              </div>
            </CardContent>
          </Card>

          {/* Price & Portion Management */}
          {product && (
            <PriceManager 
              productId={product.id} 
              initialPrices={product.prices || []} 
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>Upload a product image</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={(url) => handleInputChange('imageUrl', url)}
                currentImageUrl={formData.imageUrl}
              />
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
              <CardDescription>Control product visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-gray-500">Product is visible to customers</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="gradient-card shadow-modern">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Changes
              </Button>
              <Button 
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
