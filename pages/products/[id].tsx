import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
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

export default function ProductDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const { addToCartSuccess } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [selectedChildProfile, setSelectedChildProfile] = useState<ChildProfile | null>(null)
  const [shoppingMode, setShoppingMode] = useState<'family' | 'child'>('family')
  const [loading, setLoading] = useState(true)
  const [showCartModal, setShowCartModal] = useState(false)
  const [cartItem, setCartItem] = useState<CartItem>({
    productId: '',
    quantity: 1,
    notes: '',
    childProfileId: ''
  })
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')

  // Mock products data (same as products index page)
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Organic Apple Puree',
      description: 'Fresh, organic apples blended to perfection for your little one. This smooth puree is perfect for introducing fruits to babies starting their solid food journey.',
      price: 45,
      image: '🍎',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=600&fit=crop&crop=center',
      ageGroup: '6-8 months',
      texture: 'Smooth',
      ingredients: ['Organic Apples', 'Vitamin C'],
      stock: 25,
      category: 'Fruits'
    },
    {
      id: '2',
      name: 'Sweet Potato Mash',
      description: 'Nutritious sweet potato with natural sweetness that babies love. Rich in beta-carotene and perfect for developing taste buds.',
      price: 42,
      image: '🍠',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=600&fit=crop&crop=center',
      ageGroup: '6-8 months',
      texture: 'Smooth',
      ingredients: ['Organic Sweet Potato', 'Beta Carotene'],
      stock: 18,
      category: 'Vegetables'
    },
    {
      id: '3',
      name: 'Banana & Oatmeal',
      description: 'Creamy banana combined with wholesome oatmeal for a nutritious and filling meal. Perfect for growing babies who need extra energy.',
      price: 48,
      image: '🍌',
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=600&fit=crop&crop=center',
      ageGroup: '9-12 months',
      texture: 'Lumpy',
      ingredients: ['Organic Banana', 'Organic Oats', 'Iron'],
      stock: 32,
      category: 'Grains'
    },
    {
      id: '4',
      name: 'Carrot & Pea Mix',
      description: 'Colorful blend of carrots and peas that introduces vegetables in a fun way. Packed with vitamins and minerals essential for growth.',
      price: 44,
      image: '🥕',
      imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&h=600&fit=crop&crop=center',
      ageGroup: '9-12 months',
      texture: 'Lumpy',
      ingredients: ['Organic Carrots', 'Organic Peas', 'Vitamin A'],
      stock: 21,
      category: 'Vegetables'
    },
    {
      id: '5',
      name: 'Chicken & Rice',
      description: 'Protein-rich chicken with soft rice for babies ready for more complex textures. A complete meal with essential amino acids.',
      price: 52,
      image: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=600&fit=crop&crop=center',
      ageGroup: '12+ months',
      texture: 'Chunky',
      ingredients: ['Organic Chicken', 'Brown Rice', 'Protein'],
      stock: 15,
      category: 'Proteins'
    },
    {
      id: '6',
      name: 'Mixed Berry Blend',
      description: 'Antioxidant-rich berry combination that introduces natural sweetness and important phytonutrients for healthy development.',
      price: 46,
      image: '🫐',
      imageUrl: 'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?w=600&h=600&fit=crop&crop=center',
      ageGroup: '12+ months',
      texture: 'Smooth',
      ingredients: ['Organic Blueberries', 'Organic Strawberries', 'Antioxidants'],
      stock: 28,
      category: 'Fruits'
    }
  ]

  // Fetch product from API
  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else {
        // Fallback to mock products if API fails
        const foundProduct = mockProducts.find(p => p.id === productId)
        setProduct(foundProduct || null)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      // Fallback to mock products if API fails
      const foundProduct = mockProducts.find(p => p.id === productId)
      setProduct(foundProduct || null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProduct(id)
    }
  }, [id])

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

  // Fetch child profiles when session changes
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

  const handleAddToCart = () => {
    if (!session) {
      window.location.href = '/dev-login'
      return
    }
    
    if (!product) return

    setCartItem({
      productId: product.id,
      quantity: 1,
      notes: ''
    })
    setShowCartModal(true)
  }

  const handleCartSubmit = async () => {
    console.log('handleCartSubmit called (product details)')
    console.log('product:', product)
    console.log('session:', session)
    console.log('cartItem:', cartItem)
    console.log('shoppingMode:', shoppingMode)
    
    if (!product || !session) {
      console.log('Early return - missing product or session')
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
        setCartItem({ productId: '', quantity: 1, notes: '', childProfileId: '' })
        // Trigger cart refresh for floating icon
        addToCartSuccess()
      } else {
        const error = await response.json()
        console.log('Error response:', error)
        console.log('Error details:', error.details)
        
        if (error.code === 'USER_NOT_FOUND') {
          alert('Your session is outdated. Please log out and log in again to continue.')
          // Clear session cookies manually
          document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          // Redirect to login page
          window.location.href = '/dev-login'
        } else {
          alert(`Failed to add to cart: ${error.error}\nDetails: ${JSON.stringify(error.details)}`)
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const closeCartModal = () => {
    setShowCartModal(false)
    setCartItem({ productId: '', quantity: 1, notes: '', childProfileId: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link 
            href="/products"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="products" />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span>›</span>
            <Link href="/products" className="hover:text-gray-800">Products</Link>
            <span>›</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

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
                    This product will be added to your family cart. You can switch to individual child shopping at any time.
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
                  
                  {/* Enhanced Allergen Warning for this specific product */}
                  {(() => {
                    const conflicts = findAllergenConflicts(selectedChildProfile.allergies, product.ingredients)
                    
                    if (conflicts.length === 0) {
                      return (
                        <div className="mt-3 p-3 bg-green-100 rounded border border-green-200">
                          <p className="text-sm text-green-800 font-semibold">
                            ✅ This meal is safe for {selectedChildProfile.name}
                          </p>
                        </div>
                      )
                    }

                    // Group conflicts by severity
                    const criticalConflicts = conflicts.filter(c => c.severity === 'critical')
                    const highConflicts = conflicts.filter(c => c.severity === 'high')
                    const moderateConflicts = conflicts.filter(c => c.severity === 'moderate')
                    const lowConflicts = conflicts.filter(c => c.severity === 'low')

                    return (
                      <div className="mt-3 space-y-2">
                        {criticalConflicts.map((conflict, index) => (
                          <div key={index} className="p-3 bg-red-900 text-white rounded border border-red-800">
                            <p className="text-sm font-semibold flex items-center">
                              {getAllergenSeverityIcon(conflict.severity)} CRITICAL ALLERGY: {selectedChildProfile.name} is severely allergic to {conflict.allergen}!
                            </p>
                            <p className="text-xs mt-1 opacity-90">
                              Found in: {conflict.conflictingIngredients.join(', ')}
                            </p>
                          </div>
                        ))}
                        
                        {highConflicts.map((conflict, index) => (
                          <div key={index} className="p-3 bg-red-700 text-white rounded border border-red-600">
                            <p className="text-sm font-semibold flex items-center">
                              {getAllergenSeverityIcon(conflict.severity)} HIGH RISK: {selectedChildProfile.name} is allergic to {conflict.allergen}
                            </p>
                            <p className="text-xs mt-1 opacity-90">
                              Found in: {conflict.conflictingIngredients.join(', ')}
                            </p>
                          </div>
                        ))}
                        
                        {moderateConflicts.map((conflict, index) => (
                          <div key={index} className="p-3 bg-orange-500 text-white rounded border border-orange-400">
                            <p className="text-sm font-semibold flex items-center">
                              {getAllergenSeverityIcon(conflict.severity)} MODERATE RISK: {selectedChildProfile.name} may be sensitive to {conflict.allergen}
                            </p>
                            <p className="text-xs mt-1 opacity-90">
                              Found in: {conflict.conflictingIngredients.join(', ')}
                            </p>
                          </div>
                        ))}
                        
                        {lowConflicts.map((conflict, index) => (
                          <div key={index} className="p-3 bg-yellow-500 text-black rounded border border-yellow-400">
                            <p className="text-sm font-semibold flex items-center">
                              {getAllergenSeverityIcon(conflict.severity)} LOW RISK: {selectedChildProfile.name} may have mild sensitivity to {conflict.allergen}
                            </p>
                            <p className="text-xs mt-1 opacity-80">
                              Found in: {conflict.conflictingIngredients.join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                  
                  <p className="text-xs text-emerald-600 mt-2">
                    This product will be tagged for {selectedChildProfile.name}. Switch back to family mode anytime.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
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
                <div className="text-9xl opacity-60">{product.image}</div>
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-sm font-semibold text-gray-700 rounded-full shadow-lg">
                  {product.category}
                </span>
              </div>
              
              {/* Stock Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 backdrop-blur-sm text-sm font-semibold rounded-full shadow-lg ${
                  product.stock < 10 
                    ? 'bg-red-500/95 text-white' 
                    : 'bg-green-500/95 text-white'
                }`}>
                  {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 shadow-xl transform hover:-translate-y-1 flex items-center justify-center ${
                  session 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-200'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 hover:shadow-gray-200'
                }`}
              >
                <span className="mr-3 text-xl">{session ? '🛒' : '🔒'}</span>
                {session ? 'Add to Cart' : 'Login to Add to Cart'}
              </button>
              <button className="w-16 h-16 border-2 border-gray-300 rounded-2xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-2xl">
                ❤️
              </button>
              <button className="w-16 h-16 border-2 border-gray-300 rounded-2xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-2xl">
                📤
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {product.ageGroup}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  {product.texture}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-6 text-gray-900">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.description}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <span className="text-gray-600 font-medium">(4.8) • 127 reviews</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h3>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-5xl font-bold text-emerald-600">R{product.price}</span>
                  <span className="text-lg text-gray-500 ml-2">per jar</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Stock Available:</div>
                  <span className={`text-xl font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock} jars
                  </span>
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Free shipping on orders over R200</span>
                  <span className="text-emerald-600 font-semibold">✓</span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span className="text-gray-700 font-medium">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Age Group:</span>
                  <span className="font-bold text-gray-900">{product.ageGroup}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Texture:</span>
                  <span className="font-bold text-gray-900">{product.texture}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Category:</span>
                  <span className="font-bold text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Stock Status:</span>
                  <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Storage Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">❄️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Storage Instructions</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Store in a cool, dry place</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Refrigerate after opening</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Use within 3 days of opening</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Best before date printed on jar</span>
              </div>
            </div>
          </div>

          {/* Feeding Guide */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Feeding Guide</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Start with small amounts</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Introduce one new food at a time</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Watch for allergic reactions</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                <span className="text-gray-700 font-medium">Consult your pediatrician if concerned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Products */}
        <div className="text-center">
          <Link 
            href="/products"
            className="inline-flex items-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-2xl font-bold text-lg hover:bg-emerald-50 hover:border-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-200"
          >
            <span className="mr-3">←</span>
            Back to All Products
          </Link>
        </div>
      </div>

      {/* Cart Modal */}
      {showCartModal && product && (
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

            {/* Safety Summary */}
            {childProfiles.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🛡️</span>
                  Safety Summary for {product.name}
                </h4>
                
                {(() => {
                  const safeChildren: ChildProfile[] = []
                  const unsafeChildren: { child: ChildProfile; conflicts: any[] }[] = []
                  
                  childProfiles.forEach(child => {
                    const conflicts = findAllergenConflicts(child.allergies, product.ingredients)
                    if (conflicts.length === 0) {
                      safeChildren.push(child)
                    } else {
                      unsafeChildren.push({ child, conflicts })
                    }
                  })
                  
                  return (
                    <div className="space-y-3">
                      {/* Safe Children */}
                      {safeChildren.length > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-2 flex items-center">
                            <span className="mr-1">✅</span>
                            Safe for: {safeChildren.map(child => child.name).join(', ')}
                          </p>
                          <p className="text-xs text-green-700">
                            No allergen conflicts detected
                          </p>
                        </div>
                      )}
                      
                      {/* Unsafe Children */}
                      {unsafeChildren.length > 0 && (
                        <div className="space-y-2">
                          {unsafeChildren.map(({ child, conflicts }) => {
                            const criticalConflicts = conflicts.filter(c => c.severity === 'critical')
                            const highConflicts = conflicts.filter(c => c.severity === 'high')
                            const moderateConflicts = conflicts.filter(c => c.severity === 'moderate')
                            const lowConflicts = conflicts.filter(c => c.severity === 'low')
                            
                            const highestSeverity = criticalConflicts.length > 0 ? 'critical' : 
                                                  highConflicts.length > 0 ? 'high' : 
                                                  moderateConflicts.length > 0 ? 'moderate' : 'low'
                            
                            const allConflicts = [...criticalConflicts, ...highConflicts, ...moderateConflicts, ...lowConflicts]
                            const allergenNames = allConflicts.map(c => c.allergen).join(', ')
                            
                            return (
                              <div key={child.id} className={`p-3 rounded-lg border ${
                                highestSeverity === 'critical' ? 'bg-red-900 text-white border-red-800' :
                                highestSeverity === 'high' ? 'bg-red-700 text-white border-red-600' :
                                highestSeverity === 'moderate' ? 'bg-orange-500 text-white border-orange-400' :
                                'bg-yellow-500 text-black border-yellow-400'
                              }`}>
                                <p className="text-sm font-medium flex items-center">
                                  <span className="mr-1">{getAllergenSeverityIcon(highestSeverity)}</span>
                                  Not safe for {child.name} - allergic to: {allergenNames}
                                </p>
                                <p className="text-xs mt-1 opacity-90">
                                  Found in ingredients: {allConflicts.map(c => c.conflictingIngredients.join(', ')).join(', ')}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {/* No Children */}
                      {safeChildren.length === 0 && unsafeChildren.length === 0 && (
                        <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">
                            No child profiles found. Add child profiles to see safety information.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Shopping Mode Selection with Integrated Child Selection */}
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
                    onClick={() => setShoppingMode('child')}
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

              {/* Child Selection (integrated) */}
              {shoppingMode === 'child' && childProfiles.length > 0 && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">Select Child:</h4>
                  <div className="flex flex-wrap gap-2">
                    {childProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => setCartItem(prev => ({ ...prev, childProfileId: profile.id }))}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                          cartItem.childProfileId === profile.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                        }`}
                      >
                        {profile.name}
                        {profile.allergies.length > 0 && (
                          <span className="ml-1 text-xs">⚠️</span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Selected Child Info */}
                  {cartItem.childProfileId && (
                    (() => {
                      const profile = childProfiles.find(p => p.id === cartItem.childProfileId)
                      return profile ? (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                          <p className="text-sm text-emerald-800">
                            <strong>Selected:</strong> {profile.name} 
                            <span className="text-emerald-600 ml-2">
                              (Age: {Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years)
                            </span>
                          </p>
                          {profile.allergies.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-red-600 font-medium">
                                ⚠️ Allergies: {profile.allergies.join(', ')}
                              </p>
                              {(() => {
                                const allergenConflicts = profile.allergies.filter(allergy => 
                                  product.ingredients.some(ingredient => 
                                    ingredient.toLowerCase().includes(allergy.toLowerCase())
                                  )
                                )
                                return allergenConflicts.length > 0 ? (
                                  <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                                    <p className="text-xs text-red-800 font-semibold">
                                      🚨 WARNING: {profile.name} is allergic to {allergenConflicts.join(', ')} in this meal!
                                    </p>
                                    <p className="text-xs text-red-700 mt-1">
                                      Found in ingredients: {product.ingredients.filter(ingredient => 
                                        allergenConflicts.some(allergy => 
                                          ingredient.toLowerCase().includes(allergy.toLowerCase())
                                        )
                                      ).join(', ')}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-green-600 mt-1">
                                    ✅ This meal is safe for {profile.name}
                                  </p>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      ) : null
                    })()
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-4xl">{product.image}</div>
              <div>
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-lg font-bold text-emerald-600">R{product.price}</p>
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
                    max={product.stock}
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
                      quantity: Math.min(product.stock, prev.quantity + 1) 
                    }))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max: {product.stock} available
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
                  R{(product.price * cartItem.quantity).toFixed(2)}
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
