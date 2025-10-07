import Joi from 'joi'
import { SecurityUtils } from './security'

// Enhanced validation schemas using Joi for better security
export const validationSchemas = {
  // User profile validation with comprehensive security
  profile: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .custom((value, helpers) => {
        if (SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return SecurityUtils.sanitizeText(value)
      })
      .messages({
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    lastName: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .custom((value, helpers) => {
        if (SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return SecurityUtils.sanitizeText(value)
      })
      .messages({
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    phone: Joi.string()
      .pattern(/^(\+27|0)[6-8][0-9]{8}$/)
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid South African phone number'
      }),
    
    childName: Joi.string()
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Child name can only contain letters, spaces, hyphens, and apostrophes',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    childDob: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .custom((value, helpers) => {
        if (value) {
          const date = new Date(value)
          const today = new Date()
          if (date > today) {
            return helpers.error('date.future')
          }
          // Check if child is older than 18 years
          const ageInYears = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          if (ageInYears > 18) {
            return helpers.error('date.tooOld')
          }
        }
        return value
      })
      .allow('')
      .optional()
      .messages({
        'string.pattern.base': 'Please enter date in YYYY-MM-DD format',
        'date.future': 'Birth date cannot be in the future',
        'date.tooOld': 'Child must be under 18 years old'
      })
  }),

  // Address validation with security
  address: Joi.object({
    type: Joi.string()
      .valid('SHIPPING', 'BILLING')
      .required(),
    
    street: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z0-9\s\-#.,/]+$/)
      .custom((value, helpers) => {
        if (SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return SecurityUtils.sanitizeText(value)
      })
      .messages({
        'string.pattern.base': 'Street address contains invalid characters',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    city: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .custom((value, helpers) => {
        if (SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return SecurityUtils.sanitizeText(value)
      })
      .messages({
        'string.pattern.base': 'City name can only contain letters, spaces, hyphens, and apostrophes',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    province: Joi.string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .custom((value, helpers) => {
        if (SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return SecurityUtils.sanitizeText(value)
      })
      .messages({
        'string.pattern.base': 'Province name can only contain letters, spaces, hyphens, and apostrophes',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    postalCode: Joi.string()
      .min(1)
      .max(10)
      .pattern(/^[0-9]{4}$/)
      .messages({
        'string.pattern.base': 'Postal code must be 4 digits'
      }),
    
    country: Joi.string()
      .default('South Africa')
      .valid('South Africa'),
    
    isDefault: Joi.boolean()
      .default(false)
  }),

  // Product validation with enhanced security
  product: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z0-9\s\-&.,()]+$/)
      .custom((value, helpers) => {
        if (SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return SecurityUtils.sanitizeText(value)
      })
      .messages({
        'string.pattern.base': 'Product name contains invalid characters',
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    slug: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-z0-9-]+$/)
      .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
      }),
    
    description: Joi.string()
      .max(500)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .allow('')
      .optional()
      .messages({
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    ageGroupId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid age group ID format'
      }),
    
    textureId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid texture ID format'
      }),
    
    imageUrl: Joi.string()
      .uri()
      .custom((value, helpers) => {
        if (value && !SecurityUtils.validateURL(value)) {
          return helpers.error('string.invalidUrl')
        }
        return value
      })
      .allow('')
      .optional()
      .messages({
        'string.uri': 'Invalid image URL format',
        'string.invalidUrl': 'Invalid or potentially malicious URL'
      }),
    
    contains: Joi.string()
      .max(500)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .allow('')
      .optional()
      .messages({
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    mayContain: Joi.string()
      .max(500)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .allow('')
      .optional()
      .messages({
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    isActive: Joi.boolean()
      .default(true)
  }),

  // Order validation with security
  order: Joi.object({
    items: Joi.array()
      .items(Joi.object({
        productId: Joi.string().uuid().required(),
        portionSizeId: Joi.string().uuid().required(),
        packageId: Joi.string().uuid().optional(),
        quantity: Joi.number().integer().min(1).max(10).required()
      }))
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'array.max': 'Maximum 20 items per order'
      }),
    
    addressId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Invalid address ID format'
      }),
    
    deliveryDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .custom((value, helpers) => {
        if (value) {
          const deliveryDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          if (deliveryDate < today) {
            return helpers.error('date.past')
          }
          
          // Check if delivery date is too far in the future (max 30 days)
          const maxDate = new Date()
          maxDate.setDate(maxDate.getDate() + 30)
          if (deliveryDate > maxDate) {
            return helpers.error('date.tooFar')
          }
        }
        return value
      })
      .optional()
      .messages({
        'string.pattern.base': 'Please enter date in YYYY-MM-DD format',
        'date.past': 'Delivery date must be today or in the future',
        'date.tooFar': 'Delivery date cannot be more than 30 days in the future'
      }),
    
    notes: Joi.string()
      .max(500)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .allow('')
      .optional()
      .messages({
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      })
  }),

  // Cart item validation (simplified for debugging)
  cartItem: Joi.object({
    productId: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Product ID is required',
        'string.max': 'Product ID is too long'
      }),
    
    portionSizeId: Joi.string()
      .valid('default')
      .required()
      .messages({
        'any.only': 'Portion size must be "default"'
      }),
    
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Maximum quantity is 10'
      }),
    
    notes: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Notes must be less than 500 characters'
      }),
    
    childProfileId: Joi.string()
      .allow('')
      .optional()
      .messages({
        'string.base': 'Child profile ID must be a string'
      }),
    
    shoppingMode: Joi.string()
      .valid('family', 'child')
      .optional()
      .messages({
        'any.only': 'Shopping mode must be either "family" or "child"'
      })
  }),

  // Cart item update validation
  cartItemUpdate: Joi.object({
    itemId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid cart item ID format'
      }),
    
    quantity: Joi.number()
      .integer()
      .min(0)
      .max(10)
      .required()
      .messages({
        'number.min': 'Quantity must be at least 0',
        'number.max': 'Maximum quantity is 10'
      })
  }),

  // Search validation with security
  search: Joi.object({
    search: Joi.string()
      .max(100)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .allow('')
      .optional()
      .messages({
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      }),
    
    age: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Invalid age group ID format'
      }),
    
    texture: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Invalid texture ID format'
      }),
    
    page: Joi.string()
      .pattern(/^[1-9][0-9]*$/)
      .optional()
      .messages({
        'string.pattern.base': 'Page must be a positive number'
      })
  }),

  // File upload validation
  fileUpload: Joi.object({
    file: Joi.object({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9._-]+$/)
        .max(255)
        .required()
        .messages({
          'string.pattern.base': 'Filename contains invalid characters'
        }),
      
      size: Joi.number()
        .max(5 * 1024 * 1024) // 5MB
        .required()
        .messages({
          'number.max': 'File size must be less than 5MB'
        }),
      
      type: Joi.string()
        .valid('image/jpeg', 'image/jpg', 'image/png', 'image/webp')
        .required()
        .messages({
          'any.only': 'Only JPEG, PNG, and WebP images are allowed'
        })
    }).required()
  }),

  // Child profile validation
  childProfile: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'Name is required'
      }),
    
    dateOfBirth: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .custom((value, helpers) => {
        if (value) {
          const date = new Date(value)
          const today = new Date()
          if (date > today) {
            return helpers.error('date.future')
          }
          // Check if child is older than 18 years
          const ageInYears = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          if (ageInYears > 18) {
            return helpers.error('date.tooOld')
          }
        }
        return value
      })
      .required()
      .messages({
        'string.pattern.base': 'Please enter the date in YYYY-MM-DD format (e.g., 2020-01-15)',
        'date.future': 'Birth date cannot be in the future. Please enter a valid past date.',
        'date.tooOld': 'Child must be under 18 years old. Please enter a more recent birth date.',
        'any.required': 'Please select your child\'s date of birth'
      }),
    
    gender: Joi.string()
      .valid('MALE', 'FEMALE', 'OTHER')
      .optional()
      .messages({
        'any.only': 'Gender must be MALE, FEMALE, or OTHER'
      }),
    
    allergies: Joi.array()
      .items(Joi.string().max(100))
      .optional()
      .default([])
      .messages({
        'array.base': 'Allergies must be an array'
      }),
    
    dietaryRequirements: Joi.array()
      .items(Joi.string().max(100))
      .optional()
      .default([])
      .messages({
        'array.base': 'Dietary requirements must be an array'
      }),
    
    foodPreferences: Joi.object({
      likes: Joi.array().items(Joi.string().max(100)).optional().default([]),
      dislikes: Joi.array().items(Joi.string().max(100)).optional().default([])
    })
      .optional()
      .default({}),
    
    medicalNotes: Joi.string()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Medical notes must be less than 1000 characters'
      })
  }),

  // Admin settings validation
  adminSettings: Joi.object({
    category: Joi.string()
      .valid('general', 'business', 'delivery', 'payment', 'notifications', 'security')
      .required(),
    
    settings: Joi.object()
      .pattern(
        Joi.string().pattern(/^[a-zA-Z0-9_]+$/),
        Joi.alternatives().try(
          Joi.string().max(1000),
          Joi.number(),
          Joi.boolean(),
          Joi.object(),
          Joi.array()
        )
      )
      .required(),
    
    changeReason: Joi.string()
      .max(200)
      .custom((value, helpers) => {
        if (value && SecurityUtils.detectXSS(value)) {
          return helpers.error('string.xss')
        }
        return value ? SecurityUtils.sanitizeText(value) : value
      })
      .optional()
      .messages({
        'string.xss': 'Invalid characters detected - potential XSS attempt'
      })
  })
}

/**
 * Enhanced validation middleware using Joi
 */
export function validateWithJoi<T>(schema: Joi.ObjectSchema<T>) {
  return function validationMiddleware(data: unknown): {
    success: boolean
    data?: T
    errors?: Record<string, string[]>
    warnings?: string[]
  } {
    try {
      const { error, value, warning } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      })

      if (error) {
        const errors: Record<string, string[]> = {}
        error.details.forEach((detail) => {
          const path = detail.path.join('.')
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(detail.message)
        })

        return {
          success: false,
          errors
        }
      }

      const warnings: string[] = []
      if (warning) {
        warning.details.forEach((detail) => {
          warnings.push(detail.message)
        })
      }

      return {
        success: true,
        data: value,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (err) {
      return {
        success: false,
        errors: { general: ['Validation failed'] }
      }
    }
  }
}

/**
 * Sanitize input data before validation
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return SecurityUtils.sanitizeText(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput)
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return data
}
