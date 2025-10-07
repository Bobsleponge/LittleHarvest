import { useState, useEffect } from 'react'

export default function AdminOrdersTestPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    // Simple test
    console.log('Test page loaded')
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management Test</h1>
      <p className="text-gray-600">This is a test page to verify the app is working.</p>
    </div>
  )
}
