import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🚀 Starting data import to PostgreSQL...')
    
    const prisma = new PrismaClient()
    await prisma.$connect()
    
    const migrationDataDir = './migration-data'
    
    // Import order (respecting foreign key constraints)
    const importOrder = [
      'AgeGroup',
      'Texture', 
      'PortionSize',
      'Allergen',
      'DietaryRequirement',
      'User',
      'Profile',
      'ChildProfile',
      'Address',
      'Product',
      'ProductAllergen',
      'ProductDietaryRequirement',
      'Price',
      'Package',
      'PackageItem',
      'Cart',
      'CartItem',
      'Order',
      'OrderItem',
      'Coupon',
      'Ingredient',
      'Inventory',
      'SecurityEvent',
      'SecurityAlert',
      'BlockedIP',
      'AuditLog',
      'StoreSettings',
      'SettingsHistory',
      'SecurityIncident',
      'SecurityIncidentComment',
      'SecurityPlaybook',
      'SecurityThreatIntelligence'
    ]
    
    const importResults = {}
    
    for (const table of importOrder) {
      // Map Prisma model names to exported file names
      const fileName = table.charAt(0).toLowerCase() + table.slice(1) + 's'
      const filePath = path.join(migrationDataDir, `${fileName}.json`)
      
      if (!fs.existsSync(filePath)) {
        importResults[table] = {
          success: true,
          imported: 0,
          total: 0,
          skipped: true,
          reason: 'File not found'
        }
        continue
      }
      
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        
        if (!Array.isArray(data) || data.length === 0) {
          importResults[table] = {
            success: true,
            imported: 0,
            total: 0,
            skipped: true,
            reason: 'No data to import'
          }
          continue
        }
        
        console.log(`📦 Importing ${table} (${data.length} records)...`)
        
        // Clear existing data
        await prisma[table].deleteMany()
        
        // Import data in batches
        const batchSize = 100
        let imported = 0
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)
          
          // Convert data types from SQLite to PostgreSQL format
          const processedBatch = batch.map(record => {
            const processed = { ...record }
            
            // Convert timestamp fields to Date objects
            Object.keys(processed).forEach(key => {
              if (key.includes('At') && typeof processed[key] === 'number') {
                processed[key] = new Date(processed[key])
              }
              // Convert boolean fields from integers to booleans
              if (key.includes('isActive') || key.includes('isDefault') || key.includes('resolved') || key.includes('isInternal')) {
                processed[key] = Boolean(processed[key])
              }
              // Convert date fields
              if (key.includes('dateOfBirth') && typeof processed[key] === 'number') {
                processed[key] = new Date(processed[key])
              }
              // Convert emailVerified field
              if (key === 'emailVerified' && typeof processed[key] === 'number') {
                processed[key] = new Date(processed[key])
              }
            })
            
            return processed
          })
          
          await prisma[table].createMany({
            data: processedBatch,
            skipDuplicates: true
          })
          
          imported += batch.length
        }
        
        importResults[table] = {
          success: true,
          imported,
          total: data.length
        }
        
        console.log(`✅ ${table}: Imported ${imported}/${data.length} records`)
        
      } catch (error) {
        console.log(`❌ ${table}: Import failed - ${error.message}`)
        importResults[table] = {
          success: false,
          error: error.message
        }
      }
    }
    
    // Get final counts
    const finalCounts = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      profiles: await prisma.profile.count(),
      childProfiles: await prisma.childProfile.count(),
      addresses: await prisma.address.count(),
      ageGroups: await prisma.ageGroup.count(),
      textures: await prisma.texture.count(),
      portionSizes: await prisma.portionSize.count(),
      allergens: await prisma.allergen.count(),
      dietaryRequirements: await prisma.dietaryRequirement.count(),
      ingredients: await prisma.ingredient.count(),
      inventories: await prisma.inventory.count(),
      carts: await prisma.cart.count(),
      cartItems: await prisma.cartItem.count(),
      packages: await prisma.package.count(),
      packageItems: await prisma.packageItem.count(),
      prices: await prisma.price.count(),
      coupons: await prisma.coupon.count(),
      securityEvents: await prisma.securityEvent.count(),
      securityAlerts: await prisma.securityAlert.count(),
      blockedIPs: await prisma.blockedIP.count(),
      auditLogs: await prisma.auditLog.count(),
      storeSettings: await prisma.storeSettings.count(),
      settingsHistory: await prisma.settingsHistory.count(),
      securityIncidents: await prisma.securityIncident.count(),
      securityIncidentComments: await prisma.securityIncidentComment.count(),
      securityPlaybooks: await prisma.securityPlaybook.count(),
      securityThreatIntelligence: await prisma.securityThreatIntelligence.count()
    }
    
    await prisma.$disconnect()
    
    console.log('🎉 Data import completed!')
    
    res.status(200).json({
      message: 'Data import completed',
      timestamp: new Date().toISOString(),
      import: {
        results: importResults,
        finalCounts
      },
      summary: {
        totalTables: Object.keys(importResults).length,
        successfulImports: Object.values(importResults).filter(r => r.success).length,
        failedImports: Object.values(importResults).filter(r => !r.success).length,
        totalRecordsImported: Object.values(importResults)
          .filter(r => r.success && !r.skipped)
          .reduce((sum, r) => sum + (r.imported || 0), 0)
      }
    })
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    res.status(500).json({ 
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
