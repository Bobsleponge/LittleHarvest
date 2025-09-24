'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Download,
  Upload,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Copy,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Users,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'
import { Product } from '@/lib/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'price' | 'ageGroup'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all')
  const [textureFilter, setTextureFilter] = useState<string>('all')
  const [ageGroups, setAgeGroups] = useState<any[]>([])
  const [textures, setTextures] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalPriceOptions: 0,
    averagePrice: 0,
    topSellingAgeGroup: '',
    mostPopularTexture: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchFilterOptions()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        calculateStats(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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

  const calculateStats = (products: Product[]) => {
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.isActive).length
    const inactiveProducts = totalProducts - activeProducts
    const totalPriceOptions = products.reduce((sum, p) => sum + (p.prices?.length || 0), 0)
    
    // Calculate average price
    const allPrices = products.flatMap(p => p.prices?.map(price => Number(price.amountZar)) || [])
    const averagePrice = allPrices.length > 0 ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length : 0
    
    // Find most popular age group and texture
    const ageGroupCounts = products.reduce((acc, p) => {
      const ageGroup = p.ageGroup?.name || 'Unknown'
      acc[ageGroup] = (acc[ageGroup] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const textureCounts = products.reduce((acc, p) => {
      const texture = p.texture?.name || 'Unknown'
      acc[texture] = (acc[texture] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topSellingAgeGroup = Object.entries(ageGroupCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
    const mostPopularTexture = Object.entries(textureCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
    
    setStats({
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalPriceOptions,
      averagePrice,
      topSellingAgeGroup,
      mostPopularTexture
    })
  }

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && product.isActive) ||
                           (filterStatus === 'inactive' && !product.isActive)
      
      const matchesAgeGroup = ageGroupFilter === 'all' || product.ageGroup?.id === ageGroupFilter
      const matchesTexture = textureFilter === 'all' || product.texture?.id === textureFilter
      
      return matchesSearch && matchesStatus && matchesAgeGroup && matchesTexture
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'price':
          const aMinPrice = Math.min(...(a.prices?.map(p => Number(p.amountZar)) || [0]))
          const bMinPrice = Math.min(...(b.prices?.map(p => Number(p.amountZar)) || [0]))
          comparison = aMinPrice - bMinPrice
          break
        case 'ageGroup':
          comparison = (a.ageGroup?.name || '').localeCompare(b.ageGroup?.name || '')
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    const productName = product?.name || 'this product'
    
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        setSelectedProducts(selectedProducts.filter(id => id !== productId))
        // Show success message (you could add a toast notification here)
        console.log(`Product "${productName}" deleted successfully`)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete product: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return

    try {
      const promises = selectedProducts.map(id => 
        fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      setProducts(products.filter(p => !selectedProducts.includes(p.id)))
      setSelectedProducts([])
    } catch (error) {
      console.error('Error deleting products:', error)
      alert('Failed to delete some products')
    }
  }

  const handleBulkToggleStatus = async () => {
    if (selectedProducts.length === 0) return
    
    try {
      const promises = selectedProducts.map(id => {
        const product = products.find(p => p.id === id)
        return fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !product?.isActive })
        })
      })
      
      await Promise.all(promises)
      setProducts(products.map(p => 
        selectedProducts.includes(p.id) ? { ...p, isActive: !p.isActive } : p
      ))
      setSelectedProducts([])
    } catch (error) {
      console.error('Error updating products:', error)
      alert('Failed to update some products')
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredAndSortedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredAndSortedProducts.map(p => p.id))
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleDuplicateProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId)
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
        fetchProducts() // Refresh the list
        console.log(`Product "${product.name}" duplicated successfully as "${data.product.name}"`)
      } else {
        const errorData = await response.json()
        alert(`Failed to duplicate product: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error duplicating product:', error)
      alert('Failed to duplicate product. Please try again.')
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500">All products</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
                <p className="text-xs text-gray-500">{Math.round((stats.activeProducts / stats.totalProducts) * 100)}% of total</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-2xl font-bold">R{stats.averagePrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Across all products</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Age Group</p>
                <p className="text-lg font-bold">{stats.topSellingAgeGroup}</p>
                <p className="text-xs text-gray-500">Most popular</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters and Controls */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Advanced Filters & Controls</CardTitle>
              <CardDescription>Filter, sort, and manage your products</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Basic Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({products.length})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active ({products.filter(p => p.isActive).length})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({products.filter(p => !p.isActive).length})
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2">
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  {ageGroups.map((ageGroup) => (
                    <SelectItem key={ageGroup.id} value={ageGroup.id}>
                      {ageGroup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={textureFilter} onValueChange={setTextureFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by texture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Textures</SelectItem>
                  {textures.map((texture) => (
                    <SelectItem key={texture.id} value={texture.id}>
                      {texture.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="ageGroup">Age Group</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkToggleStatus}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Toggle Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 border-red-300 hover:bg-red-100"
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <Card key={product.id} className="gradient-card shadow-modern card-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {product.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Image */}
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Age Group:</span>
                    <span className="font-medium">{product.ageGroup?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Texture:</span>
                    <span className="font-medium">{product.texture?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Prices:</span>
                    <span className="font-medium">{product.prices?.length || 0} options</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Min Price:</span>
                    <span className="font-medium text-green-600">
                      R{Math.min(...(product.prices?.map(p => Number(p.amountZar)) || [0])).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200" 
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200" 
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateProduct(product.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    title="Duplicate Product"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* List Header */}
          <Card className="gradient-card shadow-modern">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Age Group</div>
                  <div className="col-span-2">Texture</div>
                  <div className="col-span-1">Prices</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List Items */}
          {filteredAndSortedProducts.map((product) => (
            <Card key={product.id} className="gradient-card shadow-modern card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {product.description || 'No description'}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm">{product.ageGroup?.name}</div>
                    <div className="col-span-2 text-sm">{product.texture?.name}</div>
                    <div className="col-span-1 text-sm">{product.prices?.length || 0}</div>
                    <div className="col-span-1">
                      <Badge variant={product.isActive ? 'default' : 'secondary'} className="text-xs">
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200"
                        asChild
                        title="View Product"
                      >
                        <Link href={`/admin/products/${product.id}`}>
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
                        asChild
                        title="Edit Product"
                      >
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateProduct(product.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        title="Duplicate Product"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Delete Product"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedProducts.length === 0 && (
        <Card className="gradient-card shadow-modern">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterStatus !== 'all' || ageGroupFilter !== 'all' || textureFilter !== 'all' 
                ? 'No products found' 
                : 'No products yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || ageGroupFilter !== 'all' || textureFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start building your product catalog by adding your first product.'
              }
            </p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {filteredAndSortedProducts.length > 0 && (
        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">
                  Showing {filteredAndSortedProducts.length} of {products.length} products
                </span>
                {(searchTerm || filterStatus !== 'all' || ageGroupFilter !== 'all' || textureFilter !== 'all') && (
                  <Badge variant="secondary" className="text-xs">
                    Filtered
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sorted by {sortBy}</span>
                <span className="text-gray-300">•</span>
                <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
