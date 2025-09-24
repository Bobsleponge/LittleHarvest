'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'

export function AdminHeader() {
  const { data: session } = useSession()
  const [notifications] = useState(3) // Mock notification count

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Quick Actions */}
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Quick Settings
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {session?.user?.name || 'Admin User'}
              </div>
              <div className="text-xs text-gray-500">
                {session?.user?.email}
              </div>
            </div>
            <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
