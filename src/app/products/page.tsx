import { Suspense } from 'react'
import { ProductGrid } from '@/components/product-grid'
import { ProductFilters } from '@/components/product-filters'
import { ProductSorting } from '@/components/product-sorting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Filter, SortAsc } from 'lucide-react'

interface ProductsPageProps {
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

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const activeFiltersCount = Object.values(searchParams).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Our Products
              </h1>
              <p className="text-muted-foreground">
                Discover our range of nutritious baby food products
              </p>
            </div>
          </div>
          
          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Suspense fallback={<ProductFiltersSkeleton />}>
                <ProductFilters />
              </Suspense>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Sorting and Results Header */}
            <div className="mb-6">
              <Suspense fallback={<ProductSortingSkeleton />}>
                <ProductSorting searchParams={searchParams} />
              </Suspense>
            </div>

            {/* Products Grid */}
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductFiltersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-18" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-22" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProductSortingSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
