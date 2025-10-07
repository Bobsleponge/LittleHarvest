#!/usr/bin/env node

/**
 * Email Service Test Script
 * 
 * This script tests the email service configuration and sends a test email.
 * Run with: node scripts/test-email.js
 */

require('dotenv').config()

const nodemailer = require('nodemailer')

async function testEmailService() {
  console.log('🧪 Testing Little Harvest Email Service...\n')

  // Check environment variables
  const requiredVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT', 
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM'
  ]

  console.log('📋 Checking environment variables...')
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nPlease set these variables in your .env file')
    process.exit(1)
  }

  console.log('✅ All required environment variables are set\n')

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  // Test connection
  console.log('🔌 Testing SMTP connection...')
  try {
    await transporter.verify()
    console.log('✅ SMTP connection successful\n')
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message)
    process.exit(1)
  }

  // Send test email
  const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_SERVER_USER
  
  console.log(`📧 Sending test email to: ${testEmail}`)
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: testEmail,
    subject: '🌱 Little Harvest Email Service Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1>🌱 Little Harvest Email Service Test</h1>
          <p>This is a test email to verify your email service configuration.</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2>✅ Email Service Status</h2>
          <p>Your Little Harvest email service is working correctly!</p>
          
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>SMTP Host:</strong> ${process.env.EMAIL_SERVER_HOST}</li>
            <li><strong>SMTP Port:</strong> ${process.env.EMAIL_SERVER_PORT}</li>
            <li><strong>From Address:</strong> ${process.env.EMAIL_FROM}</li>
            <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <p>You can now send emails for:</p>
          <ul>
            <li>👋 Welcome emails for new users</li>
            <li>🔐 Password reset emails</li>
            <li>✅ Account verification emails</li>
            <li>📦 Order confirmation emails</li>
            <li>💳 Payment confirmation emails</li>
            <li>❌ Order cancellation emails</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280;">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    `,
    text: `
Little Harvest Email Service Test

This is a test email to verify your email service configuration.

Your Little Harvest email service is working correctly!

Configuration Details:
- SMTP Host: ${process.env.EMAIL_SERVER_HOST}
- SMTP Port: ${process.env.EMAIL_SERVER_PORT}
- From Address: ${process.env.EMAIL_FROM}
- Test Time: ${new Date().toLocaleString()}

You can now send emails for:
- Welcome emails for new users
- Password reset emails
- Account verification emails
- Order confirmation emails
- Payment confirmation emails
- Order cancellation emails

Thank you for choosing Little Harvest!
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Response: ${info.response}`)
    console.log('\n🎉 Email service is ready to use!')
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message)
    process.exit(1)
  }
}

// Run the test
testEmailService().catch(error => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})
