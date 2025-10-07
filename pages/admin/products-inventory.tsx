import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useSession } from 'next-auth/react'

// Utility function to format dates consistently (avoiding hydration mismatch)
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

interface Ingredient {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  supplier: string
  status: 'active' | 'inactive'
  lastRestocked: string
  notes?: string
}

interface RecipeIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  unitCost: number
  supplier: string
  notes?: string
}

interface ProductRecipe {
  ingredients: RecipeIngredient[]
  totalCost: number
  yield: number
  yieldUnit: string
  instructions?: string
  preparationTime?: number
  lastUpdated: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  ageGroup: string
  texture: string
  category: string
  stock: number
  minStock: number
  maxStock: number
  unitCost: number
  supplier: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  lastRestocked: string
  ingredients: string[]
  allergens: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  tags: string[]
  recipe?: ProductRecipe
}

interface ProductFormData {
  name: string
  description: string
  price: number
  ageGroup: string
  texture: string
  category: string
  stock: number
  minStock: number
  maxStock: number
  unitCost: number
  supplier: string
  ingredients: string[]
  allergens: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  tags: string[]
  images: string[]
  primaryImage: string
  recipe?: ProductRecipe
}

export default function AdminProductsInventoryPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'products' | 'inventory'>('products')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Ingredients data
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  
  const [products, setProducts] = useState<Product[]>([])

  // Fetch products and ingredients from database
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return
      
      try {
        setLoading(true)
        
        // Fetch products
        const productsResponse = await fetch('/api/admin/products')
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await productsResponse.json()
        setProducts(productsData.products || [])
        
        // Fetch ingredients
        const ingredientsResponse = await fetch('/api/admin/ingredients')
        if (!ingredientsResponse.ok) {
          const errorData = await ingredientsResponse.json()
          if (ingredientsResponse.status === 401) {
            throw new Error('Authentication required. Please log in as an admin user.')
          } else if (ingredientsResponse.status === 403) {
            throw new Error('Admin access required. Please log in with an admin account.')
          } else {
            throw new Error(errorData.error || 'Failed to fetch ingredients')
          }
        }
        const ingredientsData = await ingredientsResponse.json()
        setIngredients(ingredientsData.ingredients || [])
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchData()
    }
  }, [session?.user?.id])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showBulkRestockModal, setShowBulkRestockModal] = useState(false)
  const [showIngredientModal, setShowIngredientModal] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkRestockQuantities, setBulkRestockQuantities] = useState<{[key: string]: number}>({})
  const [bulkRestockFilter, setBulkRestockFilter] = useState('low-stock')
  
  // Recipe form state
  const { control: recipeControl, watch: watchRecipe, setValue: setRecipeValue } = useForm({
    defaultValues: {
      ingredients: [{ name: '', quantity: 0, unit: 'g', unitCost: 0, supplier: '', notes: '' }],
      yield: 1,
      yieldUnit: 'serving',
      instructions: '',
      preparationTime: 0
    }
  })
  
  const { fields: recipeFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: recipeControl,
    name: 'ingredients'
  })
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    ageGroup: '6+ months',
    texture: 'Smooth',
    category: 'Fruits',
    stock: 0,
    minStock: 10,
    maxStock: 100,
    unitCost: 0,
    supplier: '',
    ingredients: [],
    allergens: [],
    nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    tags: [],
    images: [],
    primaryImage: ''
  })

  const [ingredientFormData, setIngredientFormData] = useState({
    name: '',
    category: 'Fruits',
    unit: 'kg',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitCost: 0,
    supplier: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  })

  // Filter ingredients for inventory tab
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesFilter = filter === 'all' || 
                         ingredient.status === filter || 
                         ingredient.category === filter ||
                         (filter === 'low-stock' && ingredient.currentStock <= ingredient.minStock && ingredient.currentStock > 0) ||
                         (filter === 'out-of-stock' && ingredient.currentStock === 0)
    
    const matchesSearch = ingredient.name.toLowerCase().includes(search.toLowerCase()) ||
                         ingredient.category.toLowerCase().includes(search.toLowerCase()) ||
                         ingredient.supplier.toLowerCase().includes(search.toLowerCase()) ||
                         (ingredient.notes && ingredient.notes.toLowerCase().includes(search.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  // Filter products for products tab
  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || 
                         product.status === filter || 
                         product.category === filter
    
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase()) ||
                         product.category.toLowerCase().includes(search.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(search.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const sortedIngredients = [...filteredIngredients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'stock':
        return a.currentStock - b.currentStock
      case 'cost':
        return a.unitCost - b.unitCost
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price - b.price
      case 'stock':
        return a.stock - b.stock
      case 'profit':
        return (b.price - b.unitCost) - (a.price - a.unitCost)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getStockColor = (stock: number, minStock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock <= minStock) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return 'out-of-stock'
    if (stock <= minStock) return 'low-stock'
    return 'in-stock'
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      ...formData,
      image: '🍎', // Default image
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      lastRestocked: new Date().toISOString().split('T')[0]
    }
    setProducts([...products, newProduct])
    setShowAddModal(false)
    resetForm()
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      ageGroup: product.ageGroup,
      texture: product.texture,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unitCost: product.unitCost,
      supplier: product.supplier,
      ingredients: product.ingredients,
      allergens: product.allergens,
      nutritionInfo: product.nutritionInfo,
      tags: product.tags,
      images: product.image ? [product.image] : [],
      primaryImage: product.image || ''
    })
    setShowAddModal(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return
    
    const updatedProducts = products.map(product => 
      product.id === editingProduct.id 
        ? { ...product, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
        : product
    )
    setProducts(updatedProducts)
    setShowAddModal(false)
    setEditingProduct(null)
    resetForm()
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== productId))
    }
  }

  const handleRestock = (productId: string, amount: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            stock: product.stock + amount,
            lastRestocked: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : product
    ))
  }

  const handleIngredientRestock = async (ingredientId: string, amount: number) => {
    try {
      // Find the ingredient to get current stock
      const ingredient = ingredients.find(ing => ing.id === ingredientId)
      if (!ingredient) return
      
      const newStock = ingredient.currentStock + amount
      
      const response = await fetch('/api/admin/ingredients', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ingredientId,
          name: ingredient.name,
          category: ingredient.category,
          unit: ingredient.unit,
          currentStock: newStock,
          minStock: ingredient.minStock,
          maxStock: ingredient.maxStock,
          unitCost: ingredient.unitCost,
          supplier: ingredient.supplier,
          status: ingredient.status,
          notes: ingredient.notes
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to restock ingredient')
      }
      
      // Refresh ingredients list
      const ingredientsResponse = await fetch('/api/admin/ingredients')
      const ingredientsData = await ingredientsResponse.json()
      setIngredients(ingredientsData.ingredients || [])
    } catch (error) {
      console.error('Error restocking ingredient:', error)
      alert('Failed to restock ingredient. Please try again.')
    }
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setIngredientFormData({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock,
      minStock: ingredient.minStock,
      maxStock: ingredient.maxStock,
      unitCost: ingredient.unitCost,
      supplier: ingredient.supplier,
      status: ingredient.status,
      notes: ingredient.notes || ''
    })
    setShowIngredientModal(true)
  }

  const handleSaveIngredient = async () => {
    try {
    if (editingIngredient) {
      // Update existing ingredient
        const response = await fetch('/api/admin/ingredients', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingIngredient.id,
            ...ingredientFormData
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to update ingredient')
        }
        
        // Refresh ingredients list
        const ingredientsResponse = await fetch('/api/admin/ingredients')
        const ingredientsData = await ingredientsResponse.json()
        setIngredients(ingredientsData.ingredients || [])
    } else {
      // Add new ingredient
        const response = await fetch('/api/admin/ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ingredientFormData)
        })
        
        if (!response.ok) {
          throw new Error('Failed to create ingredient')
        }
        
        // Refresh ingredients list
        const ingredientsResponse = await fetch('/api/admin/ingredients')
        const ingredientsData = await ingredientsResponse.json()
        setIngredients(ingredientsData.ingredients || [])
      }
      
    resetIngredientForm()
    } catch (error) {
      console.error('Error saving ingredient:', error)
      alert('Failed to save ingredient. Please try again.')
    }
  }

  const resetIngredientForm = () => {
    setIngredientFormData({
      name: '',
      category: 'Fruits',
      unit: 'kg',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitCost: 0,
      supplier: '',
      status: 'active',
      notes: ''
    })
    setEditingIngredient(null)
    setShowIngredientModal(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      ageGroup: '6+ months',
      texture: 'Smooth',
      category: 'Fruits',
      stock: 0,
      minStock: 10,
      maxStock: 100,
      unitCost: 0,
      supplier: '',
      ingredients: [],
      allergens: [],
      nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      tags: [],
      images: [],
      primaryImage: ''
    })
  }

  // Bulk restock functions
  const getProductsForBulkRestock = () => {
    switch (bulkRestockFilter) {
      case 'low-stock':
        return products.filter(p => p.stock <= p.minStock && p.stock > 0)
      case 'out-of-stock':
        return products.filter(p => p.stock === 0)
      case 'all':
        return products.filter(p => p.status === 'active')
      default:
        return []
    }
  }

  const handleSelectProductForBulkRestock = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAllForBulkRestock = () => {
    const availableProducts = getProductsForBulkRestock()
    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(availableProducts.map(p => p.id))
    }
  }

  const handleBulkRestockQuantityChange = (productId: string, quantity: number) => {
    setBulkRestockQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }))
  }

  const getSuggestedRestockQuantity = (product: Product) => {
    if (product.stock === 0) {
      return Math.min(product.maxStock, 50) // Restock to 50 or max stock
    } else if (product.stock <= product.minStock) {
      return product.minStock * 2 // Restock to 2x min stock
    }
    return product.minStock
  }

  const handleBulkRestock = () => {
    const updates = selectedProducts.map(productId => {
      const product = products.find(p => p.id === productId)
      const quantity = bulkRestockQuantities[productId] || getSuggestedRestockQuantity(product!)
      return { productId, quantity }
    })

    // Update products with new stock levels
    setProducts(products.map(product => {
      const update = updates.find(u => u.productId === product.id)
      if (update) {
        return {
          ...product,
          stock: product.stock + update.quantity,
          lastRestocked: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
      }
      return product
    }))

    // Reset bulk restock state
    setShowBulkRestockModal(false)
    setSelectedProducts([])
    setBulkRestockQuantities({})
  }

  const calculateBulkRestockTotal = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = products.find(p => p.id === productId)
      const quantity = bulkRestockQuantities[productId] || getSuggestedRestockQuantity(product!)
      return total + (quantity * product!.unitCost)
    }, 0)
  }

  // Recipe calculation functions
  const calculateRecipeCost = () => {
    const ingredients = watchRecipe('ingredients')
    return ingredients.reduce((total, ingredient) => {
      return total + (ingredient.quantity * ingredient.unitCost)
    }, 0)
  }

  const calculateCostPerServing = () => {
    const totalCost = calculateRecipeCost()
    const recipeYield = watchRecipe('yield') || 1
    return recipeYield > 0 ? totalCost / recipeYield : 0
  }

  const updateProductCostFromRecipe = () => {
    const costPerServing = calculateCostPerServing()
    setFormData(prev => ({
      ...prev,
      unitCost: costPerServing
    }))
  }

  const saveRecipeToProduct = () => {
    const ingredients = watchRecipe('ingredients')
    const recipeYield = watchRecipe('yield')
    const yieldUnit = watchRecipe('yieldUnit')
    const instructions = watchRecipe('instructions')
    const preparationTime = watchRecipe('preparationTime')
    
    const recipe: ProductRecipe = {
      ingredients: ingredients.map((ingredient, index) => ({
        id: `ingredient-${index}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitCost: ingredient.unitCost,
        supplier: ingredient.supplier,
        notes: ingredient.notes
      })),
      totalCost: calculateRecipeCost(),
      yield: recipeYield,
      yieldUnit: yieldUnit,
      instructions: instructions,
      preparationTime: preparationTime,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setFormData(prev => ({
      ...prev,
      recipe: recipe,
      unitCost: calculateCostPerServing()
    }))
  }

  // Calculate stats
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'active').length
  const lowStockItems = products.filter(p => p.stock <= p.minStock && p.stock > 0).length
  const outOfStockItems = products.filter(p => p.stock === 0).length
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.unitCost), 0)
  const totalPotentialRevenue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)

  // Calculate ingredient stats
  const totalIngredients = ingredients.length
  const activeIngredients = ingredients.filter(i => i.status === 'active').length
  const lowStockIngredients = ingredients.filter(i => i.currentStock <= i.minStock && i.currentStock > 0).length
  const outOfStockIngredients = ingredients.filter(i => i.currentStock === 0).length
  const totalIngredientValue = ingredients.reduce((sum, ingredient) => sum + (ingredient.currentStock * ingredient.unitCost), 0)

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <div className="mt-3 flex space-x-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                  {error.includes('Authentication') && (
                    <Link 
                      href="/dev-login"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Login as Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Products & Inventory</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products & Inventory</h1>
            <p className="text-gray-600">Manage your product catalog and inventory levels</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Export Data
            </button>
            <button 
              onClick={() => setShowBulkRestockModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Bulk Restock
            </button>
            {activeTab === 'products' ? (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Add Product
              </button>
            ) : (
              <button 
                onClick={() => {
                  setEditingIngredient(null)
                  setShowIngredientModal(true)
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Add Ingredient
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'products'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Products ({totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'inventory'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🥕 Ingredients ({lowStockIngredients + outOfStockIngredients} alerts)
              </button>
            </nav>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Search ${activeTab === 'products' ? 'products' : 'ingredients'} by name, description, category, supplier, or tags...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Items</option>
                {activeTab === 'products' ? (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Proteins">Proteins</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Proteins">Proteins</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </>
                )}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="name">Sort by Name</option>
                <option value="stock">Sort by Stock</option>
                {activeTab === 'products' ? (
                  <>
                    <option value="price">Sort by Price</option>
                    <option value="profit">Sort by Profit</option>
                <option value="createdAt">Sort by Date</option>
                  </>
                ) : (
                  <>
                    <option value="cost">Sort by Cost</option>
                    <option value="category">Sort by Category</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {activeTab === 'products' ? 'Total Products' : 'Total Ingredients'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'products' ? totalProducts : totalIngredients}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">{activeTab === 'products' ? '📦' : '🥕'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {activeTab === 'products' ? 'Active Products' : 'Active Ingredients'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeTab === 'products' ? activeProducts : activeIngredients}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {activeTab === 'products' ? lowStockItems : lowStockIngredients}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {activeTab === 'products' ? outOfStockItems : outOfStockIngredients}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats for Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingredient Value</p>
                  <p className="text-2xl font-bold text-emerald-600">R{totalIngredientValue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Cost per Unit</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R{totalIngredients > 0 ? (totalIngredientValue / ingredients.reduce((sum, i) => sum + i.currentStock, 0)).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats for Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-emerald-600">R{totalInventoryValue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">R{totalPotentialRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products/Ingredients Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'products' ? 'Product' : 'Ingredient'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  {activeTab === 'products' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min/Max
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Status
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'products' ? (
                  sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{product.image}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.ageGroup} • {product.texture}</div>
                          <div className="text-xs text-gray-400">{product.tags.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R{product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${getStockColor(product.stock, product.minStock)}`}>
                              {product.stock}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">/ {product.minStock}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  sortedIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">
                            {ingredient.category === 'Fruits' ? '🍎' : 
                             ingredient.category === 'Vegetables' ? '🥕' : 
                             ingredient.category === 'Grains' ? '🌾' : 
                             ingredient.category === 'Proteins' ? '🍗' : '📦'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                            <div className="text-sm text-gray-500">{ingredient.unit}</div>
                            {ingredient.notes && (
                              <div className="text-xs text-gray-400">{ingredient.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ingredient.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStockColor(ingredient.currentStock, ingredient.minStock)}`}>
                          {ingredient.currentStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ingredient.minStock}/{ingredient.maxStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R{ingredient.unitCost}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ingredient.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStockStatus(ingredient.currentStock, ingredient.minStock) === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                          getStockStatus(ingredient.currentStock, ingredient.minStock) === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {getStockStatus(ingredient.currentStock, ingredient.minStock).replace('-', ' ')}
                          </span>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ingredient.lastRestocked)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditIngredient(ingredient)}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleIngredientRestock(ingredient.id, 10)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Restock
                          </button>
                          <button 
                            onClick={() => handleIngredientRestock(ingredient.id, 5)}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Quick Add
                          </button>
                        </div>
                      </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {(activeTab === 'products' ? sortedProducts.length === 0 : sortedIngredients.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">{activeTab === 'products' ? '📦' : '🥕'}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setSearch('')
                setFilter('all')
              }}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Stock Alerts */}
        {activeTab === 'inventory' && (lowStockIngredients > 0 || outOfStockIngredients > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {lowStockIngredients > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                <div className="space-y-3">
                  {ingredients
                    .filter(ingredient => ingredient.currentStock <= ingredient.minStock && ingredient.currentStock > 0)
                    .map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {ingredient.category === 'Fruits' ? '🍎' : 
                             ingredient.category === 'Vegetables' ? '🥕' : 
                             ingredient.category === 'Grains' ? '🌾' : 
                             ingredient.category === 'Proteins' ? '🍗' : '📦'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ingredient.name}</p>
                            <p className="text-sm text-gray-600">{ingredient.currentStock} {ingredient.unit} left</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleIngredientRestock(ingredient.id, 10)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {outOfStockIngredients > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Out of Stock</h3>
                <div className="space-y-3">
                  {ingredients
                    .filter(ingredient => ingredient.currentStock === 0)
                    .map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {ingredient.category === 'Fruits' ? '🍎' : 
                             ingredient.category === 'Vegetables' ? '🥕' : 
                             ingredient.category === 'Grains' ? '🌾' : 
                             ingredient.category === 'Proteins' ? '🍗' : '📦'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ingredient.name}</p>
                            <p className="text-sm text-gray-600">0 {ingredient.unit} available</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleIngredientRestock(ingredient.id, 20)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
                        >
                          Urgent Restock
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (R)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                      <select
                        value={formData.ageGroup}
                        onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="6+ months">6+ months</option>
                        <option value="8+ months">8+ months</option>
                        <option value="10+ months">10+ months</option>
                        <option value="12+ months">12+ months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texture</label>
                      <select
                        value={formData.texture}
                        onChange={(e) => setFormData({...formData, texture: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="Smooth">Smooth</option>
                        <option value="Lumpy">Lumpy</option>
                        <option value="Chunky">Chunky</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="Fruits">Fruits</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Grains">Grains</option>
                        <option value="Proteins">Proteins</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock</label>
                      <input
                        type="number"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({...formData, maxStock: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (R)</label>
                      <input
                        type="number"
                        value={formData.unitCost}
                        onChange={(e) => setFormData({...formData, unitCost: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter supplier name"
                      />
                    </div>
                  </div>

                  {/* Recipe Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-xl mr-2">👨‍🍳</span>
                      Product Recipe & Cost Calculator
                    </h4>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Yield</label>
                          <Controller
                            name="yield"
                            control={recipeControl}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="1"
                              />
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Yield Unit</label>
                          <Controller
                            name="yieldUnit"
                            control={recipeControl}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="serving">Serving</option>
                                <option value="batch">Batch</option>
                                <option value="portion">Portion</option>
                                <option value="container">Container</option>
                              </select>
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                          <Controller
                            name="preparationTime"
                            control={recipeControl}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="0"
                              />
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Cost Summary */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Total Recipe Cost</p>
                            <p className="text-lg font-bold text-gray-900">R{calculateRecipeCost().toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Cost per {watchRecipe('yieldUnit') || 'serving'}</p>
                            <p className="text-lg font-bold text-emerald-600">R{calculateCostPerServing().toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Unit Cost</p>
                            <p className="text-lg font-bold text-blue-600">R{formData.unitCost.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-center space-x-2">
                          <button
                            type="button"
                            onClick={updateProductCostFromRecipe}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                          >
                            Update Unit Cost
                          </button>
                          <button
                            type="button"
                            onClick={saveRecipeToProduct}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Save Recipe
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients List */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-md font-semibold text-gray-900">Recipe Ingredients</h5>
                        <button
                          type="button"
                          onClick={() => appendIngredient({ name: '', quantity: 0, unit: 'g', unitCost: 0, supplier: '', notes: '' })}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          + Add Ingredient
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {recipeFields.map((field, index) => (
                          <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ingredient Name</label>
                                <Controller
                                  name={`ingredients.${index}.name`}
                                  control={recipeControl}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      type="text"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      placeholder="e.g., Organic Apples"
                                    />
                                  )}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                <Controller
                                  name={`ingredients.${index}.quantity`}
                                  control={recipeControl}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      placeholder="100"
                                    />
                                  )}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                                <Controller
                                  name={`ingredients.${index}.unit`}
                                  control={recipeControl}
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                      <option value="g">g</option>
                                      <option value="kg">kg</option>
                                      <option value="ml">ml</option>
                                      <option value="l">l</option>
                                      <option value="cup">cup</option>
                                      <option value="tbsp">tbsp</option>
                                      <option value="tsp">tsp</option>
                                      <option value="piece">piece</option>
                                    </select>
                                  )}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Unit Cost (R)</label>
                                <Controller
                                  name={`ingredients.${index}.unitCost`}
                                  control={recipeControl}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      placeholder="0.50"
                                    />
                                  )}
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(index)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                                <Controller
                                  name={`ingredients.${index}.supplier`}
                                  control={recipeControl}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      type="text"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      placeholder="Supplier name"
                                    />
                                  )}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                <Controller
                                  name={`ingredients.${index}.notes`}
                                  control={recipeControl}
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      type="text"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      placeholder="Optional notes"
                                    />
                                  )}
                                />
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <span className="text-sm text-gray-600">
                                Total: R{((watchRecipe(`ingredients.${index}.quantity`) || 0) * (watchRecipe(`ingredients.${index}.unitCost`) || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recipe Instructions */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Instructions</label>
                      <Controller
                        name="instructions"
                        control={recipeControl}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter step-by-step preparation instructions..."
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-xl mr-2">🖼️</span>
                      Product Images
                    </h4>
                    
                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                      <div className="text-4xl mb-4">📤</div>
                      <h5 className="text-lg font-medium text-gray-900 mb-2">Upload Product Images</h5>
                      <p className="text-gray-600 mb-4">Drag and drop images here or click to browse</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          const newImages = files.map(file => URL.createObjectURL(file))
                          setFormData({
                            ...formData,
                            images: [...formData.images, ...newImages],
                            primaryImage: formData.primaryImage || newImages[0] || ''
                          })
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors cursor-pointer inline-block"
                      >
                        Choose Images
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: JPG, PNG, GIF (Max 10MB per file)
                      </p>
                    </div>

                    {/* Image Gallery */}
                    {formData.images.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h6 className="text-sm font-medium text-gray-700">Uploaded Images ({formData.images.length})</h6>
                          <button
                            onClick={() => setFormData({...formData, images: [], primaryImage: ''})}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Clear All
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                formData.primaryImage === image ? 'border-emerald-500' : 'border-gray-200'
                              }`}>
                                <img
                                  src={image}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Image Actions */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                  <button
                                    onClick={() => setFormData({...formData, primaryImage: image})}
                                    className={`px-3 py-1 rounded text-xs font-medium ${
                                      formData.primaryImage === image
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {formData.primaryImage === image ? 'Primary' : 'Set Primary'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newImages = formData.images.filter((_, i) => i !== index)
                                      setFormData({
                                        ...formData,
                                        images: newImages,
                                        primaryImage: formData.primaryImage === image ? (newImages[0] || '') : formData.primaryImage
                                      })
                                    }}
                                    className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              
                              {/* Primary Badge */}
                              {formData.primaryImage === image && (
                                <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Primary
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {formData.primaryImage && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <p className="text-sm text-emerald-800">
                              <span className="font-medium">Primary Image:</span> This image will be displayed as the main product image.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Restock Modal */}
        {showBulkRestockModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Bulk Restock</h3>
                  <button
                    onClick={() => {
                      setShowBulkRestockModal(false)
                      setSelectedProducts([])
                      setBulkRestockQuantities({})
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filter Selection */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Products to Restock</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setBulkRestockFilter('low-stock')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        bulkRestockFilter === 'low-stock'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Low Stock ({products.filter(p => p.stock <= p.minStock && p.stock > 0).length})
                    </button>
                    <button
                      onClick={() => setBulkRestockFilter('out-of-stock')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        bulkRestockFilter === 'out-of-stock'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Out of Stock ({products.filter(p => p.stock === 0).length})
                    </button>
                    <button
                      onClick={() => setBulkRestockFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        bulkRestockFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      All Active ({products.filter(p => p.status === 'active').length})
                    </button>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Products ({getProductsForBulkRestock().length})
                    </h4>
                    <button
                      onClick={handleSelectAllForBulkRestock}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedProducts.length === getProductsForBulkRestock().length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {getProductsForBulkRestock().map((product) => (
                      <div key={product.id} className={`p-4 border-b border-gray-200 last:border-b-0 ${
                        selectedProducts.includes(product.id) ? 'bg-blue-50' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProductForBulkRestock(product.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="text-2xl">{product.image}</div>
                            <div>
                              <h5 className="font-medium text-gray-900">{product.name}</h5>
                              <p className="text-sm text-gray-600">
                                Current: {product.stock} | Min: {product.minStock} | Max: {product.maxStock}
                              </p>
                              <p className="text-xs text-gray-500">Supplier: {product.supplier}</p>
                            </div>
                          </div>
                          
                          {selectedProducts.includes(product.id) && (
                            <div className="flex items-center space-x-3">
                              <label className="text-sm font-medium text-gray-700">Restock Qty:</label>
                              <input
                                type="number"
                                min="1"
                                max={product.maxStock - product.stock}
                                value={bulkRestockQuantities[product.id] || getSuggestedRestockQuantity(product)}
                                onChange={(e) => handleBulkRestockQuantityChange(product.id, Number(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-xs text-gray-500">
                                Cost: R{(bulkRestockQuantities[product.id] || getSuggestedRestockQuantity(product)) * product.unitCost}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedProducts.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Restock Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">Products Selected</p>
                        <p className="text-xl font-bold text-blue-900">{selectedProducts.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Total Units</p>
                        <p className="text-xl font-bold text-blue-900">
                          {selectedProducts.reduce((total, productId) => {
                            const product = products.find(p => p.id === productId)
                            const quantity = bulkRestockQuantities[productId] || getSuggestedRestockQuantity(product!)
                            return total + quantity
                          }, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Total Cost</p>
                        <p className="text-xl font-bold text-blue-900">R{calculateBulkRestockTotal().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBulkRestockModal(false)
                      setSelectedProducts([])
                      setBulkRestockQuantities({})
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkRestock}
                    disabled={selectedProducts.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Restock {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Add/Edit Ingredient Modal */}
        {showIngredientModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
                </h3>
                <button
                  onClick={resetIngredientForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
                    <input
                      type="text"
                      value={ingredientFormData.name}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Organic Bananas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={ingredientFormData.category}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Grains">Grains</option>
                      <option value="Proteins">Proteins</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Spices">Spices</option>
                    </select>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ingredientFormData.currentStock}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, currentStock: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ingredientFormData.minStock}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, minStock: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ingredientFormData.maxStock}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, maxStock: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Cost and Unit Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={ingredientFormData.unit}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="cup">cup</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (R)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ingredientFormData.unitCost}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, unitCost: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={ingredientFormData.status}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, status: e.target.value as 'active' | 'inactive'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Supplier and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={ingredientFormData.supplier}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={ingredientFormData.notes}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Optional notes"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={resetIngredientForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIngredient}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
