import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: string
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Products', href: '/admin/products', icon: '🍎' },
  { name: 'Orders', href: '/admin/orders', icon: '📦' },
  { name: 'Customers', href: '/admin/customers', icon: '👥' },
  { name: 'Inventory', href: '/admin/inventory', icon: '📋' },
  { name: 'Media', href: '/admin/media', icon: '🖼️' },
  { name: 'Content', href: '/admin/content', icon: '📄' },
  { name: 'Notifications', href: '/admin/notifications', icon: '🔔', badge: '2' },
  { name: 'Database', href: '/admin/database', icon: '🗄️' },
  { name: 'Security', href: '/admin/security', icon: '🔒' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TT</span>
              </div>
              <span className="font-bold text-lg text-gray-800">Tiny Tastes</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 border-r-2 border-emerald-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@tinytastes.co.za</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/"
                className="flex-1 text-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Site
              </Link>
              <Link
                href="/dev-login"
                className="flex-1 text-center px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <span className="text-xl">☰</span>
            </button>
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">TT</span>
              </div>
              <span className="font-bold text-gray-800">Tiny Tastes Admin</span>
            </Link>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

