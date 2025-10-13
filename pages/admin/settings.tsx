import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/admin-layout'
import ErrorBoundary from '../../src/components/ErrorBoundary'
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
  UserCheck,
  Lock,
  Users,
  AlertTriangle,
  FileText,
  Trash2,
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
  const [message, setMessage] = useState<string | null>(null)
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

  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
    fetchCSRFToken()
  }, [])

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token')
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.csrfToken)
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error)
    }
  }

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
        console.log('System settings:', data.settings.system)
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

      // Use cached CSRF token or fetch a new one
      let token = csrfToken
      if (!token) {
        const csrfResponse = await fetch('/api/csrf-token')
        if (!csrfResponse.ok) {
          throw new Error('Failed to get CSRF token')
        }
        const data = await csrfResponse.json()
        token = data.csrfToken
        setCsrfToken(token)
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token!
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

  const handleManualBackup = async (type: 'database' | 'files' | 'full') => {
    try {
      setLoading(true)
      setError(null)
      
      // Use cached CSRF token or fetch a new one
      let token = csrfToken
      if (!token) {
        const csrfResponse = await fetch('/api/csrf-token')
        if (!csrfResponse.ok) {
          throw new Error('Failed to get CSRF token')
        }
        const data = await csrfResponse.json()
        token = data.csrfToken
        setCsrfToken(token)
      }
      
      const response = await fetch('/api/admin/settings/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token!
        },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Backup ${type} completed successfully. ${result.downloadUrl ? 'Download available.' : ''}`)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        const error = await response.json()
        setError(error.error || 'Backup failed')
      }
    } catch (err) {
      setError('Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemAction = async (action: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Confirm dangerous actions
      if (['resetSettings', 'clearLogs'].includes(action)) {
        const confirmed = window.confirm(`Are you sure you want to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}? This action cannot be undone.`)
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/admin/settings/system-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`System action '${action}' completed successfully. ${result.message || ''}`)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        const error = await response.json()
        setError(error.error || 'System action failed')
      }
    } catch (err) {
      setError('Failed to execute system action')
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityAction = async (action: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Confirm dangerous actions
      if (['lockAllAccounts', 'purgeOldData'].includes(action)) {
        const confirmed = window.confirm(`Are you sure you want to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}? This action cannot be undone.`)
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      // Use cached CSRF token or fetch a new one
      let token = csrfToken
      if (!token) {
        const csrfResponse = await fetch('/api/csrf-token')
        if (!csrfResponse.ok) {
          throw new Error('Failed to get CSRF token')
        }
        const data = await csrfResponse.json()
        token = data.csrfToken
        setCsrfToken(token)
      }

      const response = await fetch('/api/admin/settings/security-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token!
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Security action '${action}' completed successfully. ${result.message || ''}`)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        const error = await response.json()
        setError(error.error || 'Security action failed')
      }
    } catch (err) {
      setError('Failed to execute security action')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationAction = async (action: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Confirm bulk actions
      if (['enableAllNotifications', 'disableMarketing'].includes(action)) {
        const confirmed = window.confirm(`Are you sure you want to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}?`)
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      // Use cached CSRF token or fetch a new one
      let token = csrfToken
      if (!token) {
        const csrfResponse = await fetch('/api/csrf-token')
        if (!csrfResponse.ok) {
          throw new Error('Failed to get CSRF token')
        }
        const data = await csrfResponse.json()
        token = data.csrfToken
        setCsrfToken(token)
      }

      const response = await fetch('/api/admin/settings/notification-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token!
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Notification action '${action}' completed successfully. ${result.message || ''}`)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        const error = await response.json()
        setError(error.error || 'Notification action failed')
      }
    } catch (err) {
      setError('Failed to execute notification action')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAction = async (action: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Use cached CSRF token or fetch a new one
      let token = csrfToken
      if (!token) {
        const csrfResponse = await fetch('/api/csrf-token')
        if (!csrfResponse.ok) {
          throw new Error('Failed to get CSRF token')
        }
        const data = await csrfResponse.json()
        token = data.csrfToken
        setCsrfToken(token)
      }

      const response = await fetch('/api/admin/settings/payment-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token!
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Payment action '${action}' completed successfully. ${result.message || ''}`)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        const error = await response.json()
        setError(error.error || 'Payment action failed')
      }
    } catch (err) {
      setError('Failed to execute payment action')
    } finally {
      setLoading(false)
    }
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
            <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
          </label>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
              {renderSettingField('general', 'storeName', currentSettings.storeName)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Description</label>
              {renderSettingField('general', 'storeDescription', currentSettings.storeDescription, 'textarea')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Email</label>
                {renderSettingField('general', 'storeEmail', currentSettings.storeEmail)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Phone</label>
                {renderSettingField('general', 'storePhone', currentSettings.storePhone)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Address</label>
              {renderSettingField('general', 'storeAddress', currentSettings.storeAddress, 'textarea')}
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                <select
                  value={currentSettings.currency || 'ZAR'}
                  onChange={(e) => handleInputChange('business', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="ZAR">ZAR (South African Rand)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                <select
                  value={currentSettings.timezone || 'Africa/Johannesburg'}
                  onChange={(e) => handleInputChange('business', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                  <option value="Africa/Cape_Town">Africa/Cape_Town</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                <select
                  value={currentSettings.language || 'en'}
                  onChange={(e) => handleInputChange('business', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="en">English</option>
                  <option value="af">Afrikaans</option>
                  <option value="zu">Zulu</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Hours</label>
              {renderSettingField('business', 'businessHours', currentSettings.businessHours, 'json')}
            </div>
          </div>
        )

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Radius (km)</label>
                {renderSettingField('delivery', 'deliveryRadius', currentSettings.deliveryRadius, 'number')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Free Delivery Threshold (R)</label>
                {renderSettingField('delivery', 'freeDeliveryThreshold', currentSettings.freeDeliveryThreshold, 'number')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Fee (R)</label>
                {renderSettingField('delivery', 'deliveryFee', currentSettings.deliveryFee, 'number')}
              </div>
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">Same-Day Delivery</label>
                {renderSettingField('delivery', 'sameDayDelivery', currentSettings.sameDayDelivery, 'boolean')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Time Slots</label>
              {renderSettingField('delivery', 'deliveryTimeSlots', currentSettings.deliveryTimeSlots, 'json')}
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-8">
            {/* Payment Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Payment Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Card Payments</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{currentSettings.acceptCardPayment ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    {currentSettings.acceptCardPayment ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Cash on Delivery</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{currentSettings.acceptCashOnDelivery ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    {currentSettings.acceptCashOnDelivery ? (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Payment Gateway</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 capitalize">{currentSettings.paymentGateway || 'Not Set'}</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Peach Payments</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">{currentSettings.paymentGateway === 'peach' ? 'Active' : 'Not Configured'}</p>
                    </div>
                    {currentSettings.paymentGateway === 'peach' ? (
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Methods</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Card Payments</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Accept credit and debit card payments</p>
              </div>
                  </div>
                {renderSettingField('payment', 'acceptCardPayment', currentSettings.acceptCardPayment, 'boolean')}
              </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Cash on Delivery</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Accept cash payments upon delivery</p>
            </div>
                  </div>
                  {renderSettingField('payment', 'acceptCashOnDelivery', currentSettings.acceptCashOnDelivery, 'boolean')}
                </div>
              </div>
            </div>

            {/* Payment Gateway Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Gateway</h3>
              <div className="space-y-4">
            <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Payment Gateway</label>
              <select
                value={currentSettings.paymentGateway || 'stripe'}
                onChange={(e) => handleInputChange('payment', 'paymentGateway', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                    <option value="peach">Peach Payments (Recommended)</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="square">Square</option>
                    <option value="payfast">PayFast</option>
              </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Peach Payments is the recommended gateway for South African businesses
                  </p>
            </div>

                {/* Peach Payments Configuration */}
                {currentSettings.paymentGateway === 'peach' && (
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3">Peach Payments Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Merchant ID</label>
                        {renderSettingField('payment', 'peachMerchantId', currentSettings.peachMerchantId, 'text')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                        {renderSettingField('payment', 'peachApiKey', currentSettings.peachApiKey, 'password')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Environment</label>
                        <select
                          value={currentSettings.peachEnvironment || 'sandbox'}
                          onChange={(e) => handleInputChange('payment', 'peachEnvironment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Webhook Secret</label>
                        {renderSettingField('payment', 'peachWebhookSecret', currentSettings.peachWebhookSecret, 'password')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stripe Configuration */}
                {currentSettings.paymentGateway === 'stripe' && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Stripe Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publishable Key</label>
                        {renderSettingField('payment', 'stripePublishableKey', currentSettings.stripePublishableKey, 'text')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secret Key</label>
                        {renderSettingField('payment', 'stripeSecretKey', currentSettings.stripeSecretKey, 'password')}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Webhook Secret</label>
                        {renderSettingField('payment', 'stripeWebhookSecret', currentSettings.stripeWebhookSecret, 'password')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Order Amount (R)</label>
                  {renderSettingField('payment', 'minimumOrderAmount', currentSettings.minimumOrderAmount, 'number')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Timeout (minutes)</label>
                  {renderSettingField('payment', 'paymentTimeout', currentSettings.paymentTimeout, 'number')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auto-capture Payments</label>
                  {renderSettingField('payment', 'autoCapture', currentSettings.autoCapture, 'boolean')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Require CVV</label>
                  {renderSettingField('payment', 'requireCvv', currentSettings.requireCvv, 'boolean')}
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => handlePaymentAction('testConnection')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Test Connection</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('testPayment')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Test Payment</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('syncWebhooks')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Sync Webhooks</span>
                </button>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-8">
            {/* Notification Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Notification Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Email Service</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{currentSettings.emailNotifications ? 'Active' : 'Disabled'}</p>
                    </div>
                    {currentSettings.emailNotifications ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">SMS Service</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{currentSettings.smsNotifications ? 'Active' : 'Disabled'}</p>
                    </div>
                    {currentSettings.smsNotifications ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Order Alerts</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{currentSettings.orderConfirmations ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    {currentSettings.orderConfirmations ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Marketing</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">{currentSettings.marketingEmails ? 'Active' : 'Disabled'}</p>
                    </div>
                    {currentSettings.marketingEmails ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-green-600" />
                Email Notifications
              </h3>
              
          <div className="space-y-6">
                {/* Email Service */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enable email notifications for orders, deliveries, and system alerts. Requires email service configuration.
                    </p>
                  </div>
                  <div className="ml-4">
                {renderSettingField('notifications', 'emailNotifications', currentSettings.emailNotifications, 'boolean')}
              </div>
              </div>

                {/* Order Confirmations */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Order Confirmations
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Send automatic email confirmations when customers place orders. Includes order details and estimated delivery.
                    </p>
                  </div>
                  <div className="ml-4">
                {renderSettingField('notifications', 'orderConfirmations', currentSettings.orderConfirmations, 'boolean')}
              </div>
                </div>

                {/* Delivery Updates */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Delivery Updates
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Send email updates when order status changes (preparing, shipped, delivered). Keeps customers informed.
                    </p>
                  </div>
                  <div className="ml-4">
                {renderSettingField('notifications', 'deliveryUpdates', currentSettings.deliveryUpdates, 'boolean')}
              </div>
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Marketing Emails
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Send promotional emails, newsletters, and special offers. Respects customer preferences and unsubscribe requests.
                    </p>
                  </div>
                  <div className="ml-4">
                {renderSettingField('notifications', 'marketingEmails', currentSettings.marketingEmails, 'boolean')}
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                SMS Notifications
              </h3>
              
              <div className="space-y-6">
                {/* SMS Service */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SMS Notifications
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enable SMS notifications for urgent updates like delivery confirmations. Requires SMS service provider setup.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'smsNotifications', currentSettings.smsNotifications, 'boolean')}
                  </div>
                </div>

                {/* SMS Delivery Updates */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SMS Delivery Alerts
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Send SMS when orders are delivered or if there are delivery issues. High-priority notifications only.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'smsDeliveryAlerts', currentSettings.smsDeliveryAlerts, 'boolean')}
                  </div>
                </div>

                {/* SMS Order Confirmations */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      SMS Order Confirmations
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Send SMS confirmation for high-value orders or urgent deliveries. Use sparingly to avoid spam.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'smsOrderConfirmations', currentSettings.smsOrderConfirmations, 'boolean')}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Admin Notifications
              </h3>
              
              <div className="space-y-6">
                {/* New Order Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Order Alerts
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Receive immediate notifications when new orders are placed. Helps with quick order processing.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'newOrderAlerts', currentSettings.newOrderAlerts, 'boolean')}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Low Stock Alerts
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get notified when product inventory falls below threshold levels. Prevents stockouts.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'lowStockAlerts', currentSettings.lowStockAlerts, 'boolean')}
                  </div>
                </div>

                {/* Payment Issues */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Issue Alerts
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Receive alerts for failed payments, refunds, or payment processing errors. Critical for business operations.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'paymentIssueAlerts', currentSettings.paymentIssueAlerts, 'boolean')}
                  </div>
                </div>

                {/* System Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      System Alerts
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get notified about system issues, maintenance windows, or security events. Essential for system monitoring.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('notifications', 'systemAlerts', currentSettings.systemAlerts, 'boolean')}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                Notification Actions
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleNotificationAction('testEmail')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Test Email Service
                  </button>
                  <button
                    onClick={() => handleNotificationAction('testSMS')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Test SMS Service
                  </button>
                  <button
                    onClick={() => handleNotificationAction('sendTestNotification')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Test Notification
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">Bulk Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleNotificationAction('enableAllNotifications')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enable All Notifications
                    </button>
                    <button
                      onClick={() => handleNotificationAction('disableMarketing')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Disable Marketing Only
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-8">
            {/* Security Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Security Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Rate Limiting</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Always Active</p>
              </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
              <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">CSRF Protection</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Enabled</p>
              </div>
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
              <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">2FA Status</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">{currentSettings.require2FA ? 'Enabled' : 'Optional'}</p>
                    </div>
                    {currentSettings.require2FA ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Password Policy</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 capitalize">{currentSettings.passwordPolicy || 'strong'}</p>
                    </div>
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* User Authentication Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                User Authentication
              </h3>
              
              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Two-Factor Authentication
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Require users to use 2FA for enhanced account security. Users will need to set up authenticator apps.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('security', 'require2FA', currentSettings.require2FA, 'boolean')}
                  </div>
                </div>

                {/* Password Policy */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Policy Strength
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Set the minimum password requirements for user accounts. Stronger policies improve security but may frustrate users.
                  </p>
                <select
                  value={currentSettings.passwordPolicy || 'strong'}
                  onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="basic">Basic - 6+ characters</option>
                    <option value="strong">Strong - 8+ chars, numbers, symbols</option>
                    <option value="very-strong">Very Strong - 12+ chars, mixed case, numbers, symbols</option>
                </select>
                  
                  {/* Detailed Password Requirements */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Length</span>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={currentSettings.passwordMinLength || 8}
                        onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
              </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Require Special Characters</span>
                      {renderSettingField('security', 'passwordRequireSpecial', currentSettings.passwordRequireSpecial, 'boolean')}
              </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Require Numbers</span>
                      {renderSettingField('security', 'passwordRequireNumbers', currentSettings.passwordRequireNumbers, 'boolean')}
                    </div>
                  </div>
                </div>

                {/* Session Management */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Session Timeout (minutes)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    How long users stay logged in before being automatically logged out for security. Shorter times improve security.
                  </p>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={currentSettings.sessionTimeout || 60}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
              </div>

                {/* Login Attempts */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Login Attempts
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Number of failed login attempts before temporarily locking an account to prevent brute force attacks.
                  </p>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={currentSettings.loginAttempts || 5}
                    onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-green-600" />
                Data Protection
              </h3>
              
              <div className="space-y-6">
                {/* Data Encryption */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Data Encryption at Rest
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Encrypt sensitive data stored in the database. This protects customer information even if the database is compromised.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('security', 'dataEncryption', currentSettings.dataEncryption, 'boolean')}
                  </div>
                </div>

                {/* Data Retention */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Retention Period (days)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    How long to keep user data before automatic deletion. Longer periods help with analytics but increase privacy risk.
                  </p>
                  <input
                    type="number"
                    min="30"
                    max="2555"
                    value={currentSettings.dataRetentionDays || 365}
                    onChange={(e) => handleInputChange('security', 'dataRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Audit Logging */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Security Audit Logging
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Log all security-related events including login attempts, permission changes, and data access.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('security', 'auditLogging', currentSettings.auditLogging, 'boolean')}
                  </div>
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Access Control
              </h3>
              
              <div className="space-y-6">
                {/* User Registration */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allow User Registration
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Allow new users to create accounts. Disable to make the platform invitation-only.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('security', 'allowRegistration', currentSettings.allowRegistration, 'boolean')}
                  </div>
                </div>

                {/* Email Verification */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Email Verification
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Require users to verify their email address before accessing the platform.
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingField('security', 'requireEmailVerification', currentSettings.requireEmailVerification, 'boolean')}
                  </div>
                </div>

                {/* IP Restrictions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User IP Restrictions
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Restrict user access to specific IP addresses or ranges. Leave empty to allow all IPs.
                  </p>
                  <textarea
                    value={currentSettings.userIpWhitelist || ''}
                    onChange={(e) => handleInputChange('security', 'userIpWhitelist', e.target.value)}
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;203.0.113.0/24"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-20"
                  />
                </div>

                {/* Admin IP Whitelist */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin IP Whitelist
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Restrict admin access to specific IP addresses. Leave empty to allow all IPs (not recommended for production).
                  </p>
                  <textarea
                    value={currentSettings.adminIpWhitelist || ''}
                    onChange={(e) => handleInputChange('security', 'adminIpWhitelist', e.target.value)}
                    placeholder="192.168.1.100&#10;10.0.0.50&#10;203.0.113.0/24"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-20"
                  />
                </div>
              </div>
            </div>

            {/* Security Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Security Actions
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSecurityAction('forcePasswordReset')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Password Reset
                  </button>
                  <button
                    onClick={() => handleSecurityAction('clearFailedLogins')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Clear Failed Logins
                  </button>
                  <button
                    onClick={() => handleSecurityAction('generateSecurityReport')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Security Report
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleSecurityAction('lockAllAccounts')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Lock All User Accounts
                    </button>
                    <button
                      onClick={() => handleSecurityAction('purgeOldData')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Purge Old Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-8">
            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-600" />
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Database</p>
                      <p className="text-xs text-green-600 dark:text-green-400">PostgreSQL Connected</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">API Status</p>
                      <p className="text-xs text-green-600 dark:text-green-400">All Endpoints Active</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Email Service</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Configuration Required</p>
                    </div>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2 text-gray-600" />
                System Configuration
              </h3>
              
          <div className="space-y-6">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maintenance Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Temporarily disable public access to the site for maintenance. Only admin users can access during maintenance.
                    </p>
                  </div>
                  <div className="ml-4">
                {renderSettingField('system', 'maintenanceMode', currentSettings.maintenanceMode, 'boolean')}
              </div>
                </div>

                {/* Debug Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Debug Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enable detailed error logging and debugging information. Disable in production for security.
                    </p>
                  </div>
                  <div className="ml-4">
                {renderSettingField('system', 'debugMode', currentSettings.debugMode, 'boolean')}
              </div>
            </div>

                {/* Log Level */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Log Level
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Set the minimum level of log messages to record. Higher levels include lower levels (Error includes all, Debug includes everything).
                  </p>
              <select
                value={currentSettings.logLevel || 'info'}
                onChange={(e) => handleInputChange('system', 'logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="error">Error - Critical errors only</option>
                    <option value="warn">Warning - Warnings and errors</option>
                    <option value="info">Info - General information (recommended)</option>
                    <option value="debug">Debug - Detailed debugging information</option>
              </select>
            </div>

                {/* Session Timeout */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    How long users stay logged in before being automatically logged out for security.
                  </p>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={currentSettings.sessionTimeout || 60}
                    onChange={(e) => handleInputChange('system', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Rate Limiting */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-green-800 dark:text-green-200">
                        Rate Limiting
                      </label>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        <strong>Always enabled for security.</strong> Protects against DDoS attacks, API abuse, and brute force attempts. This setting cannot be disabled in production.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Always On</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Recovery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Download className="h-5 w-5 mr-2 text-purple-600" />
                Backup & Recovery
              </h3>
              
              <div className="space-y-6">
                {/* Backup Frequency */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Automatic Backup Frequency
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    How often to automatically backup your database and files. More frequent backups provide better data protection.
                  </p>
              <select
                value={currentSettings.backupFrequency || 'daily'}
                onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="hourly">Hourly - Maximum protection</option>
                    <option value="daily">Daily - Recommended</option>
                    <option value="weekly">Weekly - Minimal protection</option>
                    <option value="monthly">Monthly - Basic protection</option>
                    <option value="disabled">Disabled - Manual only</option>
              </select>
                </div>

                {/* Backup Retention */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Backup Retention (days)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    How long to keep backup files before automatically deleting them to save storage space.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={currentSettings.backupRetention || 30}
                    onChange={(e) => handleInputChange('system', 'backupRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Manual Backup Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Backup Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleManualBackup('database')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup Database
                    </button>
                    <button
                      onClick={() => handleManualBackup('files')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup Files
                    </button>
                    <button
                      onClick={() => handleManualBackup('full')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Full Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-orange-600" />
                Performance Settings
              </h3>
              
              <div className="space-y-6">
                {/* Cache Settings */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cache Duration (minutes)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    How long to cache API responses and static content. Higher values improve performance but may show stale data.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={currentSettings.cacheDuration || 15}
                    onChange={(e) => handleInputChange('system', 'cacheDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Database Connection Pool */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Database Connection Pool Size
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Number of concurrent database connections. Higher values improve performance but use more memory.
                  </p>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={currentSettings.dbPoolSize || 10}
                    onChange={(e) => handleInputChange('system', 'dbPoolSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* File Upload Limits */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max File Upload Size (MB)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Maximum size for file uploads (images, documents). Larger files take more time to upload and process.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={currentSettings.maxFileSize || 10}
                    onChange={(e) => handleInputChange('system', 'maxFileSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* System Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                System Actions
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSystemAction('clearCache')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </button>
                  <button
                    onClick={() => handleSystemAction('restartServices')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Services
                  </button>
                  <button
                    onClick={() => handleSystemAction('healthCheck')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Health Check
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleSystemAction('resetSettings')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reset All Settings
                    </button>
                    <button
                      onClick={() => handleSystemAction('clearLogs')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Clear All Logs
                    </button>
                  </div>
                </div>
              </div>
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
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading settings...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <ErrorBoundary>
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/admin" className="hover:text-gray-800 dark:hover:text-gray-200">Admin</Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-gray-100">Settings</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your store configuration and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchSettings}
                disabled={refreshing}
                aria-label="Refresh settings data"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportSettings}
                aria-label="Export settings to JSON file"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  aria-label="Import settings from JSON file"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      aria-pressed={activeTab === tab.id}
                      aria-label={`Switch to ${tab.name} settings`}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : tab.color}`} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
              
              {/* Advanced Options */}
              <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <History className="h-5 w-5" />
                  <span className="font-medium">Change History</span>
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showAdvanced ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="font-medium">Advanced</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {tabs.find(t => t.id === activeTab)?.name} Settings
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {new Date().toLocaleString()}</span>
                </div>
              </div>

              {renderTabContent()}

              {/* Change Reason */}
              <div className="mt-8 pt-6 border-t dark:border-gray-700">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Changes *
                  </label>
                  <textarea
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Describe why you're making these changes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving || !changeReason.trim()}
                    aria-label={saving ? "Saving settings..." : "Save settings changes"}
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
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Changes</h3>
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((change) => (
                      <div key={change.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {change.category}.{change.key}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {change.changeReason || 'No reason provided'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(change.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent changes</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
    </ErrorBoundary>
  )
}