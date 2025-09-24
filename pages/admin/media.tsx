import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  size: string
  url: string
  uploadedAt: string
  uploadedBy: string
  usedIn: string[]
}

export default function AdminMediaPage() {
  const [mediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'apple-puree-hero.jpg',
      type: 'image',
      size: '2.4 MB',
      url: '/images/apple-puree-hero.jpg',
      uploadedAt: '2024-01-25',
      uploadedBy: 'admin@tinytastes.co.za',
      usedIn: ['Product: Organic Apple Puree', 'Homepage Hero']
    },
    {
      id: '2',
      name: 'sweet-potato-mash.jpg',
      type: 'image',
      size: '1.8 MB',
      url: '/images/sweet-potato-mash.jpg',
      uploadedAt: '2024-01-24',
      uploadedBy: 'admin@tinytastes.co.za',
      usedIn: ['Product: Sweet Potato Mash']
    },
    {
      id: '3',
      name: 'baby-feeding-guide.pdf',
      type: 'document',
      size: '3.2 MB',
      url: '/documents/baby-feeding-guide.pdf',
      uploadedAt: '2024-01-20',
      uploadedBy: 'manager@tinytastes.co.za',
      usedIn: ['Customer Resources']
    },
    {
      id: '4',
      name: 'product-showcase.mp4',
      type: 'video',
      size: '15.6 MB',
      url: '/videos/product-showcase.mp4',
      uploadedAt: '2024-01-18',
      uploadedBy: 'admin@tinytastes.co.za',
      usedIn: ['Homepage Video']
    }
  ])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredFiles = mediaFiles.filter(file => {
    const matchesFilter = filter === 'all' || file.type === filter
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase()) ||
                         file.uploadedBy.toLowerCase().includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'document': return '📄'
      default: return '📁'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'document': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalSize = mediaFiles.reduce((sum, file) => {
    const size = parseFloat(file.size)
    return sum + size
  }, 0)

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Media</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
            <p className="text-gray-600">Manage your images, videos, and documents</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Upload Files
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Add Folder
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search media files..."
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
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{mediaFiles.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-emerald-600">{totalSize.toFixed(1)} MB</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💾</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mediaFiles.filter(f => f.type === 'image').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mediaFiles.filter(f => f.type === 'video').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{getFileIcon(file.type)}</div>
                  <h3 className="font-medium text-gray-900 text-sm truncate">{file.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)} mt-2`}>
                    {file.type}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{file.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>By:</span>
                    <span className="truncate ml-2">{file.uploadedBy}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full bg-emerald-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-emerald-700 transition-colors">
                    View
                  </button>
                  <div className="flex space-x-2">
                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 border border-red-300 text-red-700 py-2 px-3 rounded text-sm font-medium hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                {file.usedIn.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-gray-700 mb-2">Used in:</p>
                    <div className="space-y-1">
                      {file.usedIn.slice(0, 2).map((usage, index) => (
                        <p key={index} className="text-xs text-gray-600 truncate">{usage}</p>
                      ))}
                      {file.usedIn.length > 2 && (
                        <p className="text-xs text-gray-500">+{file.usedIn.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No media files found</h3>
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

        {/* Upload Area */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Files</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📤</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Drag and drop files here</h4>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Choose Files
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: JPG, PNG, GIF, MP4, PDF (Max 50MB per file)
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
