'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, MapPin, Package, Heart, Settings } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner, LoadingButton } from '@/components/ui/loading'
import { Profile, Address } from '@/lib/types'

interface Order {
  id: string
  status: string
  totalZar: number
  deliveryDate: string | null
  createdAt: string
  address: Address | null
  items: OrderItem[]
}

interface OrderItem {
  id: string
  quantity: number
  unitPriceZar: number
  lineTotalZar: number
  product: {
    name: string
    slug: string
  }
  portionSize: {
    name: string
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [childName, setChildName] = useState('')
  const [childDob, setChildDob] = useState('')

  useEffect(() => {
    if (session) {
      fetchProfileData()
    }
  }, [session])

  const fetchProfileData = async () => {
    try {
      const [profileResponse, ordersResponse] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/orders')
      ])

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
        
        // Set form values
        if (profileData.profile) {
          setFirstName(profileData.profile.firstName || '')
          setLastName(profileData.profile.lastName || '')
          setPhone(profileData.profile.phone || '')
          setChildName(profileData.profile.childName || '')
          setChildDob(profileData.profile.childDob ? 
            new Date(profileData.profile.childDob).toISOString().split('T')[0] : '')
        }
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          childName,
          childDob: childDob || null,
        }),
      })

      if (response.ok) {
        await fetchProfileData()
        alert('Profile updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'PREPPING': return 'bg-purple-100 text-purple-800'
      case 'READY': return 'bg-green-100 text-green-800'
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and child information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="childName">Child's Name (Optional)</Label>
                      <Input
                        id="childName"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter your child's name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="childDob">Child's Date of Birth (Optional)</Label>
                      <Input
                        id="childDob"
                        type="date"
                        value={childDob}
                        onChange={(e) => setChildDob(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={saving}>
                      <LoadingButton loading={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </LoadingButton>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{session?.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Member Since</Label>
                    <p className="font-medium">
                      {session?.user?.createdAt ? 
                        new Date(session.user.createdAt).toLocaleDateString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Role</Label>
                    <Badge variant="secondary">
                      {session?.user?.role || 'CUSTOMER'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Delivery Addresses</h2>
              <Button asChild>
                <Link href="/profile/addresses/new">Add New Address</Link>
              </Button>
            </div>
            
            {profile?.addresses && profile.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{address.street}</h3>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.province} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                        </div>
                        {address.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/profile/addresses/${address.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a delivery address to get started
                  </p>
                  <Button asChild>
                    <Link href="/profile/addresses/new">Add Address</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          {order.deliveryDate && (
                            <p className="text-sm text-muted-foreground">
                              Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-lg font-semibold mt-2">
                            R{Number(order.totalZar).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.product.name} ({item.portionSize.name}) × {item.quantity}
                            </span>
                            <span>R{Number(item.lineTotalZar).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                        {order.status === 'PENDING' && (
                          <Button variant="outline" size="sm">
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start shopping to see your orders here
                  </p>
                  <Button asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <Card>
            <CardContent className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">
                Add products to your favorites to see them here
              </p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
