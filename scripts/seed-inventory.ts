import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedInventory() {
  console.log('🌱 Seeding inventory data...')

  try {
    // Get all products and their portion sizes
    const products = await prisma.product.findMany({
      include: {
        prices: {
          include: { portionSize: true }
        }
      }
    })

    console.log(`Found ${products.length} products to seed inventory for`)

    const inventoryData = []

    for (const product of products) {
      for (const price of product.prices) {
        // Generate random stock levels based on product type
        let currentStock = 0
        let weeklyLimit = 0

        if (product.name.toLowerCase().includes('beef')) {
          currentStock = Math.floor(Math.random() * 20) + 10 // 10-30
          weeklyLimit = Math.floor(Math.random() * 15) + 20 // 20-35
        } else if (product.name.toLowerCase().includes('chicken')) {
          currentStock = Math.floor(Math.random() * 25) + 15 // 15-40
          weeklyLimit = Math.floor(Math.random() * 20) + 25 // 25-45
        } else if (product.name.toLowerCase().includes('fish')) {
          currentStock = Math.floor(Math.random() * 15) + 5 // 5-20
          weeklyLimit = Math.floor(Math.random() * 10) + 15 // 15-25
        } else if (product.name.toLowerCase().includes('lamb')) {
          currentStock = Math.floor(Math.random() * 12) + 8 // 8-20
          weeklyLimit = Math.floor(Math.random() * 8) + 12 // 12-20
        } else if (product.name.toLowerCase().includes('turkey')) {
          currentStock = Math.floor(Math.random() * 18) + 12 // 12-30
          weeklyLimit = Math.floor(Math.random() * 12) + 18 // 18-30
        } else {
          // Default for other products
          currentStock = Math.floor(Math.random() * 20) + 10 // 10-30
          weeklyLimit = Math.floor(Math.random() * 15) + 20 // 20-35
        }

        inventoryData.push({
          productId: product.id,
          portionSizeId: price.portionSizeId,
          currentStock,
          weeklyLimit,
          reservedStock: 0,
          lastRestocked: new Date()
        })
      }
    }

    console.log(`Creating ${inventoryData.length} inventory records...`)

    // Clear existing inventory
    await prisma.inventory.deleteMany({})
    console.log('✅ Cleared existing inventory')

    // Create new inventory records
    await prisma.inventory.createMany({
      data: inventoryData
    })

    console.log('✅ Inventory seeded successfully!')
    
    // Show summary
    const totalStock = await prisma.inventory.aggregate({
      _sum: { currentStock: true }
    })

    const lowStockCount = await prisma.inventory.count({
      where: { currentStock: { lte: 10 } }
    })

    const outOfStockCount = await prisma.inventory.count({
      where: { currentStock: { lte: 0 } }
    })

    console.log('\n📊 Inventory Summary:')
    console.log(`Total stock units: ${totalStock._sum.currentStock}`)
    console.log(`Low stock items (≤10): ${lowStockCount}`)
    console.log(`Out of stock items: ${outOfStockCount}`)

  } catch (error) {
    console.error('❌ Error seeding inventory:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedInventory()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
