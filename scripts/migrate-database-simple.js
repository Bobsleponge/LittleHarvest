#!/usr/bin/env node

/**
 * Database Migration Script
 * Migrates data from SQLite to PostgreSQL
 */

const { PrismaClient } = require('@prisma/client')

async function migrateData() {
  console.log('🚀 Starting database migration from SQLite to PostgreSQL...')
  
  // Create SQLite client with explicit datasource
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
  
  try {
    // Test connections
    console.log('📡 Testing database connections...')
    await sqliteClient.$connect()
    console.log('✅ SQLite connection successful')
    
    await postgresClient.$connect()
    console.log('✅ PostgreSQL connection successful')
    
    // Get table counts from SQLite
    console.log('\n📊 Current SQLite data:')
    const tables = [
      'User', 'Profile', 'ChildProfile', 'Product', 'Order', 'OrderItem',
      'Cart', 'CartItem', 'Address', 'AgeGroup', 'Texture', 'PortionSize',
      'Price', 'Package', 'PackageItem', 'Allergen', 'DietaryRequirement',
      'ProductAllergen', 'ProductDietaryRequirement', 'Coupon', 'Ingredient',
      'Inventory', 'SecurityEvent', 'SecurityAlert', 'BlockedIP', 'AuditLog',
      'StoreSettings', 'SettingsHistory', 'SecurityIncident', 'SecurityIncidentComment',
      'SecurityPlaybook', 'SecurityThreatIntelligence'
    ]
    
    const counts = {}
    for (const table of tables) {
      try {
        const count = await sqliteClient[table].count()
        counts[table] = count
        console.log(`  ${table}: ${count} records`)
      } catch (error) {
        console.log(`  ${table}: 0 records (table may not exist)`)
        counts[table] = 0
      }
    }
    
    console.log('\n🔄 Starting data migration...')
    
    // Migrate in order of dependencies
    const migrationOrder = [
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
    
    for (const table of migrationOrder) {
      if (counts[table] > 0) {
        console.log(`\n📦 Migrating ${table} (${counts[table]} records)...`)
        
        try {
          const records = await sqliteClient[table].findMany()
          
          if (records.length > 0) {
            // Clear existing data in PostgreSQL
            await postgresClient[table].deleteMany()
            
            // Insert data in batches
            const batchSize = 100
            for (let i = 0; i < records.length; i += batchSize) {
              const batch = records.slice(i, i + batchSize)
              await postgresClient[table].createMany({
                data: batch,
                skipDuplicates: true
              })
            }
            
            console.log(`✅ ${table}: Migrated ${records.length} records`)
          }
        } catch (error) {
          console.log(`❌ ${table}: Migration failed - ${error.message}`)
        }
      }
    }
    
    console.log('\n📊 Final PostgreSQL data:')
    for (const table of tables) {
      try {
        const count = await postgresClient[table].count()
        console.log(`  ${table}: ${count} records`)
      } catch (error) {
        console.log(`  ${table}: 0 records`)
      }
    }
    
    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('✅ Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  })
