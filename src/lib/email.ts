import { logger } from '@/lib/logger'
import nodemailer from 'nodemailer'
import { createTransport } from 'nodemailer'
import { prisma } from './prisma'

// Email service configuration
const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
}

// Create reusable transporter
const transporter = createTransport(emailConfig)

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email service configuration error', { error: error.message })
  } else {
    logger.info('Email service ready', { host: emailConfig.host, port: emailConfig.port })
  }
})

// Get UI settings for dynamic colors
async function getUISettings() {
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
    }, {} as Record<string, any>)

    // Default colors if none exist
    const defaultColors = {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      text: '#111827',
      muted: '#6b7280'
    }

    return settings.colors || defaultColors
  } catch (error) {
    logger.warn('Failed to fetch UI settings, using defaults', { error: error instanceof Error ? error.message : 'Unknown error' })
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

// Generate unified email template with Template 9 (Professional Business) design
function generateEmailTemplate(options: {
  title: string
  subtitle: string
  icon: string
  colors: any
  content: string
  footerLinks?: Array<{ text: string; href: string }>
}) {
  const { title, subtitle, icon, colors, content, footerLinks = [] } = options
  
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
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin-bottom: 25px; 
        }
        .info-item { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
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
          margin-bottom: 20px; 
        }
        @media (max-width: 600px) {
          .header { padding: 25px 20px; }
          .content { padding: 25px 20px; }
          .header h1 { font-size: 22px; }
          .info-grid { grid-template-columns: 1fr; }
          .two-column { grid-template-columns: 1fr; }
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

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface OrderNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderStatus: string
  paymentStatus: string
  totalAmount: number
  deliveryDate?: string
  paymentDueDate?: string
  items: Array<{
    productName: string
    portionSize: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  address?: {
    street: string
    city: string
    province: string
    postalCode: string
  }
}

export interface WelcomeEmailData {
  customerName: string
  customerEmail: string
}

export interface PasswordResetData {
  customerName: string
  customerEmail: string
  resetLink: string
  expiresIn: string
}

export interface AccountVerificationData {
  customerName: string
  customerEmail: string
  verificationLink: string
}

/**
 * Generate welcome email template for new users
 */
export async function generateWelcomeEmail(data: WelcomeEmailData): Promise<EmailTemplate> {
  const colors = await getUISettings()
  const subject = `Welcome to Little Harvest, ${data.customerName}!`
  
  const content = `
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
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products">Start Shopping Now</a>
    </div>
  `

  const html = generateEmailTemplate({
    title: 'Welcome to Little Harvest!',
    subtitle: `Hello ${data.customerName}, we're excited to have you join our family!`,
    icon: '🌱',
    colors,
    content,
    footerLinks: [
      { text: 'Website', href: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
      { text: 'Support', href: 'mailto:support@littleharvest.co.za' },
      { text: 'Privacy Policy', href: '#' }
    ]
  })

  const text = `
Welcome to Little Harvest, ${data.customerName}!

Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones.

What you can do with your account:
- Browse our fresh baby food products
- Create and manage your shopping cart
- Set up child profiles with dietary preferences
- Track your orders from preparation to delivery
- Save payment methods for quick checkout
- Manage delivery addresses

Start shopping now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products

Thank you for choosing Little Harvest!
Questions? Contact us at support@littleharvest.co.za
  `

  return { subject, html, text }
}

/**
 * Generate password reset email template
 */
export async function generatePasswordResetEmail(data: PasswordResetData): Promise<EmailTemplate> {
  const colors = await getUISettings()
  const subject = `Reset Your Password - Little Harvest`
  
  const content = `
    <div class="intro">
      We received a request to reset your password for your Little Harvest account. Click the button below to reset your password.
    </div>

    <div class="cta">
      <a href="${data.resetLink}">Reset My Password</a>
    </div>

    <div class="benefits">
      <div class="benefit">
        <div class="benefit-icon">⏰</div>
        <div class="benefit-content">
          <h3>Expires Soon</h3>
          <p>This link will expire in ${data.expiresIn}</p>
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

  const html = generateEmailTemplate({
    title: 'Password Reset Request',
    subtitle: `Hello ${data.customerName}, we received a request to reset your password`,
    icon: '🔐',
    colors,
    content,
    footerLinks: [
      { text: 'Website', href: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
      { text: 'Support', href: 'mailto:support@littleharvest.co.za' },
      { text: 'Privacy Policy', href: '#' }
    ]
  })

  const text = `
Password Reset Request - Little Harvest

Hello ${data.customerName},

We received a request to reset your password for your Little Harvest account.

To reset your password, click the link below:
${data.resetLink}

This link will expire in ${data.expiresIn}.

Security Information:
- This link will expire in ${data.expiresIn}
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you click the link
- For security, this link can only be used once

Need help? Contact us at support@littleharvest.co.za

Thank you for choosing Little Harvest!
  `

  return { subject, html, text }
}

/**
 * Generate account verification email template
 */
export function generateAccountVerificationEmail(data: AccountVerificationData): EmailTemplate {
  const subject = `Verify Your Little Harvest Account`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Account</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .verification { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .cta { text-align: center; margin: 20px 0; }
        .cta a { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Verify Your Account</h1>
          <p>Hello ${data.customerName}, please verify your email address to complete your registration.</p>
        </div>
        
        <div class="content">
          <div class="verification">
            <h2>Email Verification Required</h2>
            <p>To complete your Little Harvest account setup, please verify your email address by clicking the button below.</p>
          </div>

          <div class="cta">
            <a href="${data.verificationLink}">Verify My Email</a>
          </div>

          <p>Once verified, you'll have full access to all Little Harvest features including ordering, tracking, and account management.</p>
        </div>

        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
          <p>Questions? Contact us at support@littleharvest.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Verify Your Account - Little Harvest

Hello ${data.customerName},

To complete your Little Harvest account setup, please verify your email address by clicking the link below:

${data.verificationLink}

Once verified, you'll have full access to all Little Harvest features including ordering, tracking, and account management.

Thank you for choosing Little Harvest!
Questions? Contact us at support@littleharvest.co.za
  `

  return { subject, html, text }
}

/**
 * Generate email template for order confirmation
 */
export async function generateOrderConfirmationEmail(data: OrderNotificationData): Promise<EmailTemplate> {
  const colors = await getUISettings()
  const subject = `Order Confirmation - ${data.orderNumber}`
  
  const content = `
    <div class="intro">
      Thank you for your order! We've received your order and are preparing it for you. Here are your order details:
    </div>

    <div class="main-card">
      <h2>Order Confirmation</h2>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p><strong>Status:</strong> ${data.orderStatus}</p>
      <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
      ${data.deliveryDate ? `<p><strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>` : ''}
      ${data.paymentDueDate ? `<p><strong>Payment Due:</strong> ${new Date(data.paymentDueDate).toLocaleDateString()}</p>` : ''}
    </div>

    <div class="benefits">
      <div class="benefit">
        <div class="benefit-icon">🛒</div>
        <div class="benefit-content">
          <h3>Order Items</h3>
          <p>${data.items.length} products • ${data.items.reduce((sum, item) => sum + item.quantity, 0)} total quantity</p>
        </div>
      </div>
      <div class="benefit">
        <div class="benefit-icon">💰</div>
        <div class="benefit-content">
          <h3>Total Amount</h3>
          <p>R${data.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      ${data.address ? `
      <div class="benefit">
        <div class="benefit-icon">📍</div>
        <div class="benefit-content">
          <h3>Delivery Address</h3>
          <p>${data.address.street}, ${data.address.city}, ${data.address.province} ${data.address.postalCode}</p>
        </div>
      </div>
      ` : ''}
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
          ${data.items.map(item => `
            <tr>
              <td><strong>${item.productName}</strong></td>
              <td>${item.portionSize}</td>
              <td>${item.quantity}</td>
              <td>R${item.unitPrice.toFixed(2)}</td>
              <td><strong>R${item.lineTotal.toFixed(2)}</strong></td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4"><strong>Total</strong></td>
            <td><strong>R${data.totalAmount.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    ${data.paymentStatus === 'PENDING' ? `
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
            <p style="margin: 3px 0;"><strong>Reference:</strong> ${data.orderNumber}</p>
            <p style="margin: 3px 0;"><strong>Amount:</strong> R${data.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
    ` : ''}
  `

  const html = generateEmailTemplate({
    title: 'Order Confirmation',
    subtitle: `Thank you for your order, ${data.customerName}!`,
    icon: '🌱',
    colors,
    content,
    footerLinks: [
      { text: 'Track Order', href: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders` },
      { text: 'Support', href: 'mailto:orders@littleharvest.co.za' },
      { text: 'Website', href: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }
    ]
  })

  const text = `
Order Confirmation - ${data.orderNumber}

Dear ${data.customerName},

Thank you for your order! Here are your order details:

Order Number: ${data.orderNumber}
Status: ${data.orderStatus}
Payment Status: ${data.paymentStatus}
${data.deliveryDate ? `Delivery Date: ${new Date(data.deliveryDate).toLocaleDateString()}` : ''}
${data.paymentDueDate ? `Payment Due: ${new Date(data.paymentDueDate).toLocaleDateString()}` : ''}

Order Items:
${data.items.map(item => `- ${item.productName} (${item.portionSize}) - Qty: ${item.quantity} × R${item.unitPrice.toFixed(2)} = R${item.lineTotal.toFixed(2)}`).join('\n')}

Total: R${data.totalAmount.toFixed(2)}

${data.paymentStatus === 'PENDING' ? `
PAYMENT REQUIRED:
Please make payment within 24 hours to confirm your order.

Bank Details:
Standard Bank
Account: Little Harvest (Pty) Ltd
Account Number: 1234567890
Branch Code: 051001
Reference: ${data.orderNumber}
Amount: R${data.totalAmount.toFixed(2)}
` : ''}

${data.address ? `
Delivery Address:
${data.address.street}
${data.address.city}, ${data.address.province} ${data.address.postalCode}
` : ''}

Thank you for choosing Little Harvest!
Questions? Contact us at orders@littleharvest.co.za
  `

  return { subject, html, text }
}

