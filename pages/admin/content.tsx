import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

interface ContentItem {
  id: string
  title: string
  type: 'page' | 'blog' | 'faq' | 'policy'
  status: 'published' | 'draft' | 'archived'
  lastModified: string
  author: string
  views?: number
}

export default function AdminContentPage() {
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Homepage Hero Section',
      type: 'page',
      status: 'published',
      lastModified: '2024-01-28 14:30:00',
      author: 'admin@tinytastes.co.za',
      views: 1250
    },
    {
      id: '2',
      title: 'Baby Feeding Guide',
      type: 'blog',
      status: 'published',
      lastModified: '2024-01-25 10:15:00',
      author: 'manager@tinytastes.co.za',
      views: 890
    },
    {
      id: '3',
      title: 'Privacy Policy',
      type: 'policy',
      status: 'published',
      lastModified: '2024-01-20 16:20:00',
      author: 'admin@tinytastes.co.za',
      views: 234
    },
    {
      id: '4',
      title: 'Frequently Asked Questions',
      type: 'faq',
      status: 'published',
      lastModified: '2024-01-18 12:45:00',
      author: 'manager@tinytastes.co.za',
      views: 567
    },
    {
      id: '5',
      title: 'New Product Launch Blog',
      type: 'blog',
      status: 'draft',
      lastModified: '2024-01-28 11:30:00',
      author: 'admin@tinytastes.co.za'
    },
    {
      id: '6',
      title: 'Terms of Service',
      type: 'policy',
      status: 'published',
      lastModified: '2024-01-15 14:10:00',
      author: 'admin@tinytastes.co.za',
      views: 123
    }
  ])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredContent = contentItems.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter || item.type === filter
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.author.toLowerCase().includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return '📄'
      case 'blog': return '📝'
      case 'faq': return '❓'
      case 'policy': return '📋'
      default: return '📁'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800'
      case 'blog': return 'bg-purple-100 text-purple-800'
      case 'faq': return 'bg-orange-100 text-orange-800'
      case 'policy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const publishedCount = contentItems.filter(item => item.status === 'published').length
  const draftCount = contentItems.filter(item => item.status === 'draft').length
  const totalViews = contentItems.reduce((sum, item) => sum + (item.views || 0), 0)

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Content</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
            <p className="text-gray-600">Manage your website content and pages</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Import Content
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Create New
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search content..."
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
                <option value="all">All Content</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="page">Pages</option>
                <option value="blog">Blog Posts</option>
                <option value="faq">FAQs</option>
                <option value="policy">Policies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{contentItems.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">{totalViews.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lastModified}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.views ? item.views.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-emerald-600 hover:text-emerald-900">Edit</button>
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                        <button className="text-purple-600 hover:text-purple-900">Duplicate</button>
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
        {filteredContent.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
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

        {/* Content Types Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pages</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {contentItems.filter(item => item.type === 'page').length}
              </div>
              <p className="text-sm text-gray-600">Website pages</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Posts</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {contentItems.filter(item => item.type === 'blog').length}
              </div>
              <p className="text-sm text-gray-600">Articles and posts</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">FAQs</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {contentItems.filter(item => item.type === 'faq').length}
              </div>
              <p className="text-sm text-gray-600">Frequently asked questions</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {contentItems.filter(item => item.type === 'policy').length}
              </div>
              <p className="text-sm text-gray-600">Legal documents</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
