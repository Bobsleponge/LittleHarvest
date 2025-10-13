import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📊 Exporting data from SQLite database...')
    
    // Temporarily switch to SQLite
    const originalSchema = await import('fs').then(fs => 
      fs.readFileSync('./prisma/schema.prisma', 'utf8')
    )
    
    // Update schema to SQLite temporarily
    const sqliteSchema = originalSchema.replace(
      'provider = "postgresql"',
      'provider = "sqlite"'
    ).replace(
      'url      = env("DATABASE_URL")',
      'url      = "file:./dev.db"'
    )
    
    await import('fs').then(fs => 
      fs.writeFileSync('./prisma/schema.prisma', sqliteSchema)
    )
    
    // Generate client for SQLite
    const { execSync } = await import('child_process')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Import and use SQLite client
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    
    // Export all data
    const exportData = {
      users: await prisma.user.findMany(),
      profiles: await prisma.profile.findMany(),
      childProfiles: await prisma.childProfile.findMany(),
      addresses: await prisma.address.findMany(),
      ageGroups: await prisma.ageGroup.findMany(),
      textures: await prisma.texture.findMany(),
      portionSizes: await prisma.portionSize.findMany(),
      allergens: await prisma.allergen.findMany(),
      dietaryRequirements: await prisma.dietaryRequirement.findMany(),
      products: await prisma.product.findMany(),
      productAllergens: await prisma.productAllergen.findMany(),
      productDietaryRequirements: await prisma.productDietaryRequirement.findMany(),
      prices: await prisma.price.findMany(),
      packages: await prisma.package.findMany(),
      packageItems: await prisma.packageItem.findMany(),
      carts: await prisma.cart.findMany(),
      cartItems: await prisma.cartItem.findMany(),
      orders: await prisma.order.findMany(),
      orderItems: await prisma.orderItem.findMany(),
      coupons: await prisma.coupon.findMany(),
      ingredients: await prisma.ingredient.findMany(),
      inventories: await prisma.inventory.findMany(),
      securityEvents: await prisma.securityEvent.findMany(),
      securityAlerts: await prisma.securityAlert.findMany(),
      blockedIPs: await prisma.blockedIP.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      storeSettings: await prisma.storeSettings.findMany(),
      settingsHistory: await prisma.settingsHistory.findMany(),
      securityIncidents: await prisma.securityIncident.findMany(),
      securityIncidentComments: await prisma.securityIncidentComment.findMany(),
      securityPlaybooks: await prisma.securityPlaybook.findMany(),
      securityThreatIntelligence: await prisma.securityThreatIntelligence.findMany()
    }
    
    await prisma.$disconnect()
    
    // Restore original schema
    await import('fs').then(fs => 
      fs.writeFileSync('./prisma/schema.prisma', originalSchema)
    )
    
    // Generate client for PostgreSQL
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Save export data to file
    await import('fs').then(fs => 
      fs.writeFileSync('./data-export.json', JSON.stringify(exportData, null, 2))
    )
    
    // Count records
    const counts = Object.entries(exportData).reduce((acc, [table, records]) => {
      acc[table] = records.length
      return acc
    }, {} as Record<string, number>)
    
    console.log('✅ Data export completed')
    
    res.status(200).json({
      message: 'Data export completed successfully',
      timestamp: new Date().toISOString(),
      export: {
        file: './data-export.json',
        totalTables: Object.keys(exportData).length,
        totalRecords: Object.values(exportData).reduce((sum, records) => sum + records.length, 0),
        counts
      }
    })
    
  } catch (error) {
    console.error('❌ Export failed:', error)
    res.status(500).json({ 
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
