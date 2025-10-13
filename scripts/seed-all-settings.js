require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedAllSettings() {
  try {
    console.log('🌱 Seeding all settings...')

    // Default settings for all categories
    const allSettings = {
      general: {
        storeName: 'Little Harvest',
        storeDescription: 'Nutritious meals for little ones',
        storeEmail: 'info@littleharvest.co.za',
        storePhone: '+27 11 123 4567',
        storeAddress: '123 Main Street, Johannesburg, South Africa'
      },
      business: {
        currency: 'ZAR',
        timezone: 'Africa/Johannesburg',
        language: 'en'
      },
      delivery: {
        deliveryRadius: 15,
        freeDeliveryThreshold: 200,
        deliveryFee: 25,
        sameDayDelivery: false
      },
      payment: {
        acceptCashOnDelivery: true,
        acceptCardPayment: true,
        paymentGateway: 'stripe'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        orderConfirmations: true,
        deliveryUpdates: true,
        marketingEmails: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 60,
        passwordPolicy: 'strong',
        loginAttempts: 5
      },
      system: {
        maintenanceMode: false,
        debugMode: false,
        logLevel: 'info',
        sessionTimeout: 60,
        rateLimiting: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        require2FA: false,
        adminIpWhitelist: '',
        cacheDuration: 15,
        dbPoolSize: 10,
        maxFileSize: 10
      }
    }

    // Insert all settings
    for (const [category, settings] of Object.entries(allSettings)) {
      for (const [key, value] of Object.entries(settings)) {
        // Ensure rate limiting is always enabled for system category
        const finalValue = (category === 'system' && key === 'rateLimiting') ? true : value
        
        await prisma.storeSettings.upsert({
          where: { 
            category_key: { category, key }
          },
          update: { 
            value: JSON.stringify(finalValue),
            updatedBy: 'system-seed',
            updatedAt: new Date()
          },
          create: {
            key,
            category,
            value: JSON.stringify(finalValue),
            isActive: true,
            updatedBy: 'system-seed'
          }
        })
      }
    }

    console.log('✅ All settings seeded successfully!')
    
    // Verify the settings were created
    const createdSettings = await prisma.storeSettings.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    console.log('🔍 Settings in database:')
    const settingsByCategory = createdSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(`${setting.key}: ${setting.value}`)
      return acc
    }, {})

    for (const [category, settings] of Object.entries(settingsByCategory)) {
      console.log(`  ${category}: ${settings.length} settings`)
    }

  } catch (error) {
    console.error('❌ Error seeding settings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedAllSettings()
  .then(() => {
    console.log('🎉 All settings seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Settings seeding failed:', error)
    process.exit(1)
  })
