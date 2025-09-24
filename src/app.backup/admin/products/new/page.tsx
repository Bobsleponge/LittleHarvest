'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/file-upload'
import { PriceManager } from '@/components/admin/price-manager'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface AgeGroup {
  id: string
  name: string
}

interface Texture {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productCreated, setProductCreated] = useState(false)
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [ageGroupId, setAgeGroupId] = useState('')
  const [textureId, setTextureId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [contains, setContains] = useState('')
  const [mayContain, setMayContain] = useState('')
  const [isActive, setIsActive] = useState(true)
  
  // Data for dropdowns
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([])
  const [textures, setTextures] = useState<Texture[]>([])

  // Load age groups and textures
  useEffect(() => {
    const loadData = async () => {
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
        console.error('Failed to load data:', error)
        setError('Failed to load age groups and textures. Please refresh the page.')
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = {
        name,
        slug,
        description,
        ageGroupId,
        textureId,
        imageUrl: imageUrl || null,
        contains,
        mayContain,
        isActive,
      }
      
      console.log('Submitting product data:', formData)
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Product creation failed:', errorData)
        throw new Error(errorData.error || 'Failed to create product')
      }

      const data = await response.json()
      setCreatedProductId(data.product.id)
      setProductCreated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          {productCreated ? 'Product created! Now add prices and portion sizes.' : 'Create a new baby food product'}
        </p>
      </div>

      {!productCreated ? (
        <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Basic details about the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Beef & Butternut Lentil Puree"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="e.g., beef-butternut-lentil-puree"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageGroup">Age Group</Label>
                    <Select value={ageGroupId} onValueChange={setAgeGroupId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="texture">Texture</Label>
                    <Select value={textureId} onValueChange={setTextureId} required>
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

                <div>
                  <Label htmlFor="isActive">Product Status</Label>
                  <Select value={isActive.toString()} onValueChange={(value) => setIsActive(value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allergen Information</CardTitle>
                <CardDescription>List allergens and potential allergens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contains">Contains (comma-separated)</Label>
                  <Input
                    id="contains"
                    value={contains}
                    onChange={(e) => setContains(e.target.value)}
                    placeholder="e.g., beef, lentils"
                  />
                </div>

                <div>
                  <Label htmlFor="mayContain">May Contain (comma-separated)</Label>
                  <Input
                    id="mayContain"
                    value={mayContain}
                    onChange={(e) => setMayContain(e.target.value)}
                    placeholder="e.g., gluten, dairy"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Image */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Upload an image for the product</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={setImageUrl}
                  currentImageUrl={imageUrl}
                  disabled={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {createdProductId && (
            <PriceManager 
              productId={createdProductId} 
              initialPrices={[]} 
            />
          )}
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/products">Back to Products</Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/products/${createdProductId}/edit`}>
                Edit Product Details
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
