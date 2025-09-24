'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react'
import { LoadingPage } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/order-utils'

interface InventoryItem {
  id: string
  productId: string
  portionSizeId: string
  currentStock: number
  weeklyLimit: number
  reservedStock: number
  lastRestocked: string
  product: {
    id: string
    name: string
    slug: string
    isActive: boolean
  }
  portionSize: {
    id: string
    name: string
    measurement: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface PortionSize {
  id: string
  name: string
  grams: number
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [portionSizes, setPortionSizes] = useState<PortionSize[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editForm, setEditForm] = useState({
    currentStock: 0,
    weeklyLimit: 0,
    reservedStock: 0
  })

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      
      const [inventoryResponse, productsResponse, portionSizesResponse] = await Promise.all([
        fetch('/api/admin/inventory'),
        fetch('/api/products'),
        fetch('/api/portion-sizes')
      ])

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        setInventory(inventoryData.inventory || [])
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products || [])
      }

      if (portionSizesResponse.ok) {
        const portionSizesData = await portionSizesResponse.json()
        setPortionSizes(portionSizesData.portionSizes || [])
      }

    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.portionSize.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLowStock = !lowStockFilter || item.currentStock <= 5
    
    return matchesSearch && matchesLowStock
  })

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setEditForm({
      currentStock: item.currentStock,
      weeklyLimit: item.weeklyLimit,
      reservedStock: item.reservedStock
    })
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventoryId: editingItem.id,
          currentStock: editForm.currentStock,
          weeklyLimit: editForm.weeklyLimit,
          reservedStock: editForm.reservedStock
        })
      })

      if (response.ok) {
        await fetchInventoryData()
        setEditingItem(null)
      } else {
        alert('Failed to update inventory')
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('Error updating inventory')
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    const availableStock = item.currentStock - item.reservedStock
    if (availableStock <= 0) return { status: 'out', color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
    if (availableStock <= 5) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' }
    if (availableStock <= item.weeklyLimit * 0.3) return { status: 'medium', color: 'bg-orange-100 text-orange-800', label: 'Medium Stock' }
    return { status: 'good', color: 'bg-green-100 text-green-800', label: 'Good Stock' }
  }

  const getStockTrend = (item: InventoryItem) => {
    const availableStock = item.currentStock - item.reservedStock
    const stockPercentage = (availableStock / item.weeklyLimit) * 100
    
    if (stockPercentage >= 80) return { trend: 'up', icon: TrendingUp, color: 'text-green-600' }
    if (stockPercentage <= 20) return { trend: 'down', icon: TrendingDown, color: 'text-red-600' }
    return { trend: 'stable', icon: BarChart3, color: 'text-blue-600' }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage product stock levels</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInventoryData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Inventory</CardTitle>
          <CardDescription>Find inventory items quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product name or portion size..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={lowStockFilter ? 'low' : 'all'} onValueChange={(value) => setLowStockFilter(value === 'low')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stock level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low">Low Stock Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inventory.filter(item => item.currentStock <= 5).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {inventory.filter(item => item.currentStock <= 0).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reserved Stock</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inventory.reduce((sum, item) => sum + item.reservedStock, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.map((item) => {
          const stockStatus = getStockStatus(item)
          const stockTrend = getStockTrend(item)
          const TrendIcon = stockTrend.icon

          return (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.product.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{item.portionSize.name} ({item.portionSize.measurement})</span>
                          <Badge variant={item.product.isActive ? 'default' : 'secondary'}>
                            {item.product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stock Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Stock</p>
                        <p className="text-lg font-semibold">{item.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Reserved</p>
                        <p className="text-lg font-semibold text-blue-600">{item.reservedStock}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Available</p>
                        <p className="text-lg font-semibold text-emerald-600">
                          {item.currentStock - item.reservedStock}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Weekly Limit</p>
                        <p className="text-lg font-semibold">{item.weeklyLimit}</p>
                      </div>
                    </div>

                    {/* Last Restocked */}
                    <div className="text-sm text-gray-500">
                      Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    {/* Stock Status */}
                    <div className="flex items-center space-x-2">
                      <TrendIcon className={`h-4 w-4 ${stockTrend.color}`} />
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || lowStockFilter ? 'No inventory items found' : 'No inventory items yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || lowStockFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'Add inventory items to start tracking stock levels.'
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setLowStockFilter(false)
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Inventory</CardTitle>
              <CardDescription>
                Update stock levels for {editingItem.product.name} - {editingItem.portionSize.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={editForm.currentStock}
                  onChange={(e) => setEditForm({ ...editForm, currentStock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="weeklyLimit">Weekly Limit</Label>
                <Input
                  id="weeklyLimit"
                  type="number"
                  value={editForm.weeklyLimit}
                  onChange={(e) => setEditForm({ ...editForm, weeklyLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="reservedStock">Reserved Stock</Label>
                <Input
                  id="reservedStock"
                  type="number"
                  value={editForm.reservedStock}
                  onChange={(e) => setEditForm({ ...editForm, reservedStock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
