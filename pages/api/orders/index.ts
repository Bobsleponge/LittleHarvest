import { NextApiRequest, NextApiResponse } from 'next'

// In-memory storage for demo purposes (replace with database in production)
let orders: any[] = [
  {
    id: '1',
    orderNumber: 'TT-2024-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    date: '2024-01-15',
    status: 'delivered',
    total: 132,
    items: [
      { id: '1', name: 'Organic Apple Puree', quantity: 2, price: 45, image: '🍎' },
      { id: '2', name: 'Sweet Potato Mash', quantity: 1, price: 42, image: '🍠' }
    ],
    deliveryAddress: '123 Main St, Cape Town, 8001',
    deliveryDate: '2024-01-16',
    deliveryTime: 'morning',
    paymentMethod: 'card'
  },
  {
    id: '2',
    orderNumber: 'TT-2024-002',
    customerName: 'Mike Chen',
    customerEmail: 'mike@example.com',
    date: '2024-01-20',
    status: 'shipped',
    total: 89,
    items: [
      { id: '3', name: 'Banana & Oatmeal', quantity: 1, price: 48, image: '🍌' },
      { id: '4', name: 'Carrot & Pea Mix', quantity: 1, price: 44, image: '🥕' }
    ],
    deliveryAddress: '456 Oak Ave, Cape Town, 8002',
    deliveryDate: '2024-01-22',
    deliveryTime: 'afternoon',
    paymentMethod: 'cash'
  },
  {
    id: '3',
    orderNumber: 'TT-2024-003',
    customerName: 'Emma Davis',
    customerEmail: 'emma@example.com',
    date: '2024-01-25',
    status: 'processing',
    total: 156,
    items: [
      { id: '5', name: 'Chicken & Rice', quantity: 2, price: 52, image: '🍗' },
      { id: '6', name: 'Mixed Berry Blend', quantity: 1, price: 46, image: '🫐' }
    ],
    deliveryAddress: '789 Pine St, Cape Town, 8003',
    deliveryDate: '2024-01-27',
    deliveryTime: 'evening',
    paymentMethod: 'card'
  },
  {
    id: '4',
    orderNumber: 'TT-2024-004',
    customerName: 'David Wilson',
    customerEmail: 'david@example.com',
    date: '2024-01-28',
    status: 'pending',
    total: 94,
    items: [
      { id: '1', name: 'Organic Apple Puree', quantity: 1, price: 45, image: '🍎' },
      { id: '3', name: 'Banana & Oatmeal', quantity: 1, price: 48, image: '🍌' }
    ],
    deliveryAddress: '321 Elm St, Cape Town, 8004',
    deliveryDate: '2024-01-30',
    deliveryTime: 'morning',
    paymentMethod: 'card'
  }
]

// Generate unique order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const lastOrder = orders[orders.length - 1]
  const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[2]) : 0
  return `TT-${year}-${String(lastNumber + 1).padStart(3, '0')}`
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all orders
    res.status(200).json(orders)
  } else if (req.method === 'POST') {
    // Create new order
    const {
      customerName,
      customerEmail,
      items,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      paymentMethod
    } = req.body

    // Validate required fields
    if (!customerName || !customerEmail || !items || !deliveryAddress || !deliveryDate || !deliveryTime || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    // Create new order
    const newOrder = {
      id: String(orders.length + 1),
      orderNumber: generateOrderNumber(),
      customerName,
      customerEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      total,
      items,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      paymentMethod
    }

    orders.push(newOrder)

    res.status(201).json(newOrder)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
