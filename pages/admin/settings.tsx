import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: 'Tiny Tastes',
    storeDescription: 'Fresh, organic baby food delivered to your door',
    storeEmail: 'hello@tinytastes.co.za',
    storePhone: '+27 21 123 4567',
    storeAddress: '123 Main Street, Cape Town, 8001',
    
    // Business Settings
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    language: 'en',
    
    // Delivery Settings
    deliveryRadius: 50,
    freeDeliveryThreshold: 200,
    deliveryFee: 25,
    sameDayDelivery: true,
    
    // Payment Settings
    acceptCashOnDelivery: true,
    acceptCardPayment: true,
    paymentGateway: 'stripe',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderConfirmations: true,
    deliveryUpdates: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'strong'
  })

  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'business', name: 'Business', icon: '🏢' },
    { id: 'delivery', name: 'Delivery', icon: '🚚' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ]

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-800">Admin</Link>
            <span>›</span>
            <span className="text-gray-900">Settings</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your store configuration and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                      <input
                        type="text"
                        name="storeName"
                        value={settings.storeName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                      <textarea
                        name="storeDescription"
                        value={settings.storeDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                        <input
                          type="email"
                          name="storeEmail"
                          value={settings.storeEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                        <input
                          type="tel"
                          name="storePhone"
                          value={settings.storePhone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                      <textarea
                        name="storeAddress"
                        value={settings.storeAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
    </AdminLayout>
  )
}

              {/* Business Settings */}
              {activeTab === 'business' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Settings</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          name="currency"
                          value={settings.currency}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="ZAR">ZAR (South African Rand)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          name="timezone"
                          value={settings.timezone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                          <option value="Africa/Cape_Town">Africa/Cape_Town</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          name="language"
                          value={settings.language}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="en">English</option>
                          <option value="af">Afrikaans</option>
                          <option value="zu">Zulu</option>
                        </select>
                      </div>
                    </div>
    </AdminLayout>
  )
}

              {/* Delivery Settings */}
              {activeTab === 'delivery' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Settings</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius (km)</label>
                        <input
                          type="number"
                          name="deliveryRadius"
                          value={settings.deliveryRadius}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Free Delivery Threshold (R)</label>
                        <input
                          type="number"
                          name="freeDeliveryThreshold"
                          value={settings.freeDeliveryThreshold}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (R)</label>
                        <input
                          type="number"
                          name="deliveryFee"
                          value={settings.deliveryFee}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="sameDayDelivery"
                          checked={settings.sameDayDelivery}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Enable Same-Day Delivery</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="acceptCashOnDelivery"
                          checked={settings.acceptCashOnDelivery}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Accept Cash on Delivery</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="acceptCardPayment"
                          checked={settings.acceptCardPayment}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Accept Card Payments</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                      <select
                        name="paymentGateway"
                        value={settings.paymentGateway}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="payfast">PayFast</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={settings.smsNotifications}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="orderConfirmations"
                          checked={settings.orderConfirmations}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Order Confirmations</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="deliveryUpdates"
                          checked={settings.deliveryUpdates}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Delivery Updates</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="twoFactorAuth"
                          checked={settings.twoFactorAuth}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          name="sessionTimeout"
                          value={settings.sessionTimeout}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                        <select
                          name="passwordPolicy"
                          value={settings.passwordPolicy}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="basic">Basic</option>
                          <option value="strong">Strong</option>
                          <option value="very-strong">Very Strong</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
