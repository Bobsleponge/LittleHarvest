'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage pages and content</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </Button>
      </div>

      {/* Coming Soon */}
      <Card className="gradient-card shadow-modern">
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Content Management</h3>
          <p className="text-gray-500 mb-4">
            This section will allow you to manage static pages, blog posts, and other content.
          </p>
          <p className="text-sm text-gray-400">
            Coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
