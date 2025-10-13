#!/usr/bin/env tsx

/**
 * Supabase Migration Verification Test Suite
 * 
 * This script tests all critical Supabase functionality to ensure the migration
 * from Prisma to Supabase is complete and working correctly.
 * 
 * Tests include:
 * - Database connection and authentication
 * - CRUD operations for all core tables
 * - Supabase Auth functionality
 * - Row Level Security (RLS) policies
 * - Data integrity and relationships
 * 
 * Usage: tsx scripts/supabase-verification.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blvyyxkoxcrlgxggkqle.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdnl5eGtveGNybGd4Z2drcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTQxMDEsImV4cCI6MjA3NTgzMDEwMX0.2yqNHjmCpju2ZsZ4YbgnUYHTH2xoVqHhHZf16TkRDxg'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error(`${colors.red}❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables${colors.reset}`)
  process.exit(1)
}

// Initialize Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test results tracking
interface TestResult {
  name: string
  status: 'PASSED' | 'FAILED' | 'SKIPPED'
  message: string
  duration: number
  error?: string
}

const testResults: TestResult[] = []
let totalTests = 0
let passedTests = 0
let failedTests = 0

// Utility functions
function log(message: string, color: string = colors.white) {
  console.log(`${color}${message}${colors.reset}`)
}

function logTest(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED', message: string, duration: number, error?: string) {
  const statusColor = status === 'PASSED' ? colors.green : status === 'FAILED' ? colors.red : colors.yellow
  const statusIcon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⏭️'
  
  log(`${statusIcon} ${testName}: ${message} (${duration}ms)`, statusColor)
  
  testResults.push({
    name: testName,
    status,
    message,
    duration,
    error
  })
  
  totalTests++
  if (status === 'PASSED') passedTests++
  if (status === 'FAILED') failedTests++
}

async function runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now()
  try {
    await testFn()
    const duration = Date.now() - startTime
    logTest(testName, 'PASSED', 'Test completed successfully', duration)
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logTest(testName, 'FAILED', `Test failed: ${errorMessage}`, duration, errorMessage)
  }
}

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
}

const testProduct = {
  name: `Test Product ${Date.now()}`,
  slug: `test-product-${Date.now()}`,
  description: 'Test product description',
  ageGroupId: 'cmgn8s0100001jeskej8ffhhi', // 6-8 months
  textureId: 'cmgn8s01q0004jeskhqomfmzv', // Puree
  contains: 'test ingredients',
  mayContain: 'test allergens',
  imageUrl: '/test-image.jpg',
  isActive: true
}

const testOrder = {
  orderNumber: `TEST-${Date.now()}`,
  status: 'PENDING',
  paymentStatus: 'PENDING',
  totalZar: 100,
  notes: 'Test order',
  deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  paymentDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
}

// Test functions
async function testDatabaseConnection() {
  const { data, error } = await supabaseAdmin.from('User').select('count').limit(1)
  if (error) throw new Error(`Database connection failed: ${error.message}`)
}

async function testSupabaseAuth() {
  // Test sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testUser.email,
    password: testUser.password,
    options: {
      data: {
        name: testUser.name
      }
    }
  })
  
  if (signUpError) throw new Error(`Sign up failed: ${signUpError.message}`)
  
  // Test sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testUser.email,
    password: testUser.password
  })
  
  if (signInError) throw new Error(`Sign in failed: ${signInError.message}`)
  
  // Test get user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError) throw new Error(`Get user failed: ${userError.message}`)
  
  // Test sign out
  const { error: signOutError } = await supabase.auth.signOut()
  
  if (signOutError) throw new Error(`Sign out failed: ${signOutError.message}`)
}

async function testUserCRUD() {
  // Create user
  const { data: createData, error: createError } = await supabaseAdmin
    .from('User')
    .insert([{
      name: testUser.name,
      email: testUser.email,
      role: 'CUSTOMER',
      emailVerified: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (createError) throw new Error(`User creation failed: ${createError.message}`)
  
  const userId = createData.id
  
  // Read user
  const { data: readData, error: readError } = await supabaseAdmin
    .from('User')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (readError) throw new Error(`User read failed: ${readError.message}`)
  
  // Update user
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from('User')
    .update({ name: 'Updated Test User' })
    .eq('id', userId)
    .select()
    .single()
  
  if (updateError) throw new Error(`User update failed: ${updateError.message}`)
  
  // Delete user
  const { error: deleteError } = await supabaseAdmin
    .from('User')
    .delete()
    .eq('id', userId)
  
  if (deleteError) throw new Error(`User deletion failed: ${deleteError.message}`)
}

async function testProductCRUD() {
  // Create product
  const { data: createData, error: createError } = await supabaseAdmin
    .from('Product')
    .insert([testProduct])
    .select()
    .single()
  
  if (createError) throw new Error(`Product creation failed: ${createError.message}`)
  
  const productId = createData.id
  
  // Read product with relationships
  const { data: readData, error: readError } = await supabaseAdmin
    .from('Product')
    .select(`
      *,
      ageGroup:AgeGroup(*),
      texture:Texture(*),
      prices:Price(
        *,
        portionSize:PortionSize(*)
      )
    `)
    .eq('id', productId)
    .single()
  
  if (readError) throw new Error(`Product read failed: ${readError.message}`)
  
  // Update product
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from('Product')
    .update({ name: 'Updated Test Product' })
    .eq('id', productId)
    .select()
    .single()
  
  if (updateError) throw new Error(`Product update failed: ${updateError.message}`)
  
  // Delete product
  const { error: deleteError } = await supabaseAdmin
    .from('Product')
    .delete()
    .eq('id', productId)
  
  if (deleteError) throw new Error(`Product deletion failed: ${deleteError.message}`)
}

async function testOrderCRUD() {
  // First create a test user for the order
  const { data: userData, error: userError } = await supabaseAdmin
    .from('User')
    .insert([{
      name: 'Order Test User',
      email: `order-test-${Date.now()}@example.com`,
      role: 'CUSTOMER',
      emailVerified: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (userError) throw new Error(`Test user creation failed: ${userError.message}`)
  
  const userId = userData.id
  
  // Create order
  const { data: createData, error: createError } = await supabaseAdmin
    .from('Order')
    .insert([{
      ...testOrder,
      userId
    }])
    .select()
    .single()
  
  if (createError) throw new Error(`Order creation failed: ${createError.message}`)
  
  const orderId = createData.id
  
  // Read order with relationships
  const { data: readData, error: readError } = await supabaseAdmin
    .from('Order')
    .select(`
      *,
      items:OrderItem(
        *,
        product:Product(
          *,
          ageGroup:AgeGroup(*),
          texture:Texture(*)
        ),
        portionSize:PortionSize(*),
        package:Package(*)
      ),
      address:Address(*),
      user:User(id, name, email)
    `)
    .eq('id', orderId)
    .single()
  
  if (readError) throw new Error(`Order read failed: ${readError.message}`)
  
  // Update order
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from('Order')
    .update({ status: 'CONFIRMED' })
    .eq('id', orderId)
    .select()
    .single()
  
  if (updateError) throw new Error(`Order update failed: ${updateError.message}`)
  
  // Clean up: Delete order and user
  await supabaseAdmin.from('Order').delete().eq('id', orderId)
  await supabaseAdmin.from('User').delete().eq('id', userId)
}

async function testInventoryCRUD() {
  // First create a test product
  const { data: productData, error: productError } = await supabaseAdmin
    .from('Product')
    .insert([testProduct])
    .select()
    .single()
  
  if (productError) throw new Error(`Test product creation failed: ${productError.message}`)
  
  const productId = productData.id
  
  // Get a portion size
  const { data: portionSizeData, error: portionSizeError } = await supabaseAdmin
    .from('PortionSize')
    .select('*')
    .limit(1)
    .single()
  
  if (portionSizeError) throw new Error(`Portion size fetch failed: ${portionSizeError.message}`)
  
  const portionSizeId = portionSizeData.id
  
  // Create inventory
  const { data: createData, error: createError } = await supabaseAdmin
    .from('Inventory')
    .insert([{
      productId,
      portionSizeId,
      currentStock: 100,
      reservedStock: 0,
      weeklyLimit: 50,
      lastRestocked: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (createError) throw new Error(`Inventory creation failed: ${createError.message}`)
  
  const inventoryId = createData.id
  
  // Read inventory with relationships
  const { data: readData, error: readError } = await supabaseAdmin
    .from('Inventory')
    .select(`
      *,
      product:Product(*),
      portionSize:PortionSize(*)
    `)
    .eq('id', inventoryId)
    .single()
  
  if (readError) throw new Error(`Inventory read failed: ${readError.message}`)
  
  // Update inventory
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from('Inventory')
    .update({ currentStock: 150 })
    .eq('id', inventoryId)
    .select()
    .single()
  
  if (updateError) throw new Error(`Inventory update failed: ${updateError.message}`)
  
  // Clean up: Delete inventory and product
  await supabaseAdmin.from('Inventory').delete().eq('id', inventoryId)
  await supabaseAdmin.from('Product').delete().eq('id', productId)
}

async function testStoreSettingsCRUD() {
  // Create setting
  const { data: createData, error: createError } = await supabaseAdmin
    .from('StoreSettings')
    .insert([{
      category: 'test',
      key: `test-key-${Date.now()}`,
      value: '"test value"',
      description: 'Test setting',
      isActive: true,
      updatedBy: 'test-script'
    }])
    .select()
    .single()
  
  if (createError) throw new Error(`Store setting creation failed: ${createError.message}`)
  
  const settingId = createData.id
  
  // Read setting
  const { data: readData, error: readError } = await supabaseAdmin
    .from('StoreSettings')
    .select('*')
    .eq('id', settingId)
    .single()
  
  if (readError) throw new Error(`Store setting read failed: ${readError.message}`)
  
  // Update setting
  const { data: updateData, error: updateError } = await supabaseAdmin
    .from('StoreSettings')
    .update({ value: '"updated test value"' })
    .eq('id', settingId)
    .select()
    .single()
  
  if (updateError) throw new Error(`Store setting update failed: ${updateError.message}`)
  
  // Clean up: Delete setting
  await supabaseAdmin.from('StoreSettings').delete().eq('id', settingId)
}

async function testDataIntegrity() {
  // Test foreign key relationships
  const { data: products, error: productsError } = await supabaseAdmin
    .from('Product')
    .select(`
      *,
      ageGroup:AgeGroup(*),
      texture:Texture(*),
      prices:Price(
        *,
        portionSize:PortionSize(*)
      )
    `)
    .limit(5)
  
  if (productsError) throw new Error(`Data integrity test failed: ${productsError.message}`)
  
  // Verify relationships exist
  for (const product of products || []) {
    if (!product.ageGroup) throw new Error(`Product ${product.id} missing ageGroup relationship`)
    if (!product.texture) throw new Error(`Product ${product.id} missing texture relationship`)
  }
}

async function testRowLevelSecurity() {
  // Test that RLS is enabled by trying to access data without proper authentication
  const { data, error } = await supabase.from('User').select('*').limit(1)
  
  // RLS should prevent this query from returning data
  if (!error && data && data.length > 0) {
    throw new Error('RLS may not be properly configured - unauthenticated access to User table succeeded')
  }
}

async function testUUIDGeneration() {
  // Test that UUIDs are being generated for new records
  const { data: userData, error: userError } = await supabaseAdmin
    .from('User')
    .insert([{
      name: 'UUID Test User',
      email: `uuid-test-${Date.now()}@example.com`,
      role: 'CUSTOMER',
      emailVerified: new Date().toISOString()
    }])
    .select('id')
    .single()
  
  if (userError) throw new Error(`UUID test user creation failed: ${userError.message}`)
  
  // Check if ID is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userData.id)) {
    throw new Error(`Generated ID is not a valid UUID: ${userData.id}`)
  }
  
  // Clean up
  await supabaseAdmin.from('User').delete().eq('id', userData.id)
}

// Main test runner
async function runAllTests() {
  log(`${colors.cyan}${colors.bright}🧪 Starting Supabase Migration Verification Tests${colors.reset}`)
  log(`${colors.cyan}================================================${colors.reset}`)
  
  // Database connection tests
  await runTest('Database Connection', testDatabaseConnection)
  
  // Authentication tests
  await runTest('Supabase Authentication', testSupabaseAuth)
  
  // CRUD operation tests
  await runTest('User CRUD Operations', testUserCRUD)
  await runTest('Product CRUD Operations', testProductCRUD)
  await runTest('Order CRUD Operations', testOrderCRUD)
  await runTest('Inventory CRUD Operations', testInventoryCRUD)
  await runTest('Store Settings CRUD Operations', testStoreSettingsCRUD)
  
  // Data integrity tests
  await runTest('Data Integrity & Relationships', testDataIntegrity)
  
  // Security tests
  await runTest('Row Level Security (RLS)', testRowLevelSecurity)
  
  // UUID generation tests
  await runTest('UUID Generation', testUUIDGeneration)
  
  // Print summary
  log(`\n${colors.cyan}${colors.bright}📊 Test Summary${colors.reset}`)
  log(`${colors.cyan}================${colors.reset}`)
  log(`Total Tests: ${totalTests}`)
  log(`✅ Passed: ${colors.green}${passedTests}${colors.reset}`)
  log(`❌ Failed: ${colors.red}${failedTests}${colors.reset}`)
  log(`⏭️ Skipped: ${colors.yellow}${totalTests - passedTests - failedTests}${colors.reset}`)
  
  // Print detailed results
  if (failedTests > 0) {
    log(`\n${colors.red}${colors.bright}❌ Failed Tests:${colors.reset}`)
    testResults
      .filter(result => result.status === 'FAILED')
      .forEach(result => {
        log(`  • ${result.name}: ${result.error}`, colors.red)
      })
  }
  
  // Print success message
  if (failedTests === 0) {
    log(`\n${colors.green}${colors.bright}🎉 All tests passed! Supabase migration is complete and working correctly.${colors.reset}`)
  } else {
    log(`\n${colors.red}${colors.bright}⚠️ ${failedTests} test(s) failed. Please review and fix the issues above.${colors.reset}`)
  }
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0)
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  log(`\n${colors.red}❌ Unhandled Rejection at: ${promise}, reason: ${reason}${colors.reset}`)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  log(`\n${colors.red}❌ Uncaught Exception: ${error.message}${colors.reset}`)
  process.exit(1)
})

// Run the tests
runAllTests().catch((error) => {
  log(`\n${colors.red}❌ Test runner failed: ${error.message}${colors.reset}`)
  process.exit(1)
})