/**
 * Generate email template for payment confirmation
 */
export function generatePaymentConfirmationEmail(data: OrderNotificationData): EmailTemplate {
  const subject = `Payment Confirmed - Order ${data.orderNumber}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Confirmed</h1>
          <p>Your payment has been received, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <div class="success">
            <h2>🎉 Payment Successful!</h2>
            <p>We have received your payment for order <strong>${data.orderNumber}</strong>.</p>
            <p>Your order is now confirmed and will be prepared for delivery.</p>
          </div>

          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Total Paid:</strong> R${data.totalAmount.toFixed(2)}</p>
            ${data.deliveryDate ? `<p><strong>Expected Delivery:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>` : ''}
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing Tiny Tastes!</p>
          <p>We'll keep you updated on your order progress.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Payment Confirmed - Order ${data.orderNumber}

Dear ${data.customerName},

Great news! We have received your payment for order ${data.orderNumber}.

Payment Details:
- Order Number: ${data.orderNumber}
- Amount Paid: R${data.totalAmount.toFixed(2)}
- Status: Confirmed
${data.deliveryDate ? `- Expected Delivery: ${new Date(data.deliveryDate).toLocaleDateString()}` : ''}

Your order is now confirmed and will be prepared for delivery. We'll keep you updated on the progress.

Thank you for choosing Little Harvest!
Questions? Contact us at orders@littleharvest.co.za
  `

  return { subject, html, text }
}

