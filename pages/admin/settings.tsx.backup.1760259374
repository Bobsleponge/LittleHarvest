import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  History, 
  Download, 
  Upload,
  Settings as SettingsIcon,
  Store,
  Truck,
  CreditCard,
  Bell,
  Shield,
  Server,
  Eye,
  EyeOff
} from 'lucide-react'

interface SettingValue {
  [key: string]: any
}

interface SettingsData {
  general?: SettingValue
  business?: SettingValue
  delivery?: SettingValue
  payment?: SettingValue
  notifications?: SettingValue
  security?: SettingValue
  system?: SettingValue
  [key: string]: SettingValue | undefined
}

interface SettingsHistory {
  id: string
  category: string
  key: string
  oldValue: string | null
  newValue: string
  changedBy: string | null
  changeReason: string | null
  createdAt: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<SettingsHistory[]>([])
  const [changeReason, setChangeReason] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const tabs = [
    { id: 'general', name: 'General', icon: Store, color: 'text-blue-600' },
    { id: 'business', name: 'Business', icon: SettingsIcon, color: 'text-green-600' },
    { id: 'delivery', name: 'Delivery', icon: Truck, color: 'text-orange-600' },
    { id: 'payment', name: 'Payment', icon: CreditCard, color: 'text-purple-600' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'text-yellow-600' },
    { id: 'security', name: 'Security', icon: Shield, color: 'text-red-600' },
    { id: 'system', name: 'System', icon: Server, color: 'text-gray-600' }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      console.log('Fetching settings...')
      const response = await fetch('/api/admin/settings')
      console.log('Settings API response:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('Settings API data:', data)
      
      if (data.success) {
        setSettings(data.settings)
        console.log('Settings loaded successfully:', Object.keys(data.settings))
      } else {
        const errorMsg = data.error || 'Failed to load settings'
        console.error('Settings API error:', errorMsg)
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to load settings'
      setError(`Network error: ${errorMsg}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/settings/history?limit=20')
      const data = await response.json()
      
      if (data.success) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleInputChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    if (!changeReason.trim()) {
      setError('Please provide a reason for the changes')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: activeTab,
          settings: settings[activeTab] || {},
          changeReason: changeReason.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Settings saved successfully!')
        setChangeReason('')
        
        // Show any errors for individual settings
        if (data.errors && data.errors.length > 0) {
          setError(`Some settings failed to save: ${data.errors.map((e: any) => e.key).join(', ')}`)
        }
        
        // Refresh settings to get updated values
        await fetchSettings()
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        setSettings(importedSettings)
        setSuccess('Settings imported successfully! Review and save to apply changes.')
      } catch (error) {
        setError('Invalid settings file format')
      }
    }
    reader.readAsText(file)
  }

  const renderSettingField = (category: string, key: string, value: any, type: string = 'text') => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const newValue = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value
      handleInputChange(category, key, newValue)
    }

    switch (type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={handleChange}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        )
      
      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleInputChange(category, key, parsed)
              } catch {
                handleInputChange(category, key, e.target.value)
              }
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        )
    }
  }

  const renderTabContent = () => {
    const currentSettings = settings[activeTab] || {}
    
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              {renderSettingField('general', 'storeName', currentSettings.storeName)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
              {renderSettingField('general', 'storeDescription', currentSettings.storeDescription, 'textarea')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                {renderSettingField('general', 'storeEmail', currentSettings.storeEmail)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                {renderSettingField('general', 'storePhone', currentSettings.storePhone)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
              {renderSettingField('general', 'storeAddress', currentSettings.storeAddress, 'textarea')}
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={currentSettings.currency || 'ZAR'}
                  onChange={(e) => handleInputChange('business', 'currency', e.target.value)}
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
                  value={currentSettings.timezone || 'Africa/Johannesburg'}
                  onChange={(e) => handleInputChange('business', 'timezone', e.target.value)}
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
                  value={currentSettings.language || 'en'}
                  onChange={(e) => handleInputChange('business', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="en">English</option>
                  <option value="af">Afrikaans</option>
                  <option value="zu">Zulu</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
              {renderSettingField('business', 'businessHours', currentSettings.businessHours, 'json')}
            </div>
          </div>
        )

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius (km)</label>
                {renderSettingField('delivery', 'deliveryRadius', currentSettings.deliveryRadius, 'number')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Delivery Threshold (R)</label>
                {renderSettingField('delivery', 'freeDeliveryThreshold', currentSettings.freeDeliveryThreshold, 'number')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (R)</label>
                {renderSettingField('delivery', 'deliveryFee', currentSettings.deliveryFee, 'number')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Same-Day Delivery</label>
                {renderSettingField('delivery', 'sameDayDelivery', currentSettings.sameDayDelivery, 'boolean')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time Slots</label>
              {renderSettingField('delivery', 'deliveryTimeSlots', currentSettings.deliveryTimeSlots, 'json')}
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Accept Cash on Delivery</label>
                {renderSettingField('payment', 'acceptCashOnDelivery', currentSettings.acceptCashOnDelivery, 'boolean')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Accept Card Payments</label>
                {renderSettingField('payment', 'acceptCardPayment', currentSettings.acceptCardPayment, 'boolean')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
              <select
                value={currentSettings.paymentGateway || 'stripe'}
                onChange={(e) => handleInputChange('payment', 'paymentGateway', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
              {renderSettingField('payment', 'paymentMethods', currentSettings.paymentMethods, 'json')}
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                {renderSettingField('notifications', 'emailNotifications', currentSettings.emailNotifications, 'boolean')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                {renderSettingField('notifications', 'smsNotifications', currentSettings.smsNotifications, 'boolean')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Order Confirmations</label>
                {renderSettingField('notifications', 'orderConfirmations', currentSettings.orderConfirmations, 'boolean')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Delivery Updates</label>
                {renderSettingField('notifications', 'deliveryUpdates', currentSettings.deliveryUpdates, 'boolean')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Marketing Emails</label>
                {renderSettingField('notifications', 'marketingEmails', currentSettings.marketingEmails, 'boolean')}
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                {renderSettingField('security', 'twoFactorAuth', currentSettings.twoFactorAuth, 'boolean')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                {renderSettingField('security', 'sessionTimeout', currentSettings.sessionTimeout, 'number')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                <select
                  value={currentSettings.passwordPolicy || 'strong'}
                  onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="basic">Basic</option>
                  <option value="strong">Strong</option>
                  <option value="very-strong">Very Strong</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                {renderSettingField('security', 'loginAttempts', currentSettings.loginAttempts, 'number')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                {renderSettingField('security', 'ipWhitelist', currentSettings.ipWhitelist, 'json')}
              </div>
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                {renderSettingField('system', 'maintenanceMode', currentSettings.maintenanceMode, 'boolean')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Debug Mode</label>
                {renderSettingField('system', 'debugMode', currentSettings.debugMode, 'boolean')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
              <select
                value={currentSettings.logLevel || 'info'}
                onChange={(e) => handleInputChange('system', 'logLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={currentSettings.backupFrequency || 'daily'}
                onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        )

      default:
        return <div>Select a category to view settings</div>
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-gray-600">Loading settings...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your store configuration and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchSettings}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportSettings}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-semibold">Error Loading Settings</span>
            </div>
            <p className="text-red-700 mb-2">{error}</p>
            <div className="text-sm text-red-600">
              <p>Possible solutions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Make sure you're logged in as an admin user</li>
                <li>Check if the development server is running</li>
                <li>Verify database connection</li>
              </ul>
              <div className="mt-2">
                <Link href="/settings-debug" className="text-red-600 hover:text-red-700 underline">
                  Open Debug Page →
                </Link>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-emerald-600' : tab.color}`} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
              
              {/* Advanced Options */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100"
                >
                  <History className="h-5 w-5" />
                  <span className="font-medium">Change History</span>
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100"
                >
                  {showAdvanced ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="font-medium">Advanced</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.name} Settings
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date().toLocaleString()}</span>
                </div>
              </div>

              {renderTabContent()}

              {/* Change Reason */}
              <div className="mt-8 pt-6 border-t">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Changes *
                  </label>
                  <textarea
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Describe why you're making these changes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving || !changeReason.trim()}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Change History */}
            {showHistory && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((change) => (
                      <div key={change.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {change.category}.{change.key}
                          </div>
                          <div className="text-sm text-gray-600">
                            {change.changeReason || 'No reason provided'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(change.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent changes</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}