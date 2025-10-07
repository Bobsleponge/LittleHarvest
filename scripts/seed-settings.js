const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultSettings = [
  // General Settings
  { category: 'general', key: 'storeName', value: 'Little Harvest', description: 'Store name' },
  { category: 'general', key: 'storeDescription', value: 'Fresh, organic baby food delivered to your door', description: 'Store description' },
  { category: 'general', key: 'storeEmail', value: 'hello@tinytastes.co.za', description: 'Store contact email' },
  { category: 'general', key: 'storePhone', value: '+27 21 123 4567', description: 'Store contact phone' },
  { category: 'general', key: 'storeAddress', value: '123 Main Street, Cape Town, 8001', description: 'Store physical address' },

  // Business Settings
  { category: 'business', key: 'currency', value: 'ZAR', description: 'Default currency' },
  { category: 'business', key: 'timezone', value: 'Africa/Johannesburg', description: 'Store timezone' },
  { category: 'business', key: 'language', value: 'en', description: 'Default language' },
  { category: 'business', key: 'businessHours', value: JSON.stringify({ open: '08:00', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }), description: 'Business operating hours' },

  // Delivery Settings
  { category: 'delivery', key: 'deliveryRadius', value: '50', description: 'Delivery radius in kilometers' },
  { category: 'delivery', key: 'freeDeliveryThreshold', value: '200', description: 'Minimum order amount for free delivery' },
  { category: 'delivery', key: 'deliveryFee', value: '25', description: 'Standard delivery fee' },
  { category: 'delivery', key: 'sameDayDelivery', value: 'true', description: 'Enable same-day delivery' },
  { category: 'delivery', key: 'deliveryTimeSlots', value: JSON.stringify(['09:00-12:00', '12:00-15:00', '15:00-18:00']), description: 'Available delivery time slots' },

  // Payment Settings
  { category: 'payment', key: 'acceptCashOnDelivery', value: 'true', description: 'Accept cash on delivery' },
  { category: 'payment', key: 'acceptCardPayment', value: 'true', description: 'Accept card payments' },
  { category: 'payment', key: 'paymentGateway', value: 'stripe', description: 'Payment gateway provider' },
  { category: 'payment', key: 'paymentMethods', value: JSON.stringify(['card', 'cash', 'eft']), description: 'Available payment methods' },

  // Notification Settings
  { category: 'notifications', key: 'emailNotifications', value: 'true', description: 'Enable email notifications' },
  { category: 'notifications', key: 'smsNotifications', value: 'false', description: 'Enable SMS notifications' },
  { category: 'notifications', key: 'orderConfirmations', value: 'true', description: 'Send order confirmations' },
  { category: 'notifications', key: 'deliveryUpdates', value: 'true', description: 'Send delivery updates' },
  { category: 'notifications', key: 'marketingEmails', value: 'false', description: 'Send marketing emails' },

  // Security Settings
  { category: 'security', key: 'twoFactorAuth', value: 'false', description: 'Enable two-factor authentication' },
  { category: 'security', key: 'sessionTimeout', value: '30', description: 'Session timeout in minutes' },
  { category: 'security', key: 'passwordPolicy', value: 'strong', description: 'Password policy strength' },
  { category: 'security', key: 'loginAttempts', value: '5', description: 'Maximum login attempts before lockout' },
  { category: 'security', key: 'ipWhitelist', value: JSON.stringify([]), description: 'Whitelisted IP addresses' },

  // System Settings
  { category: 'system', key: 'maintenanceMode', value: 'false', description: 'Enable maintenance mode' },
  { category: 'system', key: 'debugMode', value: 'false', description: 'Enable debug mode' },
  { category: 'system', key: 'logLevel', value: 'info', description: 'Logging level' },
  { category: 'system', key: 'backupFrequency', value: 'daily', description: 'Database backup frequency' }
]

async function seedSettings() {
  try {
    console.log('🌱 Seeding default settings...')

    for (const setting of defaultSettings) {
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
          updatedAt: new Date()
        },
        create: {
          category: setting.category,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          updatedBy: 'system'
        }
      })
    }

    console.log(`✅ Successfully seeded ${defaultSettings.length} default settings`)
    
    // Show summary by category
    const summary = defaultSettings.reduce((acc, setting) => {
      acc[setting.category] = (acc[setting.category] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Settings by category:')
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} settings`)
    })

  } catch (error) {
    console.error('❌ Error seeding settings:', error)
    throw error
  }
}

async function main() {
  try {
    await seedSettings()
  } catch (error) {
    console.error('Failed to seed settings:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

module.exports = { seedSettings, defaultSettings }
