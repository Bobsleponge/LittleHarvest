import { Resend } from 'resend'
import { logger } from './logger'

// Initialize Resend client only if API key is available
let resend: Resend | null = null

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
} else {
  logger.warn('Resend API key not configured, email functionality will be disabled')
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

/**
 * Generate welcome email template for new users
 */
export async function generateWelcomeEmail(data: WelcomeEmailData): Promise<EmailTemplate> {
  const subject = `Welcome to Little Harvest, ${data.customerName}!`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Little Harvest</title>
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
          background: linear-gradient(135deg, #10b981, #059669); 
          color: white; 
          padding: 35px 40px; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 26px; 
          font-weight: 600; 
        }
        .content { 
          padding: 40px; 
        }
        .intro { 
          font-size: 16px; 
          line-height: 1.6; 
          color: #111827; 
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
        .cta { 
          text-align: center; 
          margin: 40px 0; 
        }
        .cta a { 
          background: #10b981; 
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
          color: #6b7280; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Little Harvest!</h1>
          <p>Hello ${data.customerName}, we're excited to have you join our family!</p>
        </div>
        
        <div class="content">
          <div class="intro">
            Thank you for joining Little Harvest! We're excited to partner with you in providing the best nutrition for your little ones through our premium organic baby food delivery service.
          </div>

          <div class="benefits">
            <div class="benefit">
              <div class="benefit-icon">🍼</div>
              <div>
                <h3>Premium Fresh Products</h3>
                <p>Carefully curated selection of organic baby foods made with the finest ingredients</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">🛒</div>
              <div>
                <h3>Streamlined Shopping Experience</h3>
                <p>Intuitive cart management and easy reordering for your convenience</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">👶</div>
              <div>
                <h3>Personalized Child Profiles</h3>
                <p>Customize dietary preferences and allergies for tailored recommendations</p>
              </div>
            </div>
          </div>

          <div class="cta">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products">Start Shopping Now</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Little Harvest!</strong></p>
          <p>Questions? Contact us at support@littleharvest.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `

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
 * Generate order confirmation email template
 */
export async function generateOrderConfirmationEmail(data: OrderNotificationData): Promise<EmailTemplate> {
  const subject = `Order Confirmation - ${data.orderNumber}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .order-details { background: white; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .items-table th { background: #f8fafc; font-weight: 600; color: #111827; }
        .total-row { background: #10b98108; font-weight: 600; color: #10b981; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f3f4f6; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Status:</strong> ${data.orderStatus}</p>
            <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
            ${data.deliveryDate ? `<p><strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>` : ''}
            
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
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Little Harvest!</strong></p>
          <p>Questions? Contact us at orders@littleharvest.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Order Confirmation - ${data.orderNumber}

Dear ${data.customerName},

Thank you for your order! Here are your order details:

Order Number: ${data.orderNumber}
Status: ${data.orderStatus}
Payment Status: ${data.paymentStatus}
${data.deliveryDate ? `Delivery Date: ${new Date(data.deliveryDate).toLocaleDateString()}` : ''}

Order Items:
${data.items.map(item => `- ${item.productName} (${item.portionSize}) - Qty: ${item.quantity} × R${item.unitPrice.toFixed(2)} = R${item.lineTotal.toFixed(2)}`).join('\n')}

Total: R${data.totalAmount.toFixed(2)}

Thank you for choosing Little Harvest!
Questions? Contact us at orders@littleharvest.co.za
  `

  return { subject, html, text }
}

/**
 * Send email notification using Resend
 */
export async function sendEmailNotification(
  to: string,
  template: EmailTemplate,
  from?: string
): Promise<boolean> {
  try {
    // Check if Resend is configured
    if (!resend) {
      logger.warn('Resend API key not configured, skipping email send', { to, subject: template.subject })
      return false
    }

    logger.info('Sending email notification via Resend', { 
      to, 
      subject: template.subject 
    })

    const { data, error } = await resend.emails.send({
      from: from || process.env.RESEND_FROM || 'Little Harvest <noreply@littleharvest.co.za>',
      to: [to],
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (error) {
      logger.error('Resend email error', { error, to, subject: template.subject })
      return false
    }

    logger.info('Email notification sent successfully via Resend', { 
      to, 
      subject: template.subject,
      messageId: data?.id 
    })
    
    return true

  } catch (error) {
    logger.error('Error sending email notification via Resend', {
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
        template = await generateOrderConfirmationEmail(data) // Simplified for now
        break
      case 'cancellation':
        template = await generateOrderConfirmationEmail(data) // Simplified for now
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
export async function sendPasswordResetEmail({
  customerName,
  customerEmail,
  resetToken
}: {
  customerName: string
  customerEmail: string
  resetToken: string
}): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    const subject = `Reset Your Password - Little Harvest`
    
    const template: EmailTemplate = {
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .cta { text-align: center; margin: 20px 0; }
            .cta a { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
              <p>Hello ${customerName}, please reset your password</p>
            </div>
            
            <div class="content">
              <p>We received a request to reset your password for your Little Harvest account.</p>
              <p>Click the button below to reset your password:</p>
              
              <div class="cta">
                <a href="${resetUrl}">Reset My Password</a>
              </div>
              
              <p>This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
            </div>

            <div class="footer">
              <p>Thank you for choosing Little Harvest!</p>
              <p>Questions? Contact us at support@littleharvest.co.za</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your Password - Little Harvest

Hello ${customerName},

We received a request to reset your password for your Little Harvest account.

To reset your password, click the link below:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Thank you for choosing Little Harvest!
Questions? Contact us at support@littleharvest.co.za
      `
    }

    return await sendEmailNotification(customerEmail, template)
  } catch (error) {
    logger.error('Error sending password reset email', {
      customerEmail,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    return false
  }
}
