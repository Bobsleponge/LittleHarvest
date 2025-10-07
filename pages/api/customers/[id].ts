import { NextApiRequest, NextApiResponse } from 'next'

// Mock customer data - in production this would come from a database
let customers = [
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    // Get customer by ID
    const customer = customers.find(c => c.id === id)
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.status(200).json(customer)
  } else if (req.method === 'PUT') {
    // Update customer
    const customerIndex = customers.findIndex(c => c.id === id)
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    customers[customerIndex] = { ...customers[customerIndex], ...req.body }
    res.status(200).json(customers[customerIndex])
  } else if (req.method === 'DELETE') {
    // Delete customer
    const customerIndex = customers.findIndex(c => c.id === id)
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    customers.splice(customerIndex, 1)
    res.status(200).json({ message: 'Customer deleted successfully' })
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
