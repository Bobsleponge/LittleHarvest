#!/usr/bin/env node

/**
 * Test Order Confirmation Email
 * 
 * This script sends a sample order confirmation email to test the new design.
 */

require('dotenv').config()

const { sendOrderNotification } = require('../src/lib/email.ts')

async function testOrderConfirmationEmail() {
  console.log('🧪 Testing Order Confirmation Email Design...\n')

  const sampleOrderData = {
    orderNumber: 'LH-TEST-123456',
    customerName: 'John Doe',
    customerEmail: 'littleharvest9@gmail.com',
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 245.50,
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    paymentDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    items: [
      {
        productName: 'Organic Sweet Potato Puree',
        portionSize: '120g',
        quantity: 2,
        unitPrice: 45.00,
        lineTotal: 90.00,
      },
      {
        productName: 'Apple & Cinnamon Baby Food',
        portionSize: '100g',
        quantity: 3,
        unitPrice: 38.50,
        lineTotal: 115.50,
      },
      {
        productName: 'Mixed Vegetable Blend',
        portionSize: '150g',
        quantity: 1,
        unitPrice: 40.00,
        lineTotal: 40.00,
      }
    ],
    address: {
      street: '123 Oak Street',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
    }
  }

  try {
    console.log('📧 Sending sample order confirmation email...')
    const success = await sendOrderNotification(sampleOrderData, 'confirmation')
    
    if (success) {
      console.log('✅ Sample order confirmation email sent successfully!')
      console.log('📬 Check your inbox for the new design!')
    } else {
      console.log('❌ Failed to send sample email')
    }
  } catch (error) {
    console.error('❌ Error sending sample email:', error.message)
  }
}

testOrderConfirmationEmail()
