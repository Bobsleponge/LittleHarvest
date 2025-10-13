require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedSystemSettings() {
  try {
    console.log('🌱 Seeding system settings...')

    // Default system settings
    const systemSettings = [
      {
        category: 'system',
        key: 'maintenanceMode',
        value: JSON.stringify(false),
        description: 'Temporarily disable public access to the site for maintenance',
        isActive: true
      },
      {
        category: 'system',
        key: 'debugMode',
        value: JSON.stringify(false),
        description: 'Enable detailed error logging and debugging information',
        isActive: true
      },
      {
        category: 'system',
        key: 'logLevel',
        value: JSON.stringify('info'),
        description: 'Set the minimum level of log messages to record',
        isActive: true
      },
      {
        category: 'system',
        key: 'sessionTimeout',
        value: JSON.stringify(60),
        description: 'How long users stay logged in before being automatically logged out',
        isActive: true
      },
      {
        category: 'system',
        key: 'rateLimiting',
        value: JSON.stringify(true),
        description: 'Enable API rate limiting to prevent abuse and protect against DDoS attacks',
        isActive: true
      },
      {
        category: 'system',
        key: 'backupFrequency',
        value: JSON.stringify('daily'),
        description: 'How often to automatically backup your database and files',
        isActive: true
      },
      {
        category: 'system',
        key: 'backupRetention',
        value: JSON.stringify(30),
        description: 'How long to keep backup files before automatically deleting them',
        isActive: true
      },
      {
        category: 'system',
        key: 'passwordMinLength',
        value: JSON.stringify(8),
        description: 'Minimum password length for user accounts',
        isActive: true
      },
      {
        category: 'system',
        key: 'passwordRequireSpecial',
        value: JSON.stringify(true),
        description: 'Require special characters in passwords',
        isActive: true
      },
      {
        category: 'system',
        key: 'passwordRequireNumbers',
        value: JSON.stringify(true),
        description: 'Require numbers in passwords',
        isActive: true
      },
      {
        category: 'system',
        key: 'require2FA',
        value: JSON.stringify(false),
        description: 'Require admin users to use 2FA for enhanced security',
        isActive: true
      },
      {
        category: 'system',
        key: 'adminIpWhitelist',
        value: JSON.stringify(''),
        description: 'Restrict admin access to specific IP addresses',
        isActive: true
      },
      {
        category: 'system',
        key: 'cacheDuration',
        value: JSON.stringify(15),
        description: 'How long to cache API responses and static content',
        isActive: true
      },
      {
        category: 'system',
        key: 'dbPoolSize',
        value: JSON.stringify(10),
        description: 'Number of concurrent database connections',
        isActive: true
      },
      {
        category: 'system',
        key: 'maxFileSize',
        value: JSON.stringify(10),
        description: 'Maximum size for file uploads in MB',
        isActive: true
      }
    ]

    // Insert system settings
    for (const setting of systemSettings) {
      await prisma.storeSettings.upsert({
        where: {
          category_key: {
            category: setting.category,
            key: setting.key
          }
        },
        update: {
          value: setting.value,
          description: setting.description,
          isActive: setting.isActive,
          updatedAt: new Date()
        },
        create: {
          ...setting,
          updatedBy: 'system-seed'
        }
      })
    }

    console.log('✅ System settings seeded successfully!')
    console.log(`📊 Created ${systemSettings.length} system settings`)

    // Verify the settings were created
    const createdSettings = await prisma.storeSettings.findMany({
      where: { category: 'system' },
      orderBy: { key: 'asc' }
    })

    console.log('🔍 System settings in database:')
    createdSettings.forEach(setting => {
      console.log(`  - ${setting.key}: ${setting.value}`)
    })

  } catch (error) {
    console.error('❌ Error seeding system settings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedSystemSettings()
  .then(() => {
    console.log('🎉 System settings seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 System settings seeding failed:', error)
    process.exit(1)
  })
