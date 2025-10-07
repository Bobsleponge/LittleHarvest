/**
 * This script sends sample email templates with the new unified, horizontal design
 * and dynamic colors from UI settings.
 */

require('dotenv').config()

const {
  sendWelcomeEmail,
  sendOrderNotification,
  sendPasswordResetEmail,
} = require('../src/lib/email.ts')

async function sendUpdatedEmailTemplates() {
  console.log('📧 Sending updated email templates with new design...\n')

  const customerEmail = process.env.EMAIL_SERVER_USER || 'littleharvest9@gmail.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // --- Welcome Email ---
  console.log('📤 Sending Updated Welcome Email Template...')
  const welcomeData = {
    customerName: 'Matty Test',
    customerEmail: customerEmail,
  }
  try {
    const sent = await sendWelcomeEmail(welcomeData)
    if (sent) {
      console.log('✅ Updated Welcome Email Template sent successfully!')
    } else {
      console.error('❌ Failed to send Updated Welcome Email Template.')
    }
  } catch (error) {
    console.error('❌ Error sending Updated Welcome Email Template:', error)
  }
  console.log('') // Newline for readability

  // --- Order Confirmation Email ---
  console.log('📤 Sending Updated Order Confirmation Email Template...')
  const orderData = {
    orderNumber: 'LH-UPDATED-001',
    customerName: 'Matty Test',
    customerEmail: customerEmail,
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 125.50,
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    paymentDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    items: [
      { productName: 'Organic Apple Puree', portionSize: '120g', quantity: 2, unitPrice: 30.00, lineTotal: 60.00 },
      { productName: 'Sweet Potato Mash', portionSize: '150g', quantity: 1, unitPrice: 35.50, lineTotal: 35.50 },
      { productName: 'Chicken & Veggie Blend', portionSize: '200g', quantity: 1, unitPrice: 30.00, lineTotal: 30.00 },
    ],
    address: {
      street: '123 Sample Street',
      city: 'Sampleton',
      province: 'Gauteng',
      postalCode: '1234',
    },
  }
  try {
    const sent = await sendOrderNotification(orderData, 'confirmation')
    if (sent) {
      console.log('✅ Updated Order Confirmation Email Template sent successfully!')
    } else {
      console.error('❌ Failed to send Updated Order Confirmation Email Template.')
    }
  } catch (error) {
    console.error('❌ Error sending Updated Order Confirmation Email Template:', error)
  }
  console.log('') // Newline for readability

  // --- Password Reset Email ---
  console.log('📤 Sending Updated Password Reset Email Template...')
  const passwordResetData = {
    customerName: 'Matty Test',
    customerEmail: customerEmail,
    resetLink: `${appUrl}/auth/reset-password?token=sample-reset-token-123`,
    expiresIn: '1 hour',
  }
  try {
    const sent = await sendPasswordResetEmail(passwordResetData)
    if (sent) {
      console.log('✅ Updated Password Reset Email Template sent successfully!')
    } else {
      console.error('❌ Failed to send Updated Password Reset Email Template.')
    }
  } catch (error) {
    console.error('❌ Error sending Updated Password Reset Email Template:', error)
  }
  console.log('\n🎉 All updated email templates sent!')
  console.log('📬 Check your inbox to see the new horizontal, compact designs!')
  console.log('🎨 Colors will automatically adapt to your UI settings!')
}

sendUpdatedEmailTemplates()
