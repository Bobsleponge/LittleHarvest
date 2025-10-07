'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Save, 
  Edit3, 
  Shield,
  Package,
  Calendar,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { LoadingPage } from '@/components/ui/loading'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  profile?: {
    id: string
    firstName: string
    lastName: string
    addresses: Array<{
      id: string
      type: string
      street: string
      city: string
      province: string
      postalCode: string
      country: string
      isDefault: boolean
    }>
  }
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dev-login')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          street: data.profile?.addresses?.[0]?.street || '',
          city: data.profile?.addresses?.[0]?.city || '',
          province: data.profile?.addresses?.[0]?.province || '',
          postalCode: data.profile?.addresses?.[0]?.postalCode || '',
          country: data.profile?.addresses?.[0]?.country || 'South Africa'
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfile()
        setEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingPage />
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-modern-lg pulse-glow">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-gradient drop-shadow-lg">
              Account Settings
            </h1>
            <p className="text-readable-white text-xl font-light">
              Manage your profile and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="glass border-0 shadow-modern-xl card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-readable-white text-2xl">Profile Information</CardTitle>
                  <CardDescription className="text-readable-white">Update your personal details</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(!editing)}
                  className="glass border-white/20 text-readable-white hover:text-gray-800 hover:bg-white/10 btn-modern shadow-modern"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-readable-white">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editing}
                    className="glass border-white/20 text-readable-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-readable-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                    className="glass border-white/20 text-readable-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-readable-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Default Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-readable-white">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      disabled={!editing}
                      className="glass border-white/20 text-readable-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-readable-white">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!editing}
                      className="glass border-white/20 text-readable-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-readable-white">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      disabled={!editing}
                      className="glass border-white/20 text-readable-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-readable-white">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      disabled={!editing}
                      className="glass border-white/20 text-readable-white"
                    />
                  </div>
                </div>
              </div>

              {editing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 btn-modern pulse-glow shadow-modern-lg btn-text"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card className="glass border-0 shadow-modern-xl card-hover">
            <CardHeader>
              <CardTitle className="text-readable-white text-xl flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-readable-white">Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-readable-white">Role</span>
                <Badge variant="outline" className="text-readable-white border-white/20">
                  {profile?.role || 'Customer'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-readable-white">Member Since</span>
                <span className="text-readable-white text-sm">
                  {session.user?.profile?.createdAt ? new Date(session.user.profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-0 shadow-modern-xl card-hover">
            <CardHeader>
              <CardTitle className="text-readable-white text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start glass border-white/20 text-readable-white hover:text-gray-800 hover:bg-white/10 btn-modern shadow-modern" 
                asChild
              >
                <Link href="/orders">
                  <Package className="h-4 w-4 mr-3" />
                  View Orders
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start glass border-white/20 text-readable-white hover:text-gray-800 hover:bg-white/10 btn-modern shadow-modern" 
                asChild
              >
                <Link href="/cart">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Shopping Cart
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start glass border-white/20 text-readable-white hover:text-gray-800 hover:bg-white/10 btn-modern shadow-modern" 
                asChild
              >
                <Link href="/products">
                  <Package className="h-4 w-4 mr-3" />
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
