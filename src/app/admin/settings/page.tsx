'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Save,
  RefreshCw,
  Mail,
  Globe,
  Shield,
  Bell,
  Database,
  Palette
} from 'lucide-react'
import { LoadingPage } from '@/components/ui/loading'

interface SettingsData {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    adminEmail: string
    timezone: string
  }
  notifications: {
    emailNotifications: boolean
    orderNotifications: boolean
    customerNotifications: boolean
    systemAlerts: boolean
  }
  security: {
    requireEmailVerification: boolean
    allowRegistration: boolean
    sessionTimeout: number
    maxLoginAttempts: number
  }
  appearance: {
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    faviconUrl: string
  }
  database: {
    backupFrequency: string
    autoBackup: boolean
    retentionDays: number
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Mock settings data
      const mockSettings: SettingsData = {
        general: {
          siteName: 'Tiny Tastes',
          siteDescription: 'Fresh Baby Food Made with Love',
          siteUrl: 'https://tinytastes.co.za',
          adminEmail: 'admin@tinytastes.co.za',
          timezone: 'Africa/Johannesburg'
        },
        notifications: {
          emailNotifications: true,
          orderNotifications: true,
          customerNotifications: true,
          systemAlerts: true
        },
        security: {
          requireEmailVerification: true,
          allowRegistration: true,
          sessionTimeout: 24,
          maxLoginAttempts: 5
        },
        appearance: {
          primaryColor: '#10b981',
          secondaryColor: '#059669',
          logoUrl: '/logo.png',
          faviconUrl: '/favicon.ico'
        },
        database: {
          backupFrequency: 'daily',
          autoBackup: true,
          retentionDays: 30
        }
      }
      
      setSettings(mockSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      // Mock save - in real implementation, you'd call an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    })
  }

  if (loading) {
    return <LoadingPage />
  }

  if (!settings) {
    return <div>Failed to load settings</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure your application settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            General Settings
          </CardTitle>
          <CardDescription>Basic site configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.general.siteName}
                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={settings.general.siteUrl}
                onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.general.siteDescription}
              onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.general.adminEmail}
                onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={settings.general.timezone}
                onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Send email notifications for important events</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="orderNotifications">Order Notifications</Label>
              <p className="text-sm text-gray-500">Notify when new orders are placed</p>
            </div>
            <Switch
              id="orderNotifications"
              checked={settings.notifications.orderNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'orderNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="customerNotifications">Customer Notifications</Label>
              <p className="text-sm text-gray-500">Notify when customers register or update profiles</p>
            </div>
            <Switch
              id="customerNotifications"
              checked={settings.notifications.customerNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'customerNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="systemAlerts">System Alerts</Label>
              <p className="text-sm text-gray-500">Receive alerts for system issues and maintenance</p>
            </div>
            <Switch
              id="systemAlerts"
              checked={settings.notifications.systemAlerts}
              onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
          <CardDescription>Configure security and access controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <p className="text-sm text-gray-500">Users must verify their email before accessing the site</p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.security.requireEmailVerification}
              onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowRegistration">Allow Registration</Label>
              <p className="text-sm text-gray-500">Allow new users to register accounts</p>
            </div>
            <Switch
              id="allowRegistration"
              checked={settings.security.allowRegistration}
              onCheckedChange={(checked) => updateSetting('security', 'allowRegistration', checked)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Appearance Settings
          </CardTitle>
          <CardDescription>Customize the look and feel of your site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.appearance.primaryColor}
                  onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.appearance.primaryColor}
                  onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.appearance.secondaryColor}
                  onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.appearance.secondaryColor}
                  onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={settings.appearance.logoUrl}
                onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={settings.appearance.faviconUrl}
                onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card className="gradient-card shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Settings
          </CardTitle>
          <CardDescription>Configure database backup and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">Automatic Backups</Label>
              <p className="text-sm text-gray-500">Automatically backup the database</p>
            </div>
            <Switch
              id="autoBackup"
              checked={settings.database.autoBackup}
              onCheckedChange={(checked) => updateSetting('database', 'autoBackup', checked)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.database.backupFrequency}
                onChange={(e) => updateSetting('database', 'backupFrequency', e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention Days</Label>
              <Input
                id="retentionDays"
                type="number"
                value={settings.database.retentionDays}
                onChange={(e) => updateSetting('database', 'retentionDays', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
