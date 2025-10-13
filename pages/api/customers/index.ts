import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../src/lib/auth'
import { supabaseAdmin } from '../../../src/lib/supabaseClient'

// Mock customer data - fallback if database is not available
let mockCustomers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+27 82 123 4567',
    joinDate: '2024-01-01',
    totalOrders: 5,
    totalSpent: 450,
    lastOrderDate: '2024-01-15',
    status: 'active',
    address: '123 Main St',
    city: 'Cape Town',
    notes: 'Prefers morning deliveries, very satisfied customer',
    preferredDeliveryTime: 'morning',
    allergies: ['nuts'],
    children: [
      { name: 'Sophie', age: 8, allergies: ['dairy'] },
      { name: 'Liam', age: 6, allergies: [] }
    ]
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    phone: '+27 83 234 5678',
    joinDate: '2024-01-05',
    totalOrders: 3,
    totalSpent: 267,
    lastOrderDate: '2024-01-20',
    status: 'active',
    address: '456 Oak Ave',
    city: 'Cape Town',
    notes: 'New customer, interested in organic options',
    preferredDeliveryTime: 'afternoon',
    allergies: [],
    children: [
      { name: 'Aiden', age: 4, allergies: ['gluten'] }
    ]
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    phone: '+27 84 345 6789',
    joinDate: '2024-01-10',
    totalOrders: 2,
    totalSpent: 312,
    lastOrderDate: '2024-01-25',
    status: 'active',
    address: '789 Pine St',
    city: 'Cape Town',
    notes: 'Health-conscious parent, loves variety',
    preferredDeliveryTime: 'evening',
    allergies: ['shellfish'],
    children: [
      { name: 'Olivia', age: 7, allergies: [] },
      { name: 'Noah', age: 5, allergies: ['eggs'] }
    ]
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    phone: '+27 85 456 7890',
    joinDate: '2024-01-15',
    totalOrders: 1,
    totalSpent: 94,
    lastOrderDate: '2024-01-28',
    status: 'active',
    address: '321 Elm St',
    city: 'Cape Town',
    notes: 'First-time customer, testing our service',
    preferredDeliveryTime: 'morning',
    allergies: [],
    children: [
      { name: 'Mia', age: 3, allergies: [] }
    ]
  },
  {
    id: '5',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    phone: '+27 86 567 8901',
    joinDate: '2023-12-20',
    totalOrders: 8,
    totalSpent: 720,
    lastOrderDate: '2023-12-15',
    status: 'inactive',
    address: '654 Maple Dr',
    city: 'Cape Town',
    notes: 'Moved to different city, may return',
    preferredDeliveryTime: 'afternoon',
    allergies: [],
    children: [
      { name: 'Ethan', age: 9, allergies: ['nuts', 'dairy'] }
    ]
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      try {
        // Try to get customers from database
        const { data: users, error } = await supabaseAdmin
          .from('User')
          .select(`
            *,
            profile:Profile(*),
            orders:Order(
              *,
              items:OrderItem(*)
            )
          `)
          .eq('role', 'CUSTOMER')
          .order('createdAt', { ascending: false })

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        // Transform database data to match frontend interface
        const customers = (users || []).map(user => {
          const totalOrders = user.orders?.length || 0
          const totalSpent = user.orders?.reduce((sum: number, order: any) => sum + (order.totalZar || 0), 0) || 0
          const lastOrder = user.orders && user.orders.length > 0 
            ? user.orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            : null

          return {
            id: user.id,
            name: user.name || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Unknown Customer',
            email: user.email,
            phone: user.profile?.phone || '',
            joinDate: user.createdAt.split('T')[0],
            totalOrders,
            totalSpent,
            lastOrderDate: lastOrder ? lastOrder.createdAt.split('T')[0] : user.createdAt.split('T')[0],
            status: 'active',
            address: user.profile?.address || '',
            city: user.profile?.city || '',
            notes: user.profile?.notes || '',
            preferredDeliveryTime: user.profile?.preferredDeliveryTime || '',
            allergies: user.profile?.allergies || [],
            children: user.profile?.children || []
          }
        })

        res.status(200).json({ customers })
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Fallback to mock data if database fails
        res.status(200).json({ customers: mockCustomers })
      }
    } else if (req.method === 'POST') {
      try {
        // Create new customer in database
        const { name, email, phone, address, city, notes, preferredDeliveryTime, allergies, children } = req.body

        const { data: user, error } = await supabaseAdmin
          .from('User')
          .insert([{
            name,
            email,
            role: 'CUSTOMER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create user: ${error.message}`)
        }

        // Create profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('Profile')
          .insert([{
            userId: user.id,
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            phone,
            address,
            city,
            notes,
            preferredDeliveryTime,
            allergies: allergies || [],
            children: children || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }])
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // User was created but profile failed - still return success
        }

        const newCustomer = {
          id: user.id,
          name: user.name || 'New Customer',
          email: user.email,
          phone: profile?.phone || '',
          joinDate: user.createdAt.split('T')[0],
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: '',
          status: 'active',
          address: profile?.address || '',
          city: profile?.city || '',
          notes: profile?.notes || '',
          preferredDeliveryTime: profile?.preferredDeliveryTime || '',
          allergies: profile?.allergies || [],
          children: profile?.children || []
        }

        res.status(201).json(newCustomer)
      } catch (dbError) {
        console.error('Database error:', dbError)
        res.status(500).json({ error: 'Failed to create customer' })
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
