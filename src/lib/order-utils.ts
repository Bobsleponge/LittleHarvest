import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Generate a unique order number
 * Format: TT-YYYYMMDD-XXXX (e.g., TT-20241201-0001)
 */
export async function generateOrderNumber(): Promise<string> {
  try {
    const today = new Date()
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // Find the highest order number for today
    const todayPrefix = `TT-${dateString}-`
    
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: todayPrefix
        }
      },
      orderBy: {
        orderNumber: 'desc'
      }
    })

    let sequenceNumber = 1
    if (lastOrder) {
      // Extract sequence number from last order
      const lastSequence = lastOrder.orderNumber.split('-')[2]
      sequenceNumber = parseInt(lastSequence, 10) + 1
    }

    const orderNumber = `${todayPrefix}${sequenceNumber.toString().padStart(4, '0')}`
    
    logger.info('Order number generated', { orderNumber })
    return orderNumber
  } catch (error) {
    logger.error('Error generating order number', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error)
    
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-8)
    return `TT-${timestamp}`
  }
}

/**
 * Calculate payment due date (24 hours from now)
 */
export function calculatePaymentDueDate(): Date {
  const dueDate = new Date()
  dueDate.setHours(dueDate.getHours() + 24)
  return dueDate
}

/**
 * Check if payment is overdue
 */
export function isPaymentOverdue(paymentDueDate: Date): boolean {
  return new Date() > paymentDueDate
}

/**
 * Get bank details for payment
 */
export function getBankDetails() {
  return {
    bankName: 'Standard Bank',
    accountName: 'Tiny Tastes (Pty) Ltd',
    accountNumber: '1234567890',
    branchCode: '051001',
    reference: 'Use your order number as reference',
    instructions: [
      'Please use your order number as the payment reference',
      'Payment must be made within 24 hours of order placement',
      'Send proof of payment to orders@tinytastes.co.za',
      'Your order will be confirmed once payment is verified'
    ]
  }
}

/**
 * Get order status display information
 */
export function getOrderStatusInfo(status: string) {
  const statusMap: Record<string, { label: string; color: string; description: string }> = {
    PENDING: {
      label: 'Pending Payment',
      color: 'yellow',
      description: 'Waiting for payment confirmation'
    },
    PAID: {
      label: 'Payment Confirmed',
      color: 'green',
      description: 'Payment received, order confirmed'
    },
    UNPAID: {
      label: 'Payment Overdue',
      color: 'red',
      description: 'Payment not received within 24 hours'
    },
    EXPIRED: {
      label: 'Order Expired',
      color: 'red',
      description: 'Order cancelled due to non-payment'
    },
    CONFIRMED: {
      label: 'Confirmed',
      color: 'blue',
      description: 'Order confirmed and being prepared'
    },
    PREPARING: {
      label: 'Preparing',
      color: 'blue',
      description: 'Your order is being prepared'
    },
    READY: {
      label: 'Ready',
      color: 'green',
      description: 'Order is ready for pickup/delivery'
    },
    OUT_FOR_DELIVERY: {
      label: 'Out for Delivery',
      color: 'blue',
      description: 'Your order is on its way'
    },
    DELIVERED: {
      label: 'Delivered',
      color: 'green',
      description: 'Order has been delivered'
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'red',
      description: 'Order has been cancelled'
    }
  }

  return statusMap[status] || {
    label: status,
    color: 'gray',
    description: 'Unknown status'
  }
}

/**
 * Get payment status display information
 */
export function getPaymentStatusInfo(paymentStatus: string) {
  const statusMap: Record<string, { label: string; color: string; description: string }> = {
    PENDING: {
      label: 'Pending',
      color: 'yellow',
      description: 'Awaiting payment'
    },
    PAID: {
      label: 'Paid',
      color: 'green',
      description: 'Payment confirmed'
    },
    UNPAID: {
      label: 'Unpaid',
      color: 'red',
      description: 'Payment not received'
    },
    EXPIRED: {
      label: 'Expired',
      color: 'red',
      description: 'Payment deadline exceeded'
    }
  }

  return statusMap[paymentStatus] || {
    label: paymentStatus,
    color: 'gray',
    description: 'Unknown payment status'
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Format date for display (date only)
 */
export function formatDateOnly(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}
