'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SortAsc, SortDesc, Grid, List } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface ProductSortingProps {
  searchParams: {
    age?: string
    texture?: string
    search?: string
    page?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }
}

export function ProductSorting({ searchParams }: ProductSortingProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [totalProducts, setTotalProducts] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const params = new URLSearchParams()
        
        if (searchParams.age) params.append('age', searchParams.age)
        if (searchParams.texture) params.append('texture', searchParams.texture)
        if (searchParams.search) params.append('search', searchParams.search)
        if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice)
        if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice)

        const response = await fetch(`/api/products?${params.toString()}&countOnly=true`)
        
        if (response.ok) {
          const data = await response.json()
          setTotalProducts(data.total || 0)
        }
      } catch (error) {
        console.error('Failed to fetch product count:', error)
      }
    }

    fetchProductCount()
  }, [searchParams])

  const updateSorting = (sortValue: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    
    if (sortValue && sortValue !== 'default') {
      params.set('sort', sortValue)
    } else {
      params.delete('sort')
    }

    router.push(`/products?${params.toString()}`)
  }

  const getSortLabel = (sortValue: string) => {
    switch (sortValue) {
      case 'name-asc': return 'Name A-Z'
      case 'name-desc': return 'Name Z-A'
      case 'price-asc': return 'Price Low to High'
      case 'price-desc': return 'Price High to Low'
      case 'newest': return 'Newest First'
      case 'oldest': return 'Oldest First'
      default: return 'Default'
    }
  }

  const currentSort = searchParams.sort || 'default'

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Results Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalProducts > 0 ? `${totalProducts} product${totalProducts > 1 ? 's' : ''} found` : 'No products found'}
        </span>
        {(searchParams.age || searchParams.texture || searchParams.search || searchParams.minPrice || searchParams.maxPrice) && (
          <Badge variant="secondary" className="text-xs">
            Filtered
          </Badge>
        )}
      </div>

      {/* Sorting and View Controls */}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={currentSort} onValueChange={updateSorting}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="name-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3 w-3" />
                  Name A-Z
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Name Z-A
                </div>
              </SelectItem>
              <SelectItem value="price-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3 w-3" />
                  Price Low to High
                </div>
              </SelectItem>
              <SelectItem value="price-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Price High to Low
                </div>
              </SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
