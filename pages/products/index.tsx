import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCart } from '../../src/lib/cart-context'
import Navigation from '../../src/components/navigation'
import Footer from '../../src/components/footer'
import { findAllergenConflicts, getAllergenSeverityColor, getAllergenSeverityIcon, generateAllergenWarning } from '../../src/lib/allergen-matching'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  imageUrl?: string
  ageGroup: string
  texture: string
  ingredients: string[]
  stock: number
  category: string
}

interface CartItem {
  productId: string
  quantity: number
  notes?: string
  childProfileId?: string
}

interface ChildProfile {
  id: string
  name: string
  dateOfBirth: string
  allergies: string[]
  dietaryRequirements: string[]
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const { addToCartSuccess } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [selectedChildProfile, setSelectedChildProfile] = useState<ChildProfile | null>(null)
  const [shoppingMode, setShoppingMode] = useState<'family' | 'child'>('family')
  const [loading, setLoading] = useState(true)
  const [showCartModal, setShowCartModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartItem, setCartItem] = useState<CartItem>({
    productId: '',
    quantity: 1,
    notes: '',
    childProfileId: ''
  })
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [filters, setFilters] = useState({
    age: '',
    texture: '',
    search: '',
    category: ''
  })

  // Debug session status

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Organic Apple Puree',
      description: 'Fresh, organic apples blended to perfection for your little one',
      price: 45,
      image: '🍎',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&crop=center',
      ageGroup: '6-8 months',
      texture: 'Smooth',
      ingredients: ['Organic Apples', 'Vitamin C'],
      stock: 25,
      category: 'Fruits'
    },
    {
      id: '2',
      name: 'Sweet Potato Mash',
      description: 'Nutritious sweet potato with natural sweetness',
      price: 42,
      image: '🍠',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&crop=center',
      ageGroup: '6-8 months',
      texture: 'Smooth',
      ingredients: ['Organic Sweet Potato', 'Beta Carotene'],
      stock: 18,
      category: 'Vegetables'
    },
    {
      id: '3',
      name: 'Banana & Oatmeal',
      description: 'Creamy banana with wholesome oatmeal',
      price: 48,
      image: '🍌',
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop&crop=center',
      ageGroup: '9-12 months',
      texture: 'Lumpy',
      ingredients: ['Organic Banana', 'Organic Oats', 'Iron'],
      stock: 32,
      category: 'Grains'
    },
    {
      id: '4',
      name: 'Carrot & Pea Mix',
      description: 'Colorful blend of carrots and peas',
      price: 44,
      image: '🥕',
      imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop&crop=center',
      ageGroup: '9-12 months',
      texture: 'Lumpy',
      ingredients: ['Organic Carrots', 'Organic Peas', 'Vitamin A'],
      stock: 21,
      category: 'Vegetables'
    },
    {
      id: '5',
      name: 'Chicken & Rice',
      description: 'Protein-rich chicken with soft rice',
      price: 52,
      image: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&crop=center',
      ageGroup: '12+ months',
      texture: 'Chunky',
      ingredients: ['Organic Chicken', 'Brown Rice', 'Protein'],
      stock: 15,
      category: 'Proteins'
    },
    {
      id: '6',
      name: 'Mixed Berry Blend',
      description: 'Antioxidant-rich berry combination',
      price: 46,
      image: '🫐',
      imageUrl: 'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?w=400&h=400&fit=crop&crop=center',
      ageGroup: '12+ months',
      texture: 'Smooth',
      ingredients: ['Organic Blueberries', 'Organic Strawberries', 'Antioxidants'],
      stock: 28,
      category: 'Fruits'
    }
  ]

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        credentials: 'include'
      })
      const data = await response.json()
      setProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fallback to mock products if API fails
      setProducts(mockProducts)
      setFilteredProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchChildProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/child-profiles', {
        credentials: 'include'
      })
      const data = await response.json()
      setChildProfiles(data.childProfiles || [])
    } catch (error) {
      console.error('Error fetching child profiles:', error)
    }
  }, [])

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include'
      })
      const data = await response.json()
      setCsrfToken(data.csrfToken || '')
    } catch (error) {
      console.error('Error fetching CSRF token:', error)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchChildProfiles()
      fetchCsrfToken()
    }
  }, [session, fetchChildProfiles, fetchCsrfToken])

  const handleShoppingModeChange = (mode: 'family' | 'child') => {
    setShoppingMode(mode)
    if (mode === 'family') {
      setSelectedChildProfile(null)
    } else if (mode === 'child' && childProfiles.length > 0 && !selectedChildProfile) {
      // Auto-select first child if switching to child mode
      setSelectedChildProfile(childProfiles[0])
    }
  }

  const handleChildProfileChange = (profile: ChildProfile | null) => {
    setSelectedChildProfile(profile)
    if (profile) {
      setShoppingMode('child')
    }
  }

  useEffect(() => {
    let filtered = products

    if (filters.age) {
      filtered = filtered.filter(p => p.ageGroup === filters.age)
    }
    if (filters.texture) {
      filtered = filtered.filter(p => p.texture === filters.texture)
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Apply child profile filtering
    if (selectedChildProfile) {
      filtered = filtered.filter(product => {
        // Check if product contains any of the child's allergies
        const hasAllergenConflict = selectedChildProfile.allergies.some(allergy => 
          product.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(allergy.toLowerCase())
          )
        )
        
        // For now, we'll show products with warnings rather than hiding them completely
        // This ensures safety while still allowing choice
        return true
      })
    }

    setFilteredProducts(filtered)
  }, [filters, products, selectedChildProfile])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ age: '', texture: '', search: '', category: '' })
  }

  const handleAddToCart = (product: Product) => {
    console.log('handleAddToCart called for product:', product)
    console.log('Session check - session:', session)
    console.log('Session check - status:', status)
    
    if (status === 'loading') {
      console.log('Session still loading')
      alert('Please wait while we check your login status...')
      return
    }
    
    if (!session) {
      console.log('No session - redirecting to login')
      window.location.href = '/dev-login'
      return
    }
    
    console.log('Current shoppingMode:', shoppingMode)
    console.log('Current selectedChildProfile:', selectedChildProfile)
    
    setSelectedProduct(product)
    setCartItem({
      productId: product.id,
      quantity: 1,
      notes: '',
      childProfileId: shoppingMode === 'child' && selectedChildProfile ? selectedChildProfile.id : ''
    })
    setShowCartModal(true)
  }

  const handleCartSubmit = async () => {
    console.log('handleCartSubmit called')
    console.log('selectedProduct:', selectedProduct)
    console.log('session:', session)
    console.log('cartItem:', cartItem)
    console.log('shoppingMode:', shoppingMode)
    
    if (!selectedProduct || !session) {
      console.log('Early return - missing selectedProduct or session')
      return
    }

    setIsAddingToCart(true)
    try {
      const requestBody = {
        productId: cartItem.productId,
        portionSizeId: 'default', // Using default portion size for now
        quantity: cartItem.quantity,
        notes: cartItem.notes,
        childProfileId: shoppingMode === 'child' ? (cartItem.childProfileId || '') : '',
        shoppingMode: shoppingMode || 'family'
      }
      
      console.log('Sending request to /api/cart with body:', requestBody)
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        alert('Item added to cart successfully!')
        setShowCartModal(false)
        setSelectedProduct(null)
        setCartItem({ productId: '', quantity: 1, notes: '', childProfileId: '' })
        // Trigger cart refresh for floating icon
        addToCartSuccess()
      } else {
        const error = await response.json()
        console.log('Error response:', error)
        console.log('Error details:', error.details)
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        
        if (error.code === 'USER_NOT_FOUND') {
          alert('Your session is outdated. Please log out and log in again to continue.')
          // Clear session cookies manually
          document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          // Redirect to login page
          window.location.href = '/dev-login'
        } else {
          alert(`Failed to add to cart: ${error.error}\nStatus: ${response.status}\nDetails: ${error.details ? JSON.stringify(error.details) : 'No details available'}`)
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      alert(`Failed to add item to cart. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const closeCartModal = () => {
    setShowCartModal(false)
    setSelectedProduct(null)
    setCartItem({ productId: '', quantity: 1, notes: '', childProfileId: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
          <p className="text-sm text-gray-500 mt-2">Session status: {status}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Navigation currentPage="products" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Fresh, organic baby food made with love</p>
        </div>

        {/* Smart Shopping Mode Selector */}
        {session && childProfiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">🛒 Smart Shopping Mode</h2>
              <Link 
                href="/child-profiles"
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                Manage Profiles
              </Link>
            </div>
            
          {/* Shopping Mode Toggle with Integrated Child Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Shopping for:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleShoppingModeChange('family')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    shoppingMode === 'family'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  👨‍👩‍👧‍👦 Family
                </button>
                <button
                  onClick={() => handleShoppingModeChange('child')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    shoppingMode === 'child'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  👶 Specific Child
                </button>
              </div>
            </div>

            {/* Child Profile Selection (integrated into mode selector) */}
            {shoppingMode === 'child' && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h3 className="text-sm font-semibold text-emerald-800 mb-3">Select Child:</h3>
                <div className="flex flex-wrap gap-3">
                  {childProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleChildProfileChange(profile)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedChildProfile?.id === profile.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                      }`}
                    >
                      {profile.name}
                      {profile.allergies.length > 0 && (
                        <span className="ml-2 text-xs">⚠️</span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedChildProfile && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      <strong>Selected:</strong> {selectedChildProfile.name} 
                      <span className="text-emerald-600 ml-2">
                        (Age: {Math.floor((Date.now() - new Date(selectedChildProfile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Current Mode Info */}
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
              {shoppingMode === 'family' ? (
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    👨‍👩‍👧‍👦 Shopping for the Family
                  </h3>
                  <p className="text-sm text-emerald-700">
                    All products will be added to your family cart. You can switch to individual child shopping at any time.
                  </p>
                </div>
              ) : selectedChildProfile ? (
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    👶 Shopping for {selectedChildProfile.name}
                  </h3>
                  <div className="space-y-2">
                    {selectedChildProfile.allergies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-red-700">⚠️ Allergies: </span>
                        <span className="text-sm text-red-600">
                          {selectedChildProfile.allergies.join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedChildProfile.dietaryRequirements.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">🥗 Dietary: </span>
                        <span className="text-sm text-blue-600">
                          {selectedChildProfile.dietaryRequirements.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">
                    Products will be tagged for {selectedChildProfile.name}. Switch back to family mode anytime.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    👶 Select a Child to Shop For
                  </h3>
                  <p className="text-sm text-emerald-700">
                    Choose a child above to get personalized recommendations and allergen warnings.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select
                value={filters.age}
                onChange={(e) => handleFilterChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Ages</option>
                <option value="6-8 months">6-8 months</option>
                <option value="9-12 months">9-12 months</option>
                <option value="12+ months">12+ months</option>
              </select>
            </div>

            {/* Texture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texture</label>
              <select
                value={filters.texture}
                onChange={(e) => handleFilterChange('texture', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Textures</option>
                <option value="Smooth">Smooth</option>
                <option value="Lumpy">Lumpy</option>
                <option value="Chunky">Chunky</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Grains">Grains</option>
                <option value="Proteins">Proteins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 hover:-translate-y-1">
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                      if (nextElement) {
                        nextElement.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
                  <div className="text-8xl opacity-60">{product.image}</div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
                
                {/* Stock Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 backdrop-blur-sm text-xs font-semibold rounded-full shadow-sm ${
                    product.stock < 10 
                      ? 'bg-red-500/90 text-white' 
                      : 'bg-green-500/90 text-white'
                  }`}>
                    {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Allergen Warning */}
                {shoppingMode === 'child' && selectedChildProfile && selectedChildProfile.allergies.length > 0 && (
                  (() => {
                    const allergenConflicts = selectedChildProfile.allergies.filter(allergy => 
                      product.ingredients.some(ingredient => 
                        ingredient.toLowerCase().includes(allergy.toLowerCase())
                      )
                    )
                    return allergenConflicts.length > 0 ? (
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-sm text-white">
                          ⚠️ {selectedChildProfile.name} allergic to {allergenConflicts.join(', ')}
                        </span>
                      </div>
                    ) : null
                  })()
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                {/* Product Name & Description */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Age Group:</span>
                    <span className="font-semibold text-gray-800">{product.ageGroup}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Texture:</span>
                    <span className="font-semibold text-gray-800">{product.texture}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Available:</span>
                    <span className={`font-semibold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock} jars
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-3xl font-bold text-emerald-600">R{product.price}</span>
                    <span className="text-sm text-gray-500 ml-1">per jar</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">(4.8)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 ${
                      session 
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-200'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 hover:shadow-gray-200'
                    }`}
                  >
                    {session ? '🛒 Add to Cart' : '🔒 Login to Add to Cart'}
                  </button>
                  <Link 
                    href={`/products/${product.id}`}
                    className="w-full block text-center border-2 border-emerald-600 text-emerald-600 py-3 px-4 rounded-xl font-semibold hover:bg-emerald-50 hover:border-emerald-700 transition-all duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more products.</p>
            <button
              onClick={clearFilters}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCartModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add to Cart</h3>
              <button
                onClick={closeCartModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Shopping Mode Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛒 Shopping Mode</h3>
              
              {/* Mode Toggle */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Order for:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setCartItem(prev => ({ ...prev, childProfileId: '' }))
                      setShoppingMode('family')
                    }}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      shoppingMode === 'family'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    👨‍👩‍👧‍👦 Family
                  </button>
                  <button
                    onClick={() => {
                      setShoppingMode('child')
                      // Auto-select first child if none selected
                      if (!cartItem.childProfileId && childProfiles.length > 0) {
                        setCartItem(prev => ({ ...prev, childProfileId: childProfiles[0].id }))
                      }
                    }}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      shoppingMode === 'child'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    👶 Specific Child
                  </button>
                </div>
              </div>
            </div>

            {/* Health Report */}
            {childProfiles.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🛡️</span>
                  Health Report for {selectedProduct.name}
                </h4>
                
                {(() => {
                  // Calculate safety for all children
                  const safeChildren: ChildProfile[] = []
                  const unsafeChildren: { child: ChildProfile; conflicts: any[] }[] = []
                  
                  childProfiles.forEach(child => {
                    const conflicts = findAllergenConflicts(child.allergies, selectedProduct.ingredients)
                    if (conflicts.length === 0) {
                      safeChildren.push(child)
                    } else {
                      unsafeChildren.push({ child, conflicts })
                    }
                  })

                  // Get selected child info
                  const selectedChild = childProfiles.find(p => p.id === cartItem.childProfileId)
                  
                  if (shoppingMode === 'family') {
                    // Family mode - only show warning if there are conflicts
                    if (unsafeChildren.length > 0) {
                      return (
                        <div className="space-y-3">
                          {/* Family Warning */}
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center">
                              <span className="text-red-600 mr-2">⚠️</span>
                              <div>
                                <p className="text-sm font-medium text-red-800">
                                  Allergy Warning for Family Order
                                </p>
                                <p className="text-xs text-red-600">
                                  {unsafeChildren.length} child{unsafeChildren.length > 1 ? 'ren' : ''} may have allergic reactions
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Unsafe Children List */}
                          <div className="space-y-2">
                            {unsafeChildren.map(({ child, conflicts }) => {
                              let highestSeverity: 'critical' | 'high' | 'moderate' | 'low' = 'low'
                              for (const conflict of conflicts) {
                                if (conflict.severity === 'critical') highestSeverity = 'critical'
                                else if (conflict.severity === 'high' && highestSeverity !== 'critical') highestSeverity = 'high'
                                else if (conflict.severity === 'moderate' && highestSeverity === 'low') highestSeverity = 'moderate'
                              }

                              const allergenNames = conflicts.map(c => c.allergen).join(', ')
                              
                              return (
                                <div key={child.id} className={`p-2 rounded-lg border text-xs ${
                                  highestSeverity === 'critical' ? 'bg-red-900 text-white border-red-800' :
                                  highestSeverity === 'high' ? 'bg-red-700 text-white border-red-600' :
                                  highestSeverity === 'moderate' ? 'bg-orange-500 text-white border-orange-400' :
                                  'bg-yellow-500 text-black border-yellow-400'
                                }`}>
                                  <span className="font-medium">
                                    {getAllergenSeverityIcon(highestSeverity)} {child.name}: {allergenNames}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    } else {
                      // All children are safe
                      return (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">✅</span>
                            <div>
                              <p className="text-sm font-medium text-green-800">
                                Safe for all children
                              </p>
                              <p className="text-xs text-green-600">
                                No allergen conflicts detected
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  } else {
                    // Child mode - show detailed info
                    return (
                      <div className="space-y-3">
                        {/* Child Selection & Safety */}
                        {shoppingMode === 'child' && (
                          <div className="p-3 bg-white rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-700">Select Child:</h5>
                              <div className="flex flex-wrap gap-1">
                                {childProfiles.map((profile) => (
                                  <button
                                    key={profile.id}
                                    onClick={() => setCartItem(prev => ({ ...prev, childProfileId: profile.id }))}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                      cartItem.childProfileId === profile.id
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {profile.name}
                                    {profile.allergies.length > 0 && (
                                      <span className="ml-1">⚠️</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Selected Child Safety Details */}
                            {selectedChild && (
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {(() => {
                                    const conflicts = findAllergenConflicts(selectedChild.allergies, selectedProduct.ingredients)
                                    
                                    if (conflicts.length === 0) {
                                      return (
                                        <div className="flex items-center">
                                          <span className="text-green-600 mr-2">✅</span>
                                          <div>
                                            <p className="text-sm font-medium text-green-800">
                                              Safe for {selectedChild.name}
                                            </p>
                                            <p className="text-xs text-green-600">
                                              No allergen conflicts detected
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    }

                                    const highestSeverity = conflicts.reduce((highest, conflict) => {
                                      const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1 }
                                      return severityOrder[conflict.severity] > severityOrder[highest] ? conflict.severity : highest
                                    }, 'low' as 'critical' | 'high' | 'moderate' | 'low')

                                    const allergenNames = conflicts.map(c => c.allergen).join(', ')
                                    
                                    return (
                                      <div className="flex items-start">
                                        <span className="text-red-600 mr-2 mt-0.5">
                                          {getAllergenSeverityIcon(highestSeverity)}
                                        </span>
                                        <div>
                                          <p className="text-sm font-medium text-red-800">
                                            Not safe for {selectedChild.name}
                                          </p>
                                          <p className="text-xs text-red-600">
                                            Allergic to: {allergenNames}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  })()}
                                </div>
                                
                                {/* Quick allergy info */}
                                {selectedChild.allergies.length > 0 && (
                                  <div className="text-right ml-3">
                                    <p className="text-xs text-gray-500">Known allergies:</p>
                                    <p className="text-xs text-red-600 font-medium">
                                      {selectedChild.allergies.join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quick Overview for All Children */}
                        {childProfiles.length > 1 && (
                          <div className="p-3 bg-white rounded-lg border">
                            <p className="text-xs text-gray-600 mb-2">All children overview:</p>
                            <div className="flex flex-wrap gap-2">
                              {childProfiles.map(child => {
                                const conflicts = findAllergenConflicts(child.allergies, selectedProduct.ingredients)
                                const isSafe = conflicts.length === 0
                                return (
                                  <span 
                                    key={child.id}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isSafe 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {isSafe ? '✅' : '⚠️'} {child.name}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                })()}
              </div>
            )}

            {/* Product Info */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-4xl">{selectedProduct.image}</div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                <p className="text-lg font-bold text-emerald-600">R{selectedProduct.price}</p>
              </div>
            </div>


            {/* Quantity and Notes */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCartItem(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={cartItem.quantity}
                    onChange={(e) => setCartItem(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) || 1 
                    }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    onClick={() => setCartItem(prev => ({ 
                      ...prev, 
                      quantity: Math.min(selectedProduct.stock, prev.quantity + 1) 
                    }))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max: {selectedProduct.stock} available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes (Optional)</label>
                <textarea
                  value={cartItem.notes}
                  onChange={(e) => setCartItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-emerald-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="text-xl font-bold text-emerald-600">
                  R{(selectedProduct.price * cartItem.quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={closeCartModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Add to Cart button clicked!')
                  console.log('isAddingToCart state:', isAddingToCart)
                  console.log('Button disabled?', isAddingToCart)
                  handleCartSubmit()
                }}
                disabled={isAddingToCart}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
