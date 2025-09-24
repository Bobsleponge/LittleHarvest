'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Package, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface PortionSizeCreatorProps {
  onPortionSizeCreated: (portionSize: any) => void
  onCancel: () => void
}

export function PortionSizeCreator({ onPortionSizeCreated, onCancel }: PortionSizeCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    measurement: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.measurement.trim()) {
      setError('Name and measurement are required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/portion-sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        onPortionSizeCreated(data.portionSize)
        setFormData({ name: '', description: '', measurement: '' })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create portion size')
      }
    } catch (error) {
      console.error('Error creating portion size:', error)
      setError('Failed to create portion size')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="gradient-card shadow-modern border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Create Custom Portion Size
        </CardTitle>
        <CardDescription>
          Add a new portion size with custom measurements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Portion Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Small, Medium, Large"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="measurement">Measurement *</Label>
              <Input
                id="measurement"
                value={formData.measurement}
                onChange={(e) => handleInputChange('measurement', e.target.value)}
                placeholder="e.g., 100g, 250ml, 1 jar"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this portion size..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || !formData.measurement.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Portion Size
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
