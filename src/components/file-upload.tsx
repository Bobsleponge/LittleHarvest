'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface FileUploadProps {
  onFileSelect: (fileUrl: string) => void
  currentImageUrl?: string
  disabled?: boolean
}

export function FileUpload({ onFileSelect, currentImageUrl, disabled }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.')
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      onFileSelect(data.fileUrl)
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onFileSelect('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleClick}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted p-3">
                {uploading ? (
                  <Upload className="h-6 w-6 animate-pulse" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
