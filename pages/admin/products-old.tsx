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
  status: 'active' | 'inactive'
  createdAt: string
}

export default function AdminProductsPage() {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Organic Apple Puree',
      description: 'Fresh, organic apples blended to perfection for your little one',
      price: 45,
      image: '🍎',
      ageGroup: '6-8 months',
      texture: 'Smooth',
      category: 'Fruits',
      stock: 25,
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Sweet Potato Mash',
      description: 'Nutritious sweet potato with natural sweetness',
      price: 42,
      image: '🍠',
      ageGroup: '6-8 months',
      texture: 'Smooth',
      category: 'Vegetables',
      stock: 18,
      status: 'active',
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      name: 'Banana & Oatmeal',
      description: 'Creamy banana with wholesome oatmeal',
      price: 48,
      image: '🍌',
      ageGroup: '9-12 months',
      texture: 'Lumpy',
      category: 'Grains',
      stock: 32,
      status: 'active',
      createdAt: '2024-01-03'
    },
    {
      id: '4',
      name: 'Carrot & Pea Mix',
      description: 'Colorful blend of carrots and peas',
      price: 44,
      image: '🥕',
      ageGroup: '9-12 months',
      texture: 'Lumpy',
      category: 'Vegetables',
      stock: 5,
      status: 'active',
      createdAt: '2024-01-04'
    },
    {
      id: '5',
      name: 'Chicken & Rice',
      description: 'Protein-rich chicken with soft rice',
      price: 52,
      image: '🍗',
      ageGroup: '12+ months',
      texture: 'Chunky',
      category: 'Proteins',
      stock: 15,
      status: 'active',
      createdAt: '2024-01-05'
    },
    {
      id: '6',
      name: 'Mixed Berry Blend',
      description: 'Antioxidant-rich berry combination',
      price: 46,
      image: '🫐',
      ageGroup: '12+ months',
      texture: 'Smooth',
      category: 'Fruits',
      stock: 0,
      status: 'inactive',
      createdAt: '2024-01-06'
    }
  ])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'low-stock' && product.stock < 10) ||
                         (filter === 'out-of-stock' && product.stock === 0) ||
                         (filter === 'active' && product.status === 'active') ||
                         (filter === 'inactive' && product.status === 'inactive')
    
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.category.toLowerCase().includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock < 10) return 'text-orange-600'
    return 'text-green-600'
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
            <p className="text-gray-600">Manage your baby food products</p>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Add New Product
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
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
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
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
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock < 10 && p.stock > 0).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
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
                    Age Group
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{product.image}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.ageGroup}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-emerald-600 hover:text-emerald-900">Edit</button>
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
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
      </div>
    </AdminLayout>
  )
}
