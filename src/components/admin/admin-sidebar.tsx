'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  FileText,
  Upload,
  Database,
  Shield,
  Bell,
  LogOut,
  Search,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    description: 'Manage product catalog'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Order management'
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    description: 'Customer management'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Sales and performance'
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
    description: 'Pages and content'
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: Upload,
    description: 'File and image management'
  },
  {
    name: 'Database',
    href: '/admin/database',
    icon: Database,
    description: 'Database management'
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security and access'
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'System notifications'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [notifications] = useState(3) // Mock notification count

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">Tiny Tastes</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* User Profile & Notifications */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </div>
              </div>
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    'text-xs transition-colors',
                    isActive ? 'text-primary-foreground/80' : 'text-gray-500 group-hover:text-gray-600'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => window.open('/', '_blank')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              View Store
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
