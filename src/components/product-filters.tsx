'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Search, X, DollarSign } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface AgeGroup {
  id: string
  name: string
  minMonths: number
  maxMonths: number
}

interface Texture {
  id: string
  name: string
}

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([])
  const [textures, setTextures] = useState<Texture[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [priceRange, setPriceRange] = useState([0, 100])
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  useEffect(() => {
    const fetchFilters = async () => {
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
        console.error('Failed to fetch filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilters()
  }, [])

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', searchTerm || null)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    updateFilters('minPrice', values[0] > 0 ? values[0].toString() : null)
    updateFilters('maxPrice', values[1] < 100 ? values[1].toString() : null)
  }

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value)
    if (type === 'min') {
      setMinPrice(value)
      if (!isNaN(numValue)) {
        updateFilters('minPrice', numValue > 0 ? numValue.toString() : null)
      }
    } else {
      setMaxPrice(value)
      if (!isNaN(numValue)) {
        updateFilters('maxPrice', numValue < 100 ? numValue.toString() : null)
      }
    }
  }

  const selectedAge = searchParams.get('age')
  const selectedTexture = searchParams.get('texture')
  const selectedMinPrice = searchParams.get('minPrice')
  const selectedMaxPrice = searchParams.get('maxPrice')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
            <div className="h-4 bg-muted rounded w-18 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm" className="w-full">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Age Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Age Group</CardTitle>
          <CardDescription>Filter by recommended age</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ageGroups.map((ageGroup) => (
            <div key={ageGroup.id} className="flex items-center space-x-2">
              <Checkbox
                id={`age-${ageGroup.id}`}
                checked={selectedAge === ageGroup.id}
                onCheckedChange={(checked) => {
                  updateFilters('age', checked ? ageGroup.id : null)
                }}
              />
              <Label
                htmlFor={`age-${ageGroup.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {ageGroup.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Textures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Texture</CardTitle>
          <CardDescription>Filter by food texture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {textures.map((texture) => (
            <div key={texture.id} className="flex items-center space-x-2">
              <Checkbox
                id={`texture-${texture.id}`}
                checked={selectedTexture === texture.id}
                onCheckedChange={(checked) => {
                  updateFilters('texture', checked ? texture.id : null)
                }}
              />
              <Label
                htmlFor={`texture-${texture.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {texture.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </CardTitle>
          <CardDescription>Filter by price range (R)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>R{priceRange[0]}</span>
              <span>R{priceRange[1]}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => handlePriceInputChange('min', e.target.value)}
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="100"
                value={maxPrice}
                onChange={(e) => handlePriceInputChange('max', e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(selectedAge || selectedTexture || searchTerm || selectedMinPrice || selectedMaxPrice) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedAge && (
                <Badge variant="secondary">
                  Age: {ageGroups.find(a => a.id === selectedAge)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => updateFilters('age', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedTexture && (
                <Badge variant="secondary">
                  Texture: {textures.find(t => t.id === selectedTexture)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => updateFilters('texture', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {(selectedMinPrice || selectedMaxPrice) && (
                <Badge variant="secondary">
                  Price: R{selectedMinPrice || '0'} - R{selectedMaxPrice || '100+'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => {
                      updateFilters('minPrice', null)
                      updateFilters('maxPrice', null)
                      setMinPrice('')
                      setMaxPrice('')
                      setPriceRange([0, 100])
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => {
                      setSearchTerm('')
                      updateFilters('search', null)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
