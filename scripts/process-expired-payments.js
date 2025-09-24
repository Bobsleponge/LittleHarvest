#!/usr/bin/env node

/**
 * Script to process expired payments
 * This should be run periodically (e.g., every hour) via cron job or task scheduler
 * 
 * Usage:
 *   node scripts/process-expired-payments.js
 * 
 * Cron example (every hour):
 *   0 * * * * cd /path/to/tiny-tastes && node scripts/process-expired-payments.js
 */

const { PrismaClient } = require('@prisma/client')
const { processExpiredPayments, getPaymentStatistics } = require('../src/lib/payment-timeout')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting expired payment processing...')
    console.log('Time:', new Date().toISOString())

    // Process expired payments
    const result = await processExpiredPayments()
    
    // Get updated statistics
    const statistics = await getPaymentStatistics()

    console.log('Processing completed:')
    console.log(`- Processed: ${result.processed} orders`)
    console.log(`- Errors: ${result.errors}`)
    console.log('Payment statistics:')
    console.log(`- Pending: ${statistics.pending}`)
    console.log(`- Paid: ${statistics.paid}`)
    console.log(`- Unpaid: ${statistics.unpaid}`)
    console.log(`- Expired: ${statistics.expired}`)
    console.log(`- Total: ${statistics.total}`)

    if (result.errors > 0) {
      console.error(`Warning: ${result.errors} errors occurred during processing`)
      process.exit(1)
    }

    console.log('Expired payment processing completed successfully')
    process.exit(0)

  } catch (error) {
    console.error('Error in expired payment processing:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()
