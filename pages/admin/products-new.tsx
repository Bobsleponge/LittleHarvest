import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

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
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  ingredients: string[]
  allergens: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  tags: string[]
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
  ingredients: string[]
  allergens: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  tags: string[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Organic Apple Puree',
      description: 'Sweet and smooth apple puree made from organic apples, perfect for introducing fruits to your little one.',
      price: 45,
      image: '🍎',
      ageGroup: '6+ months',
      texture: 'Smooth',
      category: 'Fruits',
      stock: 25,
      minStock: 10,
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-28',
      ingredients: ['Organic Apples', 'Water'],
      allergens: ['None'],
      nutritionInfo: { calories: 60, protein: 0.3, carbs: 15, fat: 0.2 },
      tags: ['organic', 'smooth', 'first-foods']
    },
    {
      id: '2',
      name: 'Sweet Potato Mash',
      description: 'Nutritious sweet potato mash with natural sweetness and beta-carotene for healthy development.',
      price: 42,
      image: '🍠',
      ageGroup: '6+ months',
      texture: 'Smooth',
      category: 'Vegetables',
      stock: 5,
      minStock: 10,
      status: 'active',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-28',
      ingredients: ['Sweet Potatoes', 'Water'],
      allergens: ['None'],
      nutritionInfo: { calories: 80, protein: 1.5, carbs: 18, fat: 0.1 },
      tags: ['beta-carotene', 'vitamin-a', 'smooth']
    },
    {
      id: '3',
      name: 'Banana & Oatmeal',
      description: 'Creamy banana and oatmeal blend rich in fiber and potassium for growing babies.',
      price: 48,
      image: '🍌',
      ageGroup: '8+ months',
      texture: 'Lumpy',
      category: 'Grains',
      stock: 32,
      minStock: 15,
      status: 'active',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-28',
      ingredients: ['Bananas', 'Oatmeal', 'Water'],
      allergens: ['Gluten'],
      nutritionInfo: { calories: 90, protein: 2.5, carbs: 20, fat: 0.8 },
      tags: ['fiber', 'potassium', 'lumpy']
    },
    {
      id: '4',
      name: 'Chicken & Rice',
      description: 'Protein-rich chicken and rice combination perfect for introducing meat to your baby.',
      price: 52,
      image: '🍗',
      ageGroup: '10+ months',
      texture: 'Chunky',
      category: 'Proteins',
      stock: 15,
      minStock: 12,
      status: 'active',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-28',
      ingredients: ['Chicken Breast', 'Brown Rice', 'Carrots', 'Water'],
      allergens: ['None'],
      nutritionInfo: { calories: 120, protein: 8, carbs: 15, fat: 2.5 },
      tags: ['protein', 'iron', 'chunky']
    },
    {
      id: '5',
      name: 'Carrot & Pea Mix',
      description: 'Colorful blend of carrots and peas packed with vitamins and minerals.',
      price: 44,
      image: '🥕',
      ageGroup: '8+ months',
      texture: 'Lumpy',
      category: 'Vegetables',
      stock: 0,
      minStock: 8,
      status: 'inactive',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-25',
      ingredients: ['Carrots', 'Peas', 'Water'],
      allergens: ['None'],
      nutritionInfo: { calories: 70, protein: 2, carbs: 16, fat: 0.3 },
      tags: ['vitamin-a', 'vitamin-c', 'lumpy']
    }
  ])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    ageGroup: '6+ months',
    texture: 'Smooth',
    category: 'Fruits',
    stock: 0,
    minStock: 10,
    ingredients: [],
    allergens: [],
    nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    tags: []
  })

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || product.status === filter || product.category === filter
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase()) ||
                         product.category.toLowerCase().includes(search.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price - b.price
      case 'stock':
        return a.stock - b.stock
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

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      ...formData,
      image: '🍎', // Default image
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
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
      ingredients: product.ingredients,
      allergens: product.allergens,
      nutritionInfo: product.nutritionInfo,
      tags: product.tags
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
      ingredients: [],
      allergens: [],
      nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      tags: []
    })
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Products</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your product catalog and inventory</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Import Products
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name, description, category, or tags..."
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
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Grains">Grains</option>
                <option value="Proteins">Proteins</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="createdAt">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
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
                  {products.filter(p => p.stock <= p.minStock && p.stock > 0).length}
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
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.map((product) => (
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
                      {new Date(product.updatedAt).toLocaleDateString()}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
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

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (R)</label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </AdminLayout>
  )
}
