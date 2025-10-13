import { supabaseAdmin } from './supabaseClient'
import { logger } from './logger'

// Import email services conditionally to avoid initialization errors
let sendEmailNotification: any = null
let sendOrderEmail: any = null
let sendResendEmail: any = null
let sendResendOrder: any = null

try {
  const emailModule = require('./email')
  sendEmailNotification = emailModule.sendEmailNotification
  sendOrderEmail = emailModule.sendOrderNotification
} catch (error) {
  logger.warn('Email service not available', { error: error instanceof Error ? error.message : 'Unknown error' })
}

try {
  const resendModule = require('./email-resend')
  sendResendEmail = resendModule.sendEmailNotification
  sendResendOrder = resendModule.sendOrderNotification
} catch (error) {
  logger.warn('Resend service not available', { error: error instanceof Error ? error.message : 'Unknown error' })
}

export interface NotificationCheckResult {
  enabled: boolean
  reason?: string
}

/**
 * Check if a specific notification type is enabled
 */
export async function isNotificationEnabled(
  notificationType: string,
  userId?: string
): Promise<NotificationCheckResult> {
  try {
    const { data: setting, error } = await supabaseAdmin
      .from('StoreSettings')
      .select('*')
      .eq('category', 'notifications')
      .eq('key', notificationType)
      .eq('isActive', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch notification setting: ${error.message}`)
    }

    if (!setting) {
      return {
        enabled: false,
        reason: `Notification setting '${notificationType}' not found`
      }
    }

    const isEnabled = JSON.parse(setting.value)
    
    return {
      enabled: isEnabled,
      reason: isEnabled ? 'Enabled' : 'Disabled by admin settings'
    }

  } catch (error) {
    logger.error('Error checking notification setting', {
      notificationType,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return {
      enabled: false,
      reason: 'Error checking notification setting'
    }
  }
}

/**
 * Check if email notifications are enabled
 */
export async function isEmailNotificationEnabled(): Promise<NotificationCheckResult> {
  return await isNotificationEnabled('emailNotifications')
}

/**
 * Check if order confirmation emails are enabled
 */
export async function isOrderConfirmationEnabled(): Promise<NotificationCheckResult> {
  const emailEnabled = await isNotificationEnabled('emailNotifications')
  const orderEnabled = await isNotificationEnabled('orderConfirmations')
  
  if (!emailEnabled.enabled) {
    return emailEnabled
  }
  
  if (!orderEnabled.enabled) {
    return orderEnabled
  }
  
  return { enabled: true, reason: 'Order confirmations enabled' }
}

/**
 * Check if delivery update emails are enabled
 */
export async function isDeliveryUpdateEnabled(): Promise<NotificationCheckResult> {
  const emailEnabled = await isNotificationEnabled('emailNotifications')
  const deliveryEnabled = await isNotificationEnabled('deliveryUpdates')
  
  if (!emailEnabled.enabled) {
    return emailEnabled
  }
  
  if (!deliveryEnabled.enabled) {
    return deliveryEnabled
  }
  
  return { enabled: true, reason: 'Delivery updates enabled' }
}

/**
 * Check if marketing emails are enabled
 */
export async function isMarketingEmailEnabled(): Promise<NotificationCheckResult> {
  const emailEnabled = await isNotificationEnabled('emailNotifications')
  const marketingEnabled = await isNotificationEnabled('marketingEmails')
  
  if (!emailEnabled.enabled) {
    return emailEnabled
  }
  
  if (!marketingEnabled.enabled) {
    return marketingEnabled
  }
  
  return { enabled: true, reason: 'Marketing emails enabled' }
}

/**
 * Check if admin notifications are enabled
 */
export async function isAdminNotificationEnabled(notificationType: 'newOrderAlerts' | 'lowStockAlerts' | 'paymentIssueAlerts' | 'systemAlerts'): Promise<NotificationCheckResult> {
  return await isNotificationEnabled(notificationType)
}

/**
 * Send order notification with notification settings check
 */
export async function sendOrderNotificationWithCheck(
  data: any,
  type: 'confirmation' | 'payment' | 'cancellation'
): Promise<{ success: boolean; reason?: string }> {
  try {
    // Check if order confirmations are enabled
    const isEnabled = await isOrderConfirmationEnabled()
    
    if (!isEnabled.enabled) {
      logger.info('Order notification skipped', {
        type,
        reason: isEnabled.reason,
        orderId: data.orderId
      })
      return { success: false, reason: isEnabled.reason }
    }

    // Determine which email service to use
    const useResend = !!process.env.RESEND_API_KEY && sendResendOrder
    const useNodemailer = !!process.env.EMAIL_SERVER_USER && !!process.env.EMAIL_SERVER_PASSWORD && sendOrderEmail

    if (!useResend && !useNodemailer) {
      logger.warn('No email service configured', { type, orderId: data.orderId })
      return { success: false, reason: 'No email service configured' }
    }

    let success = false

    if (useResend) {
      success = await sendResendOrder(data, type)
    } else if (useNodemailer) {
      success = await sendOrderEmail(data, type)
    }

    if (success) {
      logger.info('Order notification sent successfully', {
        type,
        orderId: data.orderId,
        service: useResend ? 'resend' : 'nodemailer'
      })
    }

    return { success, reason: success ? 'Sent successfully' : 'Failed to send' }

  } catch (error) {
    logger.error('Error sending order notification', {
      type,
      orderId: data.orderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return { success: false, reason: 'Error sending notification' }
  }
}

/**
 * Send delivery update notification with settings check
 */
export async function sendDeliveryUpdateWithCheck(
  data: any
): Promise<{ success: boolean; reason?: string }> {
  try {
    const isEnabled = await isDeliveryUpdateEnabled()
    
    if (!isEnabled.enabled) {
      logger.info('Delivery update skipped', {
        reason: isEnabled.reason,
        orderId: data.orderId
      })
      return { success: false, reason: isEnabled.reason }
    }

    // Generate delivery update email template
    const template = {
      subject: `Delivery Update - Order #${data.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Delivery Update</h2>
          <p>Your order #${data.orderId} status has been updated to: <strong>${data.status}</strong></p>
          <p>Estimated delivery: ${data.estimatedDelivery}</p>
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      `,
      text: `Delivery Update - Order #${data.orderId}\n\nStatus: ${data.status}\nEstimated delivery: ${data.estimatedDelivery}\n\nThank you for choosing Little Harvest!`
    }

    // Determine which email service to use
    const useResend = !!process.env.RESEND_API_KEY && sendResendEmail
    const useNodemailer = !!process.env.EMAIL_SERVER_USER && !!process.env.EMAIL_SERVER_PASSWORD && sendEmailNotification

    if (!useResend && !useNodemailer) {
      return { success: false, reason: 'No email service configured' }
    }

    let success = false

    if (useResend) {
      success = await sendResendEmail(data.email, template)
    } else if (useNodemailer) {
      success = await sendEmailNotification(data.email, template)
    }

    return { success, reason: success ? 'Sent successfully' : 'Failed to send' }

  } catch (error) {
    logger.error('Error sending delivery update', {
      orderId: data.orderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return { success: false, reason: 'Error sending notification' }
  }
}

/**
 * Send marketing email with settings check
 */
export async function sendMarketingEmailWithCheck(
  data: any
): Promise<{ success: boolean; reason?: string }> {
  try {
    const isEnabled = await isMarketingEmailEnabled()
    
    if (!isEnabled.enabled) {
      logger.info('Marketing email skipped', {
        reason: isEnabled.reason,
        email: data.email
      })
      return { success: false, reason: isEnabled.reason }
    }

    // Generate marketing email template
    const template = {
      subject: data.subject || 'Special Offer from Little Harvest',
      html: data.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Special Offer!</h2>
          <p>${data.message || 'Check out our latest offers and promotions!'}</p>
          <p>Thank you for being a valued customer!</p>
        </div>
      `,
      text: data.text || data.message || 'Special Offer from Little Harvest!'
    }

    // Determine which email service to use
    const useResend = !!process.env.RESEND_API_KEY && sendResendEmail
    const useNodemailer = !!process.env.EMAIL_SERVER_USER && !!process.env.EMAIL_SERVER_PASSWORD && sendEmailNotification

    if (!useResend && !useNodemailer) {
      return { success: false, reason: 'No email service configured' }
    }

    let success = false

    if (useResend) {
      success = await sendResendEmail(data.email, template)
    } else if (useNodemailer) {
      success = await sendEmailNotification(data.email, template)
    }

    return { success, reason: success ? 'Sent successfully' : 'Failed to send' }

  } catch (error) {
    logger.error('Error sending marketing email', {
      email: data.email,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return { success: false, reason: 'Error sending notification' }
  }
}

/**
 * Send admin notification with settings check
 */
export async function sendAdminNotificationWithCheck(
  notificationType: 'newOrderAlerts' | 'lowStockAlerts' | 'paymentIssueAlerts' | 'systemAlerts',
  data: any
): Promise<{ success: boolean; reason?: string }> {
  try {
    const isEnabled = await isAdminNotificationEnabled(notificationType)
    
    if (!isEnabled.enabled) {
      logger.info('Admin notification skipped', {
        type: notificationType,
        reason: isEnabled.reason
      })
      return { success: false, reason: isEnabled.reason }
    }

    // Generate admin notification email template
    const templates = {
      newOrderAlerts: {
        subject: `New Order Alert - Order #${data.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Order Alert</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Total:</strong> ${data.total}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
        text: `New Order Alert - Order #${data.orderId}\n\nCustomer: ${data.customerName}\nTotal: ${data.total}\nTime: ${new Date().toLocaleString()}`
      },
      lowStockAlerts: {
        subject: `Low Stock Alert - ${data.productName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Low Stock Alert</h2>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Current Stock:</strong> ${data.currentStock}</p>
            <p><strong>Minimum Threshold:</strong> ${data.minThreshold}</p>
            <p>Please restock this item soon.</p>
          </div>
        `,
        text: `Low Stock Alert - ${data.productName}\n\nCurrent Stock: ${data.currentStock}\nMinimum Threshold: ${data.minThreshold}\n\nPlease restock this item soon.`
      },
      paymentIssueAlerts: {
        subject: `Payment Issue Alert - Order #${data.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Issue Alert</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Issue:</strong> ${data.issue}</p>
            <p><strong>Amount:</strong> ${data.amount}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
        text: `Payment Issue Alert - Order #${data.orderId}\n\nIssue: ${data.issue}\nAmount: ${data.amount}\nTime: ${new Date().toLocaleString()}`
      },
      systemAlerts: {
        subject: `System Alert - ${data.alertType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>System Alert</h2>
            <p><strong>Alert Type:</strong> ${data.alertType}</p>
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
        text: `System Alert - ${data.alertType}\n\nMessage: ${data.message}\nTime: ${new Date().toLocaleString()}`
      }
    }

    const template = templates[notificationType]

    // Determine which email service to use
    const useResend = !!process.env.RESEND_API_KEY
    const useNodemailer = !!process.env.EMAIL_SERVER_USER && !!process.env.EMAIL_SERVER_PASSWORD

    if (!useResend && !useNodemailer) {
      return { success: false, reason: 'No email service configured' }
    }

    let success = false

    if (useResend) {
      success = await sendResendEmail(data.adminEmail || process.env.ADMIN_EMAIL, template)
    } else if (useNodemailer) {
      success = await sendEmailNotification(data.adminEmail || process.env.ADMIN_EMAIL, template)
    }

    return { success, reason: success ? 'Sent successfully' : 'Failed to send' }

  } catch (error) {
    logger.error('Error sending admin notification', {
      type: notificationType,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return { success: false, reason: 'Error sending notification' }
  }
}

/**
 * Test email service with notification settings
 */
export async function testEmailServiceWithSettings(): Promise<{ success: boolean; reason?: string }> {
  try {
    const isEnabled = await isEmailNotificationEnabled()
    
    if (!isEnabled.enabled) {
      return { success: false, reason: isEnabled.reason }
    }

    const testTemplate = {
      subject: 'Email Service Test - Little Harvest',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you received this email, the notification system is working properly!</p>
        </div>
      `,
      text: 'Email Service Test - Little Harvest\n\nThis is a test email to verify that the email service is working correctly.\n\nTime: ' + new Date().toLocaleString() + '\n\nIf you received this email, the notification system is working properly!'
    }

    // Determine which email service to use
    const useResend = !!process.env.RESEND_API_KEY
    const useNodemailer = !!process.env.EMAIL_SERVER_USER && !!process.env.EMAIL_SERVER_PASSWORD

    if (!useResend && !useNodemailer) {
      return { success: false, reason: 'No email service configured' }
    }

    let success = false

    if (useResend) {
      success = await sendResendEmail(process.env.ADMIN_EMAIL || 'admin@tinytastes.co.za', testTemplate)
    } else if (useNodemailer) {
      success = await sendEmailNotification(process.env.ADMIN_EMAIL || 'admin@tinytastes.co.za', testTemplate)
    }

    return { success, reason: success ? 'Test email sent successfully' : 'Failed to send test email' }

  } catch (error) {
    logger.error('Error testing email service', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return { success: false, reason: 'Error testing email service' }
  }
}
