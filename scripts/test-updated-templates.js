/**
 * Simple test script to send updated email templates
 * This script runs independently without requiring the Next.js server
 */

require('dotenv').config()
const nodemailer = require('nodemailer')

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

// Generate unified email template with dynamic colors
function generateEmailTemplate(options) {
  const { title, subtitle, icon, colors, content, footerLinks = [] } = options
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          line-height: 1.5; 
          color: ${colors.text}; 
          background-color: #f8fafc;
          margin: 0;
          padding: 20px;
        }
        .email-container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header { 
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); 
          color: white; 
          padding: 30px;
          text-align: center;
        }
        .header-icon { font-size: 28px; margin-bottom: 8px; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .header p { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .main-card { 
          background: linear-gradient(135deg, ${colors.primary}08 0%, ${colors.accent}08 100%); 
          border: 1px solid ${colors.primary}20; 
          padding: 25px; 
          border-radius: 10px; 
          margin-bottom: 25px;
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin-bottom: 25px; 
        }
        .info-item { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          border: 1px solid #e2e8f0;
          border-left: 4px solid ${colors.primary};
        }
        .info-item h3 { 
          color: ${colors.text}; 
          font-size: 16px; 
          font-weight: 600; 
          margin-bottom: 8px; 
        }
        .info-item p { 
          color: ${colors.muted}; 
          font-size: 14px; 
          margin-bottom: 4px; 
        }
        .info-item .highlight { 
          color: ${colors.primary}; 
          font-weight: 600; 
        }
        .cta-section { 
          text-align: center; 
          margin: 25px 0; 
        }
        .cta-button { 
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block; 
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 8px ${colors.primary}30;
        }
        .footer { 
          background: #f8fafc; 
          padding: 25px; 
          text-align: center; 
          color: ${colors.muted};
          border-top: 1px solid #e2e8f0;
        }
        .footer p { margin-bottom: 6px; font-size: 14px; }
        .footer-links { margin-top: 15px; }
        .footer-links a { 
          color: ${colors.primary}; 
          text-decoration: none; 
          margin: 0 8px; 
          font-weight: 500; 
          font-size: 14px;
        }
        .two-column { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 20px; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px; 
          font-size: 14px;
        }
        .items-table th, .items-table td { 
          padding: 10px; 
          text-align: left; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .items-table th { 
          background: #f8fafc; 
          font-weight: 600; 
          color: ${colors.text}; 
        }
        .total-row { 
          background: ${colors.primary}08; 
          font-weight: 600; 
          color: ${colors.primary}; 
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header { padding: 25px 20px; }
          .content { padding: 25px 20px; }
          .header h1 { font-size: 20px; }
          .info-grid { grid-template-columns: 1fr; }
          .two-column { grid-template-columns: 1fr; }
          .items-table { font-size: 13px; }
          .items-table th, .items-table td { padding: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-icon">${icon}</div>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        
        <div class="content">
          ${content}
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Little Harvest!</strong></p>
          <p>Questions? Contact us at support@littleharvest.co.za</p>
          ${footerLinks.length > 0 ? `
            <div class="footer-links">
              ${footerLinks.map(link => `<a href="${link.href}">${link.text}</a>`).join(' • ')}
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendUpdatedEmailTemplates() {
  console.log('📧 Sending updated email templates with new horizontal design...\n')

  const customerEmail = process.env.EMAIL_SERVER_USER || 'littleharvest9@gmail.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Default colors (will be dynamic in the actual app)
  const colors = {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280'
  }

  // --- Welcome Email ---
  console.log('📤 Sending Updated Welcome Email Template...')
  const welcomeContent = `
    <div class="main-card">
      <h2 style="color: ${colors.primary}; font-size: 20px; margin-bottom: 15px; text-align: center;">🎉 You're All Set!</h2>
      <p style="text-align: center; color: ${colors.muted}; margin-bottom: 20px;">Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones with our fresh, organic baby food delivery service.</p>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <h3>🍼 Fresh Products</h3>
        <p>Browse our carefully curated selection of organic baby foods</p>
      </div>
      <div class="info-item">
        <h3>🛒 Easy Shopping</h3>
        <p>Create and manage your shopping cart with ease</p>
      </div>
      <div class="info-item">
        <h3>👶 Child Profiles</h3>
        <p>Set up profiles with dietary preferences and allergies</p>
      </div>
      <div class="info-item">
        <h3>📦 Order Tracking</h3>
        <p>Track your orders from preparation to delivery</p>
      </div>
      <div class="info-item">
        <h3>💳 Secure Payments</h3>
        <p>Save payment methods for quick and secure checkout</p>
      </div>
      <div class="info-item">
        <h3>📱 Delivery Management</h3>
        <p>Manage multiple delivery addresses easily</p>
      </div>
    </div>

    <div class="cta-section">
      <a href="${appUrl}/products" class="cta-button">Start Shopping Now</a>
    </div>
  `

  try {
    const welcomeHtml = generateEmailTemplate({
      title: 'Welcome to Little Harvest!',
      subtitle: `Hello Matty Test, we're excited to have you join our family!`,
      icon: '🌱',
      colors,
      content: welcomeContent,
      footerLinks: [
        { text: 'Website', href: appUrl },
        { text: 'Support', href: 'mailto:support@littleharvest.co.za' },
        { text: 'Privacy Policy', href: '#' }
      ]
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: 'Welcome to Little Harvest, Matty Test!',
      html: welcomeHtml,
      text: 'Welcome to Little Harvest! Thank you for signing up. Visit our website to start shopping for fresh baby food.'
    })
    console.log('✅ Updated Welcome Email Template sent successfully!')
  } catch (error) {
    console.error('❌ Error sending Welcome Email:', error.message)
  }
  console.log('')

  // --- Order Confirmation Email ---
  console.log('📤 Sending Updated Order Confirmation Email Template...')
  const orderContent = `
    <div class="main-card">
      <h2 style="color: ${colors.primary}; font-size: 20px; margin-bottom: 15px; text-align: center;">🎉 Order Received!</h2>
      <p style="text-align: center; color: ${colors.muted}; margin-bottom: 20px;">We've received your order and are preparing it for you.</p>
      <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: ${colors.primary}; border: 2px solid ${colors.primary}20;">LH-UPDATED-001</div>
    </div>

    <div class="two-column">
      <div class="info-item">
        <h3>📋 Order Details</h3>
        <p><span class="highlight">Order Number:</span> LH-UPDATED-001</p>
        <p><span class="highlight">Status:</span> PENDING</p>
        <p><span class="highlight">Payment:</span> PENDING</p>
        <p><span class="highlight">Delivery:</span> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        <p><span class="highlight">Payment Due:</span> ${new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
      <div class="info-item">
        <h3>💰 Order Summary</h3>
        <p><span class="highlight">Items:</span> 3 products</p>
        <p><span class="highlight">Total Quantity:</span> 4</p>
        <p><span class="highlight">Total Amount:</span> R125.50</p>
        <p><span class="highlight">Delivery:</span> Sampleton</p>
      </div>
    </div>

    <div class="info-item">
      <h3>🛒 Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Organic Apple Puree</strong></td>
            <td>120g</td>
            <td>2</td>
            <td>R30.00</td>
            <td><strong>R60.00</strong></td>
          </tr>
          <tr>
            <td><strong>Sweet Potato Mash</strong></td>
            <td>150g</td>
            <td>1</td>
            <td>R35.50</td>
            <td><strong>R35.50</strong></td>
          </tr>
          <tr>
            <td><strong>Chicken & Veggie Blend</strong></td>
            <td>200g</td>
            <td>1</td>
            <td>R30.00</td>
            <td><strong>R30.00</strong></td>
          </tr>
          <tr class="total-row">
            <td colspan="4"><strong>Total</strong></td>
            <td><strong>R125.50</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="info-item" style="border-left-color: #dc2626;">
      <h3 style="color: #dc2626;">💳 Payment Required</h3>
      <p>Please make payment within 24 hours to confirm your order.</p>
      <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #fca5a5;">
        <p style="margin: 3px 0;"><strong>Bank:</strong> Standard Bank</p>
        <p style="margin: 3px 0;"><strong>Account:</strong> Little Harvest (Pty) Ltd</p>
        <p style="margin: 3px 0;"><strong>Account Number:</strong> 1234567890</p>
        <p style="margin: 3px 0;"><strong>Branch Code:</strong> 051001</p>
        <p style="margin: 3px 0;"><strong>Reference:</strong> LH-UPDATED-001</p>
        <p style="margin: 3px 0;"><strong>Amount:</strong> R125.50</p>
      </div>
    </div>

    <div class="info-item" style="border-left-color: #3b82f6;">
      <h3 style="color: #3b82f6;">📍 Delivery Address</h3>
      <p>123 Sample Street</p>
      <p>Sampleton, Gauteng 1234</p>
    </div>
  `

  try {
    const orderHtml = generateEmailTemplate({
      title: 'Order Confirmation',
      subtitle: `Thank you for your order, Matty Test!`,
      icon: '🌱',
      colors,
      content: orderContent,
      footerLinks: [
        { text: 'Track Order', href: `${appUrl}/orders` },
        { text: 'Support', href: 'mailto:orders@littleharvest.co.za' },
        { text: 'Website', href: appUrl }
      ]
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: 'Order Confirmation - LH-UPDATED-001',
      html: orderHtml,
      text: 'Order Confirmation - LH-UPDATED-001. Thank you for your order!'
    })
    console.log('✅ Updated Order Confirmation Email Template sent successfully!')
  } catch (error) {
    console.error('❌ Error sending Order Confirmation Email:', error.message)
  }
  console.log('')

  // --- Password Reset Email ---
  console.log('📤 Sending Updated Password Reset Email Template...')
  const passwordResetContent = `
    <div class="main-card">
      <h2 style="color: ${colors.primary}; font-size: 20px; margin-bottom: 15px; text-align: center;">🔑 Password Reset Request</h2>
      <p style="text-align: center; color: ${colors.muted}; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password.</p>
    </div>

    <div class="cta-section">
      <a href="${appUrl}/auth/reset-password?token=sample-reset-token-123" class="cta-button">Reset My Password</a>
    </div>

    <div class="info-grid">
      <div class="info-item" style="border-left-color: #f59e0b;">
        <h3 style="color: #f59e0b;">⏰ Expires Soon</h3>
        <p>This link will expire in <span class="highlight">1 hour</span></p>
      </div>
      <div class="info-item" style="border-left-color: #dc2626;">
        <h3 style="color: #dc2626;">🛡️ Security Notice</h3>
        <p>If you didn't request this reset, please ignore this email</p>
      </div>
      <div class="info-item" style="border-left-color: #3b82f6;">
        <h3 style="color: #3b82f6;">🔒 One-Time Use</h3>
        <p>For security, this link can only be used once</p>
      </div>
      <div class="info-item" style="border-left-color: #059669;">
        <h3 style="color: #059669;">✅ Safe Process</h3>
        <p>Your password remains unchanged until you click the link</p>
      </div>
    </div>
  `

  try {
    const passwordResetHtml = generateEmailTemplate({
      title: 'Password Reset Request',
      subtitle: `Hello Matty Test, we received a request to reset your password`,
      icon: '🔐',
      colors,
      content: passwordResetContent,
      footerLinks: [
        { text: 'Website', href: appUrl },
        { text: 'Support', href: 'mailto:support@littleharvest.co.za' },
        { text: 'Privacy Policy', href: '#' }
      ]
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: 'Reset Your Password - Little Harvest',
      html: passwordResetHtml,
      text: 'Password Reset Request - Little Harvest. Click the link to reset your password.'
    })
    console.log('✅ Updated Password Reset Email Template sent successfully!')
  } catch (error) {
    console.error('❌ Error sending Password Reset Email:', error.message)
  }

  console.log('\n🎉 All updated email templates sent!')
  console.log('📬 Check your inbox to see the new horizontal, compact designs!')
  console.log('🎨 Colors will automatically adapt to your UI settings!')
  console.log('📱 Templates are fully responsive and mobile-friendly!')
}

sendUpdatedEmailTemplates()
