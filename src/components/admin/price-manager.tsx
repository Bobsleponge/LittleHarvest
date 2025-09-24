'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  DollarSign,
  Package,
  AlertCircle,
  Settings
} from 'lucide-react'
import { PortionSizeCreator } from './portion-size-creator'

interface PortionSize {
  id: string
  name: string
  description?: string
  measurement?: string
}

interface Price {
  id: string
  amountZar: number
  portionSize: PortionSize
}

interface PriceManagerProps {
  productId: string
  initialPrices?: Price[]
}

export function PriceManager({ productId, initialPrices = [] }: PriceManagerProps) {
  const [prices, setPrices] = useState<Price[]>(initialPrices)
  const [portionSizes, setPortionSizes] = useState<PortionSize[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [newPrice, setNewPrice] = useState({
    portionSizeId: '',
    amountZar: ''
  })
  const [showPortionSizeCreator, setShowPortionSizeCreator] = useState(false)

  useEffect(() => {
    fetchPortionSizes()
  }, [])

  const fetchPortionSizes = async () => {
    try {
      const response = await fetch('/api/admin/portion-sizes')
      if (response.ok) {
        const data = await response.json()
        setPortionSizes(data.portionSizes || [])
      }
    } catch (error) {
      console.error('Error fetching portion sizes:', error)
    }
  }

  const handlePortionSizeCreated = (newPortionSize: PortionSize) => {
    setPortionSizes([...portionSizes, newPortionSize])
    setNewPrice({ ...newPrice, portionSizeId: newPortionSize.id })
    setShowPortionSizeCreator(false)
  }

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${productId}/prices`)
      if (response.ok) {
        const data = await response.json()
        setPrices(data.prices || [])
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrice = async () => {
    if (!newPrice.portionSizeId || !newPrice.amountZar) {
      setError('Please fill in all fields')
      return
    }

    const amount = parseFloat(newPrice.amountZar)
    if (isNaN(amount) || amount < 0) {
      setError('Please enter a valid price')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/admin/products/${productId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portionSizeId: newPrice.portionSizeId,
          amountZar: amount
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPrices([...prices, data.price])
        setNewPrice({ portionSizeId: '', amountZar: '' })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add price')
      }
    } catch (error) {
      console.error('Error adding price:', error)
      setError('Failed to add price')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrice = async (priceId: string, portionSizeId: string, amountZar: number) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/admin/products/${productId}/prices/${priceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portionSizeId,
          amountZar
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPrices(prices.map(p => p.id === priceId ? data.price : p))
        setEditingPrice(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update price')
      }
    } catch (error) {
      console.error('Error updating price:', error)
      setError('Failed to update price')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price option?')) return

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/admin/products/${productId}/prices/${priceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPrices(prices.filter(p => p.id !== priceId))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete price')
      }
    } catch (error) {
      console.error('Error deleting price:', error)
      setError('Failed to delete price')
    } finally {
      setLoading(false)
    }
  }

  const getAvailablePortionSizes = () => {
    const usedPortionSizeIds = prices.map(p => p.portionSize.id)
    return portionSizes.filter(ps => !usedPortionSizeIds.includes(ps.id))
  }

  const getPortionSizeById = (id: string) => {
    return portionSizes.find(ps => ps.id === id)
  }

  return (
    <Card className="gradient-card shadow-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Price & Portion Management
        </CardTitle>
        <CardDescription>
          Manage pricing options and portion sizes for this product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Add New Price */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Add New Price Option</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPortionSizeCreator(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Create Custom Portion
            </Button>
          </div>
          
          {showPortionSizeCreator && (
            <PortionSizeCreator
              onPortionSizeCreated={handlePortionSizeCreated}
              onCancel={() => setShowPortionSizeCreator(false)}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portionSize">Portion Size</Label>
              <Select value={newPrice.portionSizeId} onValueChange={(value) => setNewPrice({ ...newPrice, portionSizeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select portion size" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePortionSizes().map((portionSize) => (
                    <SelectItem key={portionSize.id} value={portionSize.id}>
                      <div>
                        <div className="font-medium">{portionSize.name}</div>
                        <div className="text-sm text-gray-500">
                          {portionSize.measurement}
                          {portionSize.description && ` • ${portionSize.description}`}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Price (R)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={newPrice.amountZar}
                onChange={(e) => setNewPrice({ ...newPrice, amountZar: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleAddPrice} 
                disabled={loading || !newPrice.portionSizeId || !newPrice.amountZar}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Price
              </Button>
            </div>
          </div>
        </div>

        {/* Current Prices */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Current Price Options</h4>
          {prices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No price options configured yet</p>
              <p className="text-sm">Add your first price option above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prices.map((price) => (
                <div key={price.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  {editingPrice === price.id ? (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <Select 
                          value={price.portionSize.id} 
                          onValueChange={(value) => {
                            const updatedPrice = { ...price, portionSize: getPortionSizeById(value)! }
                            setPrices(prices.map(p => p.id === price.id ? updatedPrice : p))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {portionSizes.map((portionSize) => (
                              <SelectItem key={portionSize.id} value={portionSize.id}>
                                {portionSize.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">R</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={price.amountZar}
                          onChange={(e) => {
                            const updatedPrice = { ...price, amountZar: parseFloat(e.target.value) || 0 }
                            setPrices(prices.map(p => p.id === price.id ? updatedPrice : p))
                          }}
                          className="w-24"
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleUpdatePrice(price.id, price.portionSize.id, price.amountZar)}
                          disabled={loading}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPrice(null)
                            fetchPrices() // Reset to original values
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{price.portionSize.name}</div>
                          <div className="text-sm text-gray-500">
                            {price.portionSize.measurement}
                            {price.portionSize.description && ` • ${price.portionSize.description}`}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          R{price.amountZar.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPrice(price.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePrice(price.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {prices.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total price options: {prices.length}</span>
              <span>
                Price range: R{Math.min(...prices.map(p => p.amountZar)).toFixed(2)} - R{Math.max(...prices.map(p => p.amountZar)).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
