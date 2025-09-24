import { z } from 'zod'
import { SecurityUtils } from '@/lib/security'

// User and Profile validation with security
export const profileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .refine(val => !SecurityUtils.detectXSS(val), 'Invalid characters detected')
    .transform(val => SecurityUtils.sanitizeText(val)),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .refine(val => !SecurityUtils.detectXSS(val), 'Invalid characters detected')
    .transform(val => SecurityUtils.sanitizeText(val)),
  phone: z.string()
    .optional()
    .refine(val => !val || SecurityUtils.validateSAPhoneNumber(val), 'Invalid phone number')
    .or(z.literal('')),
  childName: z.string()
    .max(50, 'Child name is too long')
    .optional()
    .transform(val => val ? SecurityUtils.sanitizeText(val) : undefined),
  childDob: z.string()
    .optional()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), 'Invalid date format')
    .or(z.literal('')),
})

// Address validation
export const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']),
  street: z.string().min(1, 'Street address is required').max(100, 'Street address is too long'),
  city: z.string().min(1, 'City is required').max(50, 'City name is too long'),
  province: z.string().min(1, 'Province is required').max(50, 'Province name is too long'),
  postalCode: z.string().min(1, 'Postal code is required').max(10, 'Postal code is too long'),
  country: z.string().default('South Africa'),
  isDefault: z.boolean().default(false),
})

// Product validation with security
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name is too long')
    .refine(val => !SecurityUtils.detectXSS(val), 'Invalid characters detected')
    .transform(val => SecurityUtils.sanitizeText(val)),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string()
    .max(500, 'Description is too long')
    .optional()
    .transform(val => val ? SecurityUtils.sanitizeText(val) : undefined),
  ageGroupId: z.string().min(1, 'Age group is required'),
  textureId: z.string().min(1, 'Texture is required'),
  imageUrl: z.string().url('Invalid image URL').nullable().or(z.literal('')).transform(val => val === '' ? null : val),
  contains: z.string()
    .max(500, 'Contains field too long')
    .optional()
    .transform(val => val ? SecurityUtils.sanitizeText(val) : undefined),
  mayContain: z.string()
    .max(500, 'May contain field too long')
    .optional()
    .transform(val => val ? SecurityUtils.sanitizeText(val) : undefined),
  isActive: z.boolean().default(true),
})

// Price validation
export const priceSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  portionSizeId: z.string().min(1, 'Portion size ID is required'),
  amountZar: z.number().min(0.01, 'Price must be greater than 0').max(1000, 'Price is too high'),
})

// Order validation
export const orderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required').refine(
    (date) => {
      const deliveryDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return deliveryDate >= today
    },
    'Delivery date must be today or in the future'
  ),
  notes: z.string().max(500, 'Notes are too long').optional(),
})

// Cart item validation
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  portionSizeId: z.string().min(1, 'Portion size ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
})

// Search validation
export const searchSchema = z.object({
  search: z.string().max(100, 'Search term is too long').optional(),
  age: z.string().optional(),
  texture: z.string().optional(),
  page: z.string().refine(
    (page) => !page || (!isNaN(Number(page)) && Number(page) > 0),
    'Page must be a positive number'
  ).optional(),
})

// Coupon validation
export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(20, 'Coupon code is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  minOrderAmount: z.number().min(0, 'Minimum order amount cannot be negative').optional(),
  maxUses: z.number().int().min(1, 'Max uses must be at least 1').optional(),
  validFrom: z.string().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    'Please enter a valid date'
  ).optional(),
  validUntil: z.string().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    'Please enter a valid date'
  ).optional(),
})

// Package validation
export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(100, 'Package name is too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description is too long').optional(),
})

// Package item validation
export const packageItemSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  portionSizeId: z.string().min(1, 'Portion size ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum quantity is 20'),
})

// Age group validation
export const ageGroupSchema = z.object({
  name: z.string().min(1, 'Age group name is required').max(50, 'Age group name is too long'),
  minMonths: z.number().int().min(0, 'Minimum months cannot be negative').max(120, 'Minimum months is too high'),
  maxMonths: z.number().int().min(1, 'Maximum months must be at least 1').max(120, 'Maximum months is too high'),
}).refine(
  (data) => data.maxMonths > data.minMonths,
  'Maximum months must be greater than minimum months'
)

// Texture validation
export const textureSchema = z.object({
  name: z.string().min(1, 'Texture name is required').max(50, 'Texture name is too long'),
})

// Portion size validation
export const portionSizeSchema = z.object({
  name: z.string().min(1, 'Portion size name is required').max(20, 'Portion size name is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
  measurement: z.string().min(1, 'Measurement is required').max(50, 'Measurement is too long'),
})

// Helper function to validate form data
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['Validation failed'] } }
  }
}
