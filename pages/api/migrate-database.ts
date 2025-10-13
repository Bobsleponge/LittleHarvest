import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🚀 Starting data migration from SQLite to PostgreSQL...')
    
    // Create SQLite client
    const sqliteClient = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./prisma/dev.db'
        }
      }
    })
    
    // Create PostgreSQL client
    const postgresClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://littleharvest:your-secure-database-password@localhost:5432/littleharvest?schema=public'
        }
      }
    })
    
    // Test connections
    await sqliteClient.$connect()
    await postgresClient.$connect()
    
    console.log('✅ Both database connections successful')
    
    // Get counts from SQLite
    const sqliteCounts = {
      users: await sqliteClient.user.count(),
      products: await sqliteClient.product.count(),
      orders: await sqliteClient.order.count(),
      profiles: await sqliteClient.profile.count(),
      childProfiles: await sqliteClient.childProfile.count(),
      addresses: await sqliteClient.address.count(),
      ageGroups: await sqliteClient.ageGroup.count(),
      textures: await sqliteClient.texture.count(),
      portionSizes: await sqliteClient.portionSize.count(),
      allergens: await sqliteClient.allergen.count(),
      dietaryRequirements: await sqliteClient.dietaryRequirement.count(),
      ingredients: await sqliteClient.ingredient.count(),
      inventories: await sqliteClient.inventory.count(),
      carts: await sqliteClient.cart.count(),
      cartItems: await sqliteClient.cartItem.count(),
      packages: await sqliteClient.package.count(),
      packageItems: await sqliteClient.packageItem.count(),
      prices: await sqliteClient.price.count(),
      coupons: await sqliteClient.coupon.count(),
      securityEvents: await sqliteClient.securityEvent.count(),
      securityAlerts: await sqliteClient.securityAlert.count(),
      blockedIPs: await sqliteClient.blockedIP.count(),
      auditLogs: await sqliteClient.auditLog.count(),
      storeSettings: await sqliteClient.storeSettings.count(),
      settingsHistory: await sqliteClient.settingsHistory.count(),
      securityIncidents: await sqliteClient.securityIncident.count(),
      securityIncidentComments: await sqliteClient.securityIncidentComment.count(),
      securityPlaybooks: await sqliteClient.securityPlaybook.count(),
      securityThreatIntelligence: await sqliteClient.securityThreatIntelligence.count()
    }
    
    console.log('📊 SQLite data counts:', sqliteCounts)
    
    // Get counts from PostgreSQL (should be 0)
    const postgresCounts = {
      users: await postgresClient.user.count(),
      products: await postgresClient.product.count(),
      orders: await postgresClient.order.count(),
      profiles: await postgresClient.profile.count(),
      childProfiles: await postgresClient.childProfile.count(),
      addresses: await postgresClient.address.count(),
      ageGroups: await postgresClient.ageGroup.count(),
      textures: await postgresClient.texture.count(),
      portionSizes: await postgresClient.portionSize.count(),
      allergens: await postgresClient.allergen.count(),
      dietaryRequirements: await postgresClient.dietaryRequirement.count(),
      ingredients: await postgresClient.ingredient.count(),
      inventories: await postgresClient.inventory.count(),
      carts: await postgresClient.cart.count(),
      cartItems: await postgresClient.cartItem.count(),
      packages: await postgresClient.package.count(),
      packageItems: await postgresClient.packageItem.count(),
      prices: await postgresClient.price.count(),
      coupons: await postgresClient.coupon.count(),
      securityEvents: await postgresClient.securityEvent.count(),
      securityAlerts: await postgresClient.securityAlert.count(),
      blockedIPs: await postgresClient.blockedIP.count(),
      auditLogs: await postgresClient.auditLog.count(),
      storeSettings: await postgresClient.storeSettings.count(),
      settingsHistory: await postgresClient.settingsHistory.count(),
      securityIncidents: await postgresClient.securityIncident.count(),
      securityIncidentComments: await postgresClient.securityIncidentComment.count(),
      securityPlaybooks: await postgresClient.securityPlaybook.count(),
      securityThreatIntelligence: await postgresClient.securityThreatIntelligence.count()
    }
    
    console.log('📊 PostgreSQL data counts:', postgresCounts)
    
    // Migration order (respecting foreign key constraints)
    const migrationOrder = [
      'ageGroup',
      'texture', 
      'portionSize',
      'allergen',
      'dietaryRequirement',
      'user',
      'profile',
      'childProfile',
      'address',
      'product',
      'productAllergen',
      'productDietaryRequirement',
      'price',
      'package',
      'packageItem',
      'cart',
      'cartItem',
      'order',
      'orderItem',
      'coupon',
      'ingredient',
      'inventory',
      'securityEvent',
      'securityAlert',
      'blockedIP',
      'auditLog',
      'storeSettings',
      'settingsHistory',
      'securityIncident',
      'securityIncidentComment',
      'securityPlaybook',
      'securityThreatIntelligence'
    ]
    
    const migrationResults = {}
    
    for (const table of migrationOrder) {
      const sqliteCount = sqliteCounts[table + 's'] || sqliteCounts[table] || 0
      
      if (sqliteCount > 0) {
        console.log(`\n📦 Migrating ${table} (${sqliteCount} records)...`)
        
        try {
          // Get data from SQLite
          const records = await sqliteClient[table].findMany()
          
          if (records.length > 0) {
            // Clear existing data in PostgreSQL
            await postgresClient[table].deleteMany()
            
            // Insert data in batches
            const batchSize = 100
            let migrated = 0
            
            for (let i = 0; i < records.length; i += batchSize) {
              const batch = records.slice(i, i + batchSize)
              await postgresClient[table].createMany({
                data: batch,
                skipDuplicates: true
              })
              migrated += batch.length
            }
            
            migrationResults[table] = {
              success: true,
              migrated,
              total: records.length
            }
            
            console.log(`✅ ${table}: Migrated ${migrated}/${records.length} records`)
          }
        } catch (error) {
          console.log(`❌ ${table}: Migration failed - ${error.message}`)
          migrationResults[table] = {
            success: false,
            error: error.message
          }
        }
      } else {
        migrationResults[table] = {
          success: true,
          migrated: 0,
          total: 0,
          skipped: true
        }
      }
    }
    
    // Get final counts from PostgreSQL
    const finalPostgresCounts = {
      users: await postgresClient.user.count(),
      products: await postgresClient.product.count(),
      orders: await postgresClient.order.count(),
      profiles: await postgresClient.profile.count(),
      childProfiles: await postgresClient.childProfile.count(),
      addresses: await postgresClient.address.count(),
      ageGroups: await postgresClient.ageGroup.count(),
      textures: await postgresClient.texture.count(),
      portionSizes: await postgresClient.portionSize.count(),
      allergens: await postgresClient.allergen.count(),
      dietaryRequirements: await postgresClient.dietaryRequirement.count(),
      ingredients: await postgresClient.ingredient.count(),
      inventories: await postgresClient.inventory.count(),
      carts: await postgresClient.cart.count(),
      cartItems: await postgresClient.cartItem.count(),
      packages: await postgresClient.package.count(),
      packageItems: await postgresClient.packageItem.count(),
      prices: await postgresClient.price.count(),
      coupons: await postgresClient.coupon.count(),
      securityEvents: await postgresClient.securityEvent.count(),
      securityAlerts: await postgresClient.securityAlert.count(),
      blockedIPs: await postgresClient.blockedIP.count(),
      auditLogs: await postgresClient.auditLog.count(),
      storeSettings: await postgresClient.storeSettings.count(),
      settingsHistory: await postgresClient.settingsHistory.count(),
      securityIncidents: await postgresClient.securityIncident.count(),
      securityIncidentComments: await postgresClient.securityIncidentComment.count(),
      securityPlaybooks: await postgresClient.securityPlaybook.count(),
      securityThreatIntelligence: await postgresClient.securityThreatIntelligence.count()
    }
    
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
    
    console.log('🎉 Migration completed!')
    
    res.status(200).json({
      message: 'Database migration completed',
      timestamp: new Date().toISOString(),
      migration: {
        sqliteCounts,
        postgresCountsBefore: postgresCounts,
        postgresCountsAfter: finalPostgresCounts,
        results: migrationResults
      },
      summary: {
        totalTables: Object.keys(migrationResults).length,
        successfulMigrations: Object.values(migrationResults).filter(r => r.success).length,
        failedMigrations: Object.values(migrationResults).filter(r => !r.success).length
      }
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    res.status(500).json({ 
      error: 'Migration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
