const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedSecurityData() {
  console.log('🌱 Seeding security data...')

  try {
    // Create some sample security events
    const securityEvents = [
      {
        type: 'login',
        userEmail: 'admin@tinytastes.co.za',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
        severity: 'low',
        details: 'Successful admin login'
      },
      {
        type: 'failed_login',
        userEmail: 'unknown@example.com',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'danger',
        severity: 'high',
        details: 'Multiple failed login attempts from suspicious IP'
      },
      {
        type: 'admin_access',
        userEmail: 'admin@tinytastes.co.za',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
        severity: 'low',
        details: 'Admin accessed security dashboard'
      },
      {
        type: 'suspicious_activity',
        userEmail: 'unknown@example.com',
        ipAddress: '198.51.100.42',
        userAgent: 'curl/7.68.0',
        status: 'danger',
        severity: 'critical',
        details: 'Attempted SQL injection attack'
      },
      {
        type: 'data_export',
        userEmail: 'admin@tinytastes.co.za',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'warning',
        severity: 'medium',
        details: 'Large customer data export'
      }
    ]

    for (const event of securityEvents) {
      await prisma.securityEvent.create({
        data: {
          ...event,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        }
      })
    }

    // Create some sample security alerts
    const securityAlerts = [
      {
        type: 'failed_login',
        title: 'Multiple Failed Login Attempts',
        description: 'IP 203.45.67.89 has attempted 5 failed logins in the last hour',
        severity: 'high',
        resolved: false
      },
      {
        type: 'suspicious_ip',
        title: 'Suspicious IP Activity',
        description: 'IP 198.51.100.42 detected attempting SQL injection',
        severity: 'critical',
        resolved: false
      },
      {
        type: 'unusual_activity',
        title: 'Large Data Export',
        description: 'Unusual large customer data export detected',
        severity: 'medium',
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: 'admin@tinytastes.co.za'
      }
    ]

    for (const alert of securityAlerts) {
      await prisma.securityAlert.create({
        data: {
          ...alert,
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) // Random time in last 3 days
        }
      })
    }

    // Create some sample blocked IPs
    const blockedIPs = [
      {
        ipAddress: '203.45.67.89',
        reason: 'Multiple failed login attempts',
        blockedBy: 'admin@tinytastes.co.za'
      },
      {
        ipAddress: '198.51.100.42',
        reason: 'SQL injection attempt',
        blockedBy: 'system'
      }
    ]

    for (const blockedIP of blockedIPs) {
      await prisma.blockedIP.create({
        data: {
          ...blockedIP,
          createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) // Random time in last 2 days
        }
      })
    }

    console.log('✅ Security data seeded successfully!')
    console.log(`   - ${securityEvents.length} security events`)
    console.log(`   - ${securityAlerts.length} security alerts`)
    console.log(`   - ${blockedIPs.length} blocked IPs`)

  } catch (error) {
    console.error('❌ Error seeding security data:', error)
    throw error
  }
}

async function main() {
  try {
    await seedSecurityData()
  } catch (error) {
    console.error('Seed script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

module.exports = { seedSecurityData }
