import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Removing all test/seed data...')

  try {
    // Delete all data in reverse dependency order
    console.log('Deleting cart items...')
    await prisma.cartItem.deleteMany({})
    
    console.log('Deleting carts...')
    await prisma.cart.deleteMany({})
    
    console.log('Deleting inventory...')
    await prisma.inventory.deleteMany({})
    
    console.log('Deleting prices...')
    await prisma.price.deleteMany({})
    
    console.log('Deleting package items...')
    await prisma.packageItem.deleteMany({})
    
    console.log('Deleting packages...')
    await prisma.package.deleteMany({})
    
    console.log('Deleting products...')
    await prisma.product.deleteMany({})
    
    console.log('Deleting ingredients...')
    await prisma.ingredient.deleteMany({})
    
    console.log('Deleting portion sizes...')
    await prisma.portionSize.deleteMany({})
    
    console.log('Deleting textures...')
    await prisma.texture.deleteMany({})
    
    console.log('Deleting age groups...')
    await prisma.ageGroup.deleteMany({})
    
    console.log('Deleting users (except admins)...')
    await prisma.user.deleteMany({
      where: {
        role: 'CUSTOMER'
      }
    })
    
    console.log('✅ All test/seed data removed successfully!')
    
    // Show remaining data counts
    const counts = {
      users: await prisma.user.count(),
      ageGroups: await prisma.ageGroup.count(),
      textures: await prisma.texture.count(),
      portionSizes: await prisma.portionSize.count(),
      ingredients: await prisma.ingredient.count(),
      products: await prisma.product.count(),
      packages: await prisma.package.count(),
      packageItems: await prisma.packageItem.count(),
      prices: await prisma.price.count(),
      inventory: await prisma.inventory.count(),
      carts: await prisma.cart.count(),
      cartItems: await prisma.cartItem.count()
    }
    
    console.log('\n📊 Remaining data counts:')
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count}`)
    })
    
  } catch (error) {
    console.error('❌ Error removing seed data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


