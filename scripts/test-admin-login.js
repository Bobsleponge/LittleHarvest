#!/usr/bin/env node

// Test script to verify admin login functionality
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login setup...\n')

    // Check if admin users exist
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@tinytastes.co.za', 'manager@tinytastes.co.za']
        }
      }
    })

    console.log('📋 Admin users found:', adminUsers.length)
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found! Creating them...')
      
      // Create admin users
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@tinytastes.co.za',
          name: 'Admin User',
          role: 'ADMIN',
          emailVerified: new Date(),
        }
      })

      const managerUser = await prisma.user.create({
        data: {
          email: 'manager@tinytastes.co.za',
          name: 'Manager User',
          role: 'ADMIN',
          emailVerified: new Date(),
        }
      })

      // Create profiles
      await prisma.profile.create({
        data: {
          userId: adminUser.id,
          firstName: 'Admin',
          lastName: 'User',
        }
      })

      await prisma.profile.create({
        data: {
          userId: managerUser.id,
          firstName: 'Manager',
          lastName: 'User',
        }
      })

      console.log('✅ Admin users created successfully!')
    } else {
      console.log('✅ Admin users already exist!')
    }

    // Test dev-login API
    console.log('\n🧪 Testing dev-login API...')
    
    const response = await fetch('http://localhost:3000/api/dev-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'admin@tinytastes.co.za' }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Dev-login API working:', data)
    } else {
      const error = await response.text()
      console.log('❌ Dev-login API error:', error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testAdminLogin()
