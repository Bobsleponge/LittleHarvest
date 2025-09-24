import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  ageGroup: string
  texture: string
  ingredients: string[]
  stock: number
  category: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    age: '',
    texture: '',
    search: '',
    category: ''
  })

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Organic Apple Puree',
      description: 'Fresh, organic apples blended to perfection for your little one',
      price: 45,
      image: '🍎',
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
      ageGroup: '12+ months',
      texture: 'Smooth',
      ingredients: ['Organic Blueberries', 'Organic Strawberries', 'Antioxidants'],
      stock: 28,
      category: 'Fruits'
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProducts(mockProducts)
      setFilteredProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

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

    setFilteredProducts(filtered)
  }, [filters, products])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ age: '', texture: '', search: '', category: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TT</span>
                </div>
                <span className="font-bold text-2xl text-gray-800">Tiny Tastes</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-emerald-600 font-semibold">Products</Link>
              <Link href="/cart" className="text-gray-600 hover:text-gray-800 font-semibold">Cart</Link>
              <Link href="/dev-login" className="text-gray-600 hover:text-gray-800 font-semibold">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Fresh, organic baby food made with love</p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{product.image}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{product.ageGroup}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Texture:</span>
                    <span className="font-medium">{product.texture}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock} available
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-emerald-600">R{product.price}</span>
                  <span className="text-sm text-gray-500">per jar</span>
                </div>

                <div className="space-y-2">
                  <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    Add to Cart
                  </button>
                  <Link 
                    href={`/products/${product.id}`}
                    className="w-full block text-center border border-emerald-600 text-emerald-600 py-2 px-4 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
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
    </div>
  )
}
