import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test PostgreSQL connection
    const { PrismaClient } = await import('@prisma/client')
    
    const prisma = new PrismaClient()
    
    // Test connection
    await prisma.$connect()
    
    // Test basic query
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    
    // Test creating a test record
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'CUSTOMER'
      }
    })
    
    // Clean up test record
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    
    await prisma.$disconnect()
    
    res.status(200).json({
      message: 'PostgreSQL connection test successful',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        connected: true,
        records: {
          users: userCount,
          products: productCount,
          orders: orderCount
        }
      },
      test: {
        createUser: '✅ Success',
        deleteUser: '✅ Success',
        connection: '✅ Success'
      }
    })
  } catch (error) {
    console.error('PostgreSQL test error:', error)
    res.status(500).json({ 
      error: 'PostgreSQL connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      database: {
        type: 'PostgreSQL',
        connected: false
      }
    })
  }
}
