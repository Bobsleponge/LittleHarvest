import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Palette, 
  Download, 
  Upload, 
  Eye, 
  Save, 
  Trash2, 
  Plus,
  Copy,
  Star,
  Heart,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Contrast,
  Volume2,
  VolumeX,
  BarChart3,
  Users,
  Clock,
  Share2
} from 'lucide-react'

interface ThemePreset {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
    success: string
    warning: string
    error: string
    info: string
  }
  category: 'business' | 'creative' | 'minimal' | 'bold' | 'nature'
  popularity: number
  createdAt: string
}

interface ThemeManagerProps {
  onThemeChange: (theme: ThemePreset) => void
  onThemeCreate: (theme: ThemePreset) => void
  onThemeDelete: (themeId: string) => void
  onThemeExport: () => void
  onThemeImport: (file: File) => void
  currentTheme?: ThemePreset
}

export function ThemeManager({
  onThemeChange,
  onThemeCreate,
  onThemeDelete,
  onThemeExport,
  onThemeImport,
  currentTheme
}: ThemeManagerProps) {
  const [presets, setPresets] = useState<ThemePreset[]>([
    {
      id: 'default',
      name: 'Default Theme',
      description: 'Clean and professional default theme',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#ffffff',
        text: '#111827',
        muted: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      category: 'business',
      popularity: 95,
      createdAt: '2024-01-01'
    },
    {
      id: 'nature',
      name: 'Nature Theme',
      description: 'Earth tones inspired by natural ingredients',
      colors: {
        primary: '#16a34a',
        secondary: '#15803d',
        accent: '#22c55e',
        background: '#f0fdf4',
        text: '#14532d',
        muted: '#65a30d',
        success: '#16a34a',
        warning: '#eab308',
        error: '#dc2626',
        info: '#2563eb'
      },
      category: 'nature',
      popularity: 88,
      createdAt: '2024-01-02'
    },
    {
      id: 'sunset',
      name: 'Sunset Theme',
      description: 'Warm sunset colors for a cozy feel',
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        background: '#fff7ed',
        text: '#9a3412',
        muted: '#c2410c',
        success: '#16a34a',
        warning: '#eab308',
        error: '#dc2626',
        info: '#2563eb'
      },
      category: 'creative',
      popularity: 76,
      createdAt: '2024-01-03'
    },
    {
      id: 'minimal',
      name: 'Minimal Theme',
      description: 'Clean and minimal design with subtle colors',
      colors: {
        primary: '#6b7280',
        secondary: '#4b5563',
        accent: '#9ca3af',
        background: '#ffffff',
        text: '#111827',
        muted: '#d1d5db',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      category: 'minimal',
      popularity: 82,
      createdAt: '2024-01-04'
    },
    {
      id: 'bold',
      name: 'Bold Theme',
      description: 'Vibrant colors for a bold and energetic feel',
      colors: {
        primary: '#7c3aed',
        secondary: '#6d28d9',
        accent: '#a855f7',
        background: '#faf5ff',
        text: '#581c87',
        muted: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      category: 'bold',
      popularity: 71,
      createdAt: '2024-01-05'
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'date'>('popularity')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTheme, setNewTheme] = useState<Partial<ThemePreset>>({
    name: '',
    description: '',
    category: 'business',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      text: '#111827',
      muted: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  })

  const categories = [
    { id: 'all', name: 'All Themes', icon: Palette },
    { id: 'business', name: 'Business', icon: Monitor },
    { id: 'creative', name: 'Creative', icon: Heart },
    { id: 'minimal', name: 'Minimal', icon: Contrast },
    { id: 'nature', name: 'Nature', icon: Sun },
    { id: 'bold', name: 'Bold', icon: Zap }
  ]

  const filteredPresets = presets
    .filter(preset => selectedCategory === 'all' || preset.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const handleCreateTheme = () => {
    if (!newTheme.name || !newTheme.description) return

    const theme: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: newTheme.name,
      description: newTheme.description,
      colors: newTheme.colors!,
      category: newTheme.category as any,
      popularity: 0,
      createdAt: new Date().toISOString()
    }

    setPresets([...presets, theme])
    onThemeCreate(theme)
    setShowCreateForm(false)
    setNewTheme({
      name: '',
      description: '',
      category: 'business',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#ffffff',
        text: '#111827',
        muted: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    })
  }

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string)
        onThemeImport(file)
      } catch (error) {
        console.error('Error importing theme:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Theme Manager Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Theme Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and customize your application themes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onThemeExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTheme}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Theme</span>
          </Button>
        </div>
      </div>

      {/* Theme Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="category">Category:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <category.icon className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="sort">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPresets.length} theme{filteredPresets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <Card key={preset.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{preset.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {preset.popularity}
                  </span>
                </div>
              </div>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Color Preview */}
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(preset.colors).slice(0, 5).map(([key, color]) => (
                  <div
                    key={key}
                    className="h-8 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: color }}
                    title={`${key}: ${color}`}
                  />
                ))}
              </div>
              
              {/* Theme Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onThemeChange(preset)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </Button>
                  
                  {preset.id.startsWith('custom-') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onThemeDelete(preset.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {preset.category}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Theme Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New Theme</CardTitle>
              <CardDescription>
                Design a custom theme for your application
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="themeName">Theme Name</Label>
                  <Input
                    id="themeName"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    placeholder="My Custom Theme"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="themeCategory">Category</Label>
                  <Select
                    value={newTheme.category}
                    onValueChange={(value: any) => setNewTheme({ ...newTheme, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="themeDescription">Description</Label>
                <Input
                  id="themeDescription"
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  placeholder="Describe your theme..."
                />
              </div>
              
              <div className="space-y-4">
                <Label>Color Palette</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(newTheme.colors || {}).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="capitalize text-sm">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id={key}
                          value={value}
                          onChange={(e) => setNewTheme({
                            ...newTheme,
                            colors: { ...newTheme.colors!, [key]: e.target.value }
                          })}
                          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <Input
                          value={value}
                          onChange={(e) => setNewTheme({
                            ...newTheme,
                            colors: { ...newTheme.colors!, [key]: e.target.value }
                          })}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTheme}
                  disabled={!newTheme.name || !newTheme.description}
                >
                  Create Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ThemeManager
