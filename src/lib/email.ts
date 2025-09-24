import { logger } from '@/lib/logger'

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

/**
 * Generate email template for order confirmation
 */
export function generateOrderConfirmationEmail(data: OrderNotificationData): EmailTemplate {
  const subject = `Order Confirmation - ${data.orderNumber}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #059669; }
        .payment-info { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍼 Order Confirmation</h1>
          <p>Thank you for your order, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Status:</strong> ${data.orderStatus}</p>
            <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
            ${data.deliveryDate ? `<p><strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>` : ''}
            ${data.paymentDueDate ? `<p><strong>Payment Due:</strong> ${new Date(data.paymentDueDate).toLocaleDateString()}</p>` : ''}
          </div>

          <div class="order-details">
            <h3>Order Items</h3>
            ${data.items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong> - ${item.portionSize}<br>
                Quantity: ${item.quantity} × R${item.unitPrice.toFixed(2)} = R${item.lineTotal.toFixed(2)}
              </div>
            `).join('')}
            <div class="total">
              Total: R${data.totalAmount.toFixed(2)}
            </div>
          </div>

          ${data.paymentStatus === 'PENDING' ? `
            <div class="payment-info">
              <h3>💳 Payment Required</h3>
              <p>Please make payment within 24 hours to confirm your order.</p>
              <p><strong>Bank Details:</strong></p>
              <p>Standard Bank<br>
              Account: Tiny Tastes (Pty) Ltd<br>
              Account Number: 1234567890<br>
              Branch Code: 051001<br>
              Reference: ${data.orderNumber}</p>
              <p><strong>Amount:</strong> R${data.totalAmount.toFixed(2)}</p>
            </div>
          ` : ''}

          ${data.address ? `
            <div class="order-details">
              <h3>Delivery Address</h3>
              <p>${data.address.street}<br>
              ${data.address.city}, ${data.address.province} ${data.address.postalCode}</p>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Thank you for choosing Tiny Tastes!</p>
          <p>Questions? Contact us at orders@tinytastes.co.za</p>
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
${data.paymentDueDate ? `Payment Due: ${new Date(data.paymentDueDate).toLocaleDateString()}` : ''}

Order Items:
${data.items.map(item => `- ${item.productName} (${item.portionSize}) - Qty: ${item.quantity} × R${item.unitPrice.toFixed(2)} = R${item.lineTotal.toFixed(2)}`).join('\n')}

Total: R${data.totalAmount.toFixed(2)}

${data.paymentStatus === 'PENDING' ? `
PAYMENT REQUIRED:
Please make payment within 24 hours to confirm your order.

Bank Details:
Standard Bank
Account: Tiny Tastes (Pty) Ltd
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

Thank you for choosing Tiny Tastes!
Questions? Contact us at orders@tinytastes.co.za
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

Thank you for choosing Tiny Tastes!
Questions? Contact us at orders@tinytastes.co.za
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
 * Send email notification (placeholder - integrate with your email service)
 */
export async function sendEmailNotification(
  to: string,
  template: EmailTemplate
): Promise<boolean> {
  try {
    logger.info('Sending email notification', { 
      to, 
      subject: template.subject 
    })

    // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log the email content
    logger.info('Email content', {
      to,
      subject: template.subject,
      htmlLength: template.html.length,
      textLength: template.text.length
    })

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100))

    logger.info('Email notification sent successfully', { to })
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
        template = generateOrderConfirmationEmail(data)
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