/**
 * Generate email template for order cancellation
 */
export function generateOrderCancellationEmail(data: OrderNotificationData): EmailTemplate {
  const subject = `Order Cancelled - ${data.orderNumber}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Cancelled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .cancellation { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Order Cancelled</h1>
          <p>Your order has been cancelled, ${data.customerName}</p>
        </div>
        
        <div class="content">
          <div class="cancellation">
            <h2>Order Cancelled</h2>
            <p>Unfortunately, your order <strong>${data.orderNumber}</strong> has been cancelled.</p>
            <p><strong>Reason:</strong> ${data.paymentStatus === 'EXPIRED' ? 'Payment not received within 24 hours' : 'Payment not confirmed'}</p>
          </div>

          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Status:</strong> Cancelled</p>
            <p><strong>Total Amount:</strong> R${data.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div class="footer">
          <p>We're sorry for any inconvenience.</p>
          <p>Please feel free to place a new order when you're ready.</p>
          <p>Questions? Contact us at orders@tinytastes.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Order Cancelled - ${data.orderNumber}

Dear ${data.customerName},

Unfortunately, your order ${data.orderNumber} has been cancelled.

Cancellation Details:
- Order Number: ${data.orderNumber}
- Status: Cancelled
- Reason: ${data.paymentStatus === 'EXPIRED' ? 'Payment not received within 24 hours' : 'Payment not confirmed'}
- Total Amount: R${data.totalAmount.toFixed(2)}

We're sorry for any inconvenience. Please feel free to place a new order when you're ready.

Questions? Contact us at orders@tinytastes.co.za
  `

  return { subject, html, text }
}

