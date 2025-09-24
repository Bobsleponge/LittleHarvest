'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Plus, Settings } from 'lucide-react'

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage system notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="gradient-card shadow-modern">
        <CardContent className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Notification Center</h3>
          <p className="text-gray-500 mb-4">
            This section will allow you to send notifications to users and manage notification templates.
          </p>
          <p className="text-sm text-gray-400">
            Coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
