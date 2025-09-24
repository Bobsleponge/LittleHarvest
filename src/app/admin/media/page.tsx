'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  Search, 
  Image,
  File,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Plus,
  Folder,
  Calendar,
  User
} from 'lucide-react'
import { FileUpload } from '@/components/file-upload'
import { LoadingPage } from '@/components/ui/loading'

interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMediaFiles()
  }, [])

  const fetchMediaFiles = async () => {
    try {
      setRefreshing(true)
      // Mock media files for now
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          name: 'chicken-pasta-primitive.jpg',
          url: '/images/products/chicken-pasta-primitive.jpg',
          type: 'image/jpeg',
          size: 245760,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin@tinytastes.co.za'
        },
        {
          id: '2',
          name: 'beef-butternut-lentil.jpg',
          url: '/images/products/beef-butternut-lentil.jpg',
          type: 'image/jpeg',
          size: 198432,
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          uploadedBy: 'admin@tinytastes.co.za'
        },
        {
          id: '3',
          name: 'product-catalog.pdf',
          url: '/documents/product-catalog.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
          uploadedBy: 'admin@tinytastes.co.za'
        }
      ]
      
      setFiles(mockFiles)
    } catch (error) {
      console.error('Error fetching media files:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        // Add the new file to the list
        setFiles(prev => [result.file, ...prev])
      } else {
        alert('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      // Mock deletion - in real implementation, you'd call an API
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
          <p className="text-gray-600">Upload and manage your files and images</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMediaFiles}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Drag and drop files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            maxSize={5 * 1024 * 1024} // 5MB
            disabled={uploading}
          />
          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle>Search Files</CardTitle>
          <CardDescription>Find files by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="gradient-card shadow-modern card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatFileSize(file.size)}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={file.type.startsWith('image/') ? 'default' : 'secondary'}>
                  {file.type.startsWith('image/') ? 'Image' : 'File'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Preview */}
              {file.type.startsWith('image/') ? (
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <File className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {/* File Info */}
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {file.uploadedBy}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={file.url} download={file.name}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <Card className="gradient-card shadow-modern">
          <CardContent className="text-center py-12">
            <Folder className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No files found' : 'No files uploaded yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Upload your first file to get started.'
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold">{files.length}</p>
              </div>
              <File className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold">
                  {files.filter(f => f.type.startsWith('image/')).length}
                </p>
              </div>
              <Image className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold">
                  {files.filter(f => !f.type.startsWith('image/')).length}
                </p>
              </div>
              <File className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                </p>
              </div>
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
