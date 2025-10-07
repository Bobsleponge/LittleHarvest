/**
 * Send all email templates using Template 9 (Professional Business) design
 * with actual UI colors from the database
 */

require('dotenv').config()
const nodemailer = require('nodemailer')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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

// Fetch actual UI settings from database
async function getActualUISettings() {
  try {
    const uiSettings = await prisma.storeSettings.findMany({
      where: {
        category: 'ui',
        isActive: true
      },
      orderBy: { key: 'asc' }
    })

    const settings = uiSettings.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value)
      } catch {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    // Default colors if none exist
    const defaultColors = {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      text: '#111827',
      muted: '#6b7280'
    }

    const colors = settings.colors || defaultColors
    
    console.log('🎨 Using actual UI colors from database:')
    console.log(`   Primary: ${colors.primary}`)
    console.log(`   Secondary: ${colors.secondary}`)
    console.log(`   Accent: ${colors.accent}`)
    console.log(`   Text: ${colors.text}`)
    console.log(`   Muted: ${colors.muted}`)
    console.log('')

    return colors
  } catch (error) {
    console.warn('⚠️ Failed to fetch UI settings, using defaults:', error.message)
    return {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      text: '#111827',
      muted: '#6b7280'
    }
  }
}

// Generate Template 9 (Professional Business) design
function generateTemplate9(colors, options) {
  const { title, subtitle, content, footerLinks = [] } = options
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0; 
          background: #f5f5f5; 
        }
        .container { 
          max-width: 650px; 
          margin: 0 auto; 
          background: white; 
        }
        .header { 
          background: ${colors.primary}; 
          color: white; 
          padding: 35px 40px; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 26px; 
          font-weight: 600; 
        }
        .header p { 
          margin: 8px 0 0 0; 
          opacity: 0.9; 
        }
        .content { 
          padding: 40px; 
        }
        .intro { 
          font-size: 16px; 
          line-height: 1.6; 
          color: ${colors.text}; 
          margin-bottom: 30px; 
        }
        .benefits { 
          margin: 30px 0; 
        }
        .benefit { 
          display: flex; 
          align-items: center; 
          margin: 20px 0; 
          padding: 15px; 
          background: #f8f9fa; 
          border-radius: 8px; 
        }
        .benefit-icon { 
          font-size: 24px; 
          margin-right: 15px; 
        }
        .benefit-content h3 { 
          margin: 0 0 5px 0; 
          color: ${colors.text}; 
          font-size: 16px; 
        }
        .benefit-content p { 
          margin: 0; 
          color: ${colors.muted}; 
          font-size: 14px; 
        }
        .cta { 
          text-align: center; 
          margin: 40px 0; 
        }
        .cta a { 
          background: ${colors.primary}; 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 600; 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 25px 40px; 
          text-align: center; 
          color: ${colors.muted}; 
          font-size: 14px; 
          border-top: 1px solid #e9ecef; 
        }
        .info-item { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          border-left: 4px solid ${colors.primary};
          margin: 20px 0;
        }
        .info-item h3 { 
          color: ${colors.text}; 
          font-size: 16px; 
          font-weight: 600; 
          margin-bottom: 8px; 
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
        .main-card { 
          background: #f8f9fa; 
          border: 1px solid #e9ecef; 
          padding: 25px; 
          border-radius: 8px; 
          margin-bottom: 25px;
          text-align: center;
        }
        .main-card h2 { 
          color: ${colors.primary}; 
          font-size: 20px; 
          margin-bottom: 15px; 
        }
        .main-card p { 
          color: ${colors.muted}; 
          margin-bottom: 10px; 
        }
        @media (max-width: 600px) {
          .header { padding: 25px 20px; }
          .content { padding: 25px 20px; }
          .header h1 { font-size: 22px; }
          .items-table { font-size: 13px; }
          .items-table th, .items-table td { padding: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
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
            <div style="margin-top: 15px;">
              ${footerLinks.map(link => `<a href="${link.href}" style="color: ${colors.primary}; text-decoration: none; margin: 0 8px; font-weight: 500;">${link.text}</a>`).join(' • ')}
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendAllUpdatedTemplates() {
  console.log('📧 Sending all email templates with Template 9 (Professional Business) design...\n')

  const customerEmail = process.env.EMAIL_SERVER_USER || 'littleharvest9@gmail.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Fetch actual colors from your UI settings
  const colors = await getActualUISettings()

  // --- Welcome Email ---
  console.log('📤 Sending Welcome Email (Template 9)...')
  const welcomeContent = `
    <div class="intro">
      Thank you for joining Little Harvest! We're excited to partner with you in providing the best nutrition for your little ones through our premium organic baby food delivery service.
    </div>

    <div class="benefits">
      <div class="benefit">
        <div class="benefit-icon">🍼</div>
        <div class="benefit-content">
          <h3>Premium Fresh Products</h3>
          <p>Carefully curated selection of organic baby foods made with the finest ingredients</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">🛒</div>
        <div class="benefit-content">
          <h3>Streamlined Shopping Experience</h3>
          <p>Intuitive cart management and easy reordering for your convenience</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">👶</div>
        <div class="benefit-content">
          <h3>Personalized Child Profiles</h3>
          <p>Customize dietary preferences and allergies for tailored recommendations</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">📦</div>
        <div class="benefit-content">
          <h3>Complete Order Tracking</h3>
          <p>Monitor your orders from preparation to doorstep delivery</p>
        </div>
      </div>
    </div>

    <div class="cta">
      <a href="${appUrl}/products">Start Shopping Now</a>
    </div>
  `

  try {
    const welcomeHtml = generateTemplate9(colors, {
      title: 'Welcome to Little Harvest!',
      subtitle: 'Hello Matty Test, we\'re excited to have you join our family!',
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
    console.log('✅ Welcome Email sent successfully!')
  } catch (error) {
    console.error('❌ Error sending Welcome Email:', error.message)
  }
  console.log('')

  // --- Order Confirmation Email ---
  console.log('📤 Sending Order Confirmation Email (Template 9)...')
  const orderContent = `
    <div class="intro">
      Thank you for your order! We've received your order and are preparing it for you. Here are your order details:
    </div>

    <div class="main-card">
      <h2>Order Confirmation</h2>
      <p><strong>Order Number:</strong> LH-FINAL-001</p>
      <p><strong>Status:</strong> PENDING</p>
      <p><strong>Payment Status:</strong> PENDING</p>
      <p><strong>Delivery Date:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      <p><strong>Payment Due:</strong> ${new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
    </div>

    <div class="benefits">
      <div class="benefit">
        <div class="benefit-icon">🛒</div>
        <div class="benefit-content">
          <h3>Order Items</h3>
          <p>3 products • 4 total quantity</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">💰</div>
        <div class="benefit-content">
          <h3>Total Amount</h3>
          <p>R125.50</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">📍</div>
        <div class="benefit-content">
          <h3>Delivery Address</h3>
          <p>123 Sample Street, Sampleton, Gauteng 1234</p>
        </div>
      </div>
    </div>

    <div class="info-item">
      <h3>Order Items</h3>
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

    <div class="benefit" style="background: #fef2f2; border-left-color: #dc2626;">
      <div class="benefit-icon">💳</div>
      <div class="benefit-content">
        <h3 style="color: #dc2626;">Payment Required</h3>
        <p>Please make payment within 24 hours to confirm your order.</p>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #fca5a5;">
          <p style="margin: 3px 0;"><strong>Bank:</strong> Standard Bank</p>
          <p style="margin: 3px 0;"><strong>Account:</strong> Little Harvest (Pty) Ltd</p>
          <p style="margin: 3px 0;"><strong>Account Number:</strong> 1234567890</p>
          <p style="margin: 3px 0;"><strong>Branch Code:</strong> 051001</p>
          <p style="margin: 3px 0;"><strong>Reference:</strong> LH-FINAL-001</p>
          <p style="margin: 3px 0;"><strong>Amount:</strong> R125.50</p>
        </div>
      </div>
    </div>
  `

  try {
    const orderHtml = generateTemplate9(colors, {
      title: 'Order Confirmation',
      subtitle: 'Thank you for your order, Matty Test!',
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
      subject: 'Order Confirmation - LH-FINAL-001',
      html: orderHtml,
      text: 'Order Confirmation - LH-FINAL-001. Thank you for your order!'
    })
    console.log('✅ Order Confirmation Email sent successfully!')
  } catch (error) {
    console.error('❌ Error sending Order Confirmation Email:', error.message)
  }
  console.log('')

  // --- Password Reset Email ---
  console.log('📤 Sending Password Reset Email (Template 9)...')
  const passwordResetContent = `
    <div class="intro">
      We received a request to reset your password for your Little Harvest account. Click the button below to reset your password.
    </div>

    <div class="cta">
      <a href="${appUrl}/auth/reset-password?token=sample-reset-token-123">Reset My Password</a>
    </div>

    <div class="benefits">
      <div class="benefit">
        <div class="benefit-icon">⏰</div>
        <div class="benefit-content">
          <h3>Expires Soon</h3>
          <p>This link will expire in 1 hour</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">🛡️</div>
        <div class="benefit-content">
          <h3>Security Notice</h3>
          <p>If you didn't request this reset, please ignore this email</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">🔒</div>
        <div class="benefit-content">
          <h3>One-Time Use</h3>
          <p>For security, this link can only be used once</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">✅</div>
        <div class="benefit-content">
          <h3>Safe Process</h3>
          <p>Your password remains unchanged until you click the link</p>
        </div>
      </div>
    </div>
  `

  try {
    const passwordResetHtml = generateTemplate9(colors, {
      title: 'Password Reset Request',
      subtitle: 'Hello Matty Test, we received a request to reset your password',
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
    console.log('✅ Password Reset Email sent successfully!')
  } catch (error) {
    console.error('❌ Error sending Password Reset Email:', error.message)
  }

  console.log('\n🎉 All email templates updated with Template 9 (Professional Business) design!')
  console.log('📬 Check your inbox to see the final templates!')
  console.log('🎨 All templates now use your actual UI colors and professional styling!')
  
  await prisma.$disconnect()
}

sendAllUpdatedTemplates()