/**
 * Send email notification using Nodemailer
 */
export async function sendEmailNotification(
  to: string,
  template: EmailTemplate,
  from?: string
): Promise<boolean> {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      logger.warn('Email service not configured, skipping email send', { to, subject: template.subject })
      return false
    }

    logger.info('Sending email notification', { 
      to, 
      subject: template.subject 
    })

    const mailOptions = {
      from: from || process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    }

    const info = await transporter.sendMail(mailOptions)
    
    logger.info('Email notification sent successfully', { 
      to, 
      subject: template.subject,
      messageId: info.messageId 
    })
    
    return true

  } catch (error) {
    logger.error('Error sending email notification', {
      to,
      subject: template.subject,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}

/**
 * Send order notification email
 */
export async function sendOrderNotification(
  data: OrderNotificationData,
  type: 'confirmation' | 'payment' | 'cancellation'
): Promise<boolean> {
  try {
    let template: EmailTemplate

    switch (type) {
      case 'confirmation':
        template = await generateOrderConfirmationEmail(data)
        break
      case 'payment':
        template = generatePaymentConfirmationEmail(data)
        break
      case 'cancellation':
        template = generateOrderCancellationEmail(data)
        break
      default:
        throw new Error(`Unknown notification type: ${type}`)
    }

    return await sendEmailNotification(data.customerEmail, template)

  } catch (error) {
    logger.error('Error sending order notification', {
      orderNumber: data.orderNumber,
      type,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  try {
    const template = await generateWelcomeEmail(data)
    return await sendEmailNotification(data.customerEmail, template)
  } catch (error) {
    logger.error('Error sending welcome email', {
      customerEmail: data.customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
  try {
    const template = await generatePasswordResetEmail(data)
    return await sendEmailNotification(data.customerEmail, template)
  } catch (error) {
    logger.error('Error sending password reset email', {
      customerEmail: data.customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}

/**
 * Send account verification email
 */
export async function sendAccountVerificationEmail(data: AccountVerificationData): Promise<boolean> {
  try {
    const template = generateAccountVerificationEmail(data)
    return await sendEmailNotification(data.customerEmail, template)
  } catch (error) {
    logger.error('Error sending account verification email', {
      customerEmail: data.customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}
