// Settings validation utilities

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Validation rules for different setting types
const validationRules = {
  general: {
    storeName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-&.]+$/
    },
    storeDescription: {
      required: true,
      minLength: 10,
      maxLength: 500
    },
    storeEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    storePhone: {
      required: true,
      pattern: /^[\+]?[0-9\s\-\(\)]+$/
    },
    storeAddress: {
      required: true,
      minLength: 10,
      maxLength: 200
    }
  },
  business: {
    currency: {
      required: true,
      enum: ['ZAR', 'USD', 'EUR']
    },
    timezone: {
      required: true,
      pattern: /^[A-Za-z\/_]+$/
    },
    language: {
      required: true,
      enum: ['en', 'af', 'zu']
    }
  },
  delivery: {
    deliveryRadius: {
      required: true,
      type: 'number',
      min: 1,
      max: 1000
    },
    freeDeliveryThreshold: {
      required: true,
      type: 'number',
      min: 0,
      max: 10000
    },
    deliveryFee: {
      required: true,
      type: 'number',
      min: 0,
      max: 1000
    },
    sameDayDelivery: {
      required: true,
      type: 'boolean'
    }
  },
  payment: {
    acceptCashOnDelivery: {
      required: true,
      type: 'boolean'
    },
    acceptCardPayment: {
      required: true,
      type: 'boolean'
    },
    paymentGateway: {
      required: true,
      enum: ['peach', 'stripe', 'paypal', 'square', 'payfast']
    }
  },
  notifications: {
    emailNotifications: {
      required: true,
      type: 'boolean'
    },
    smsNotifications: {
      required: true,
      type: 'boolean'
    },
    orderConfirmations: {
      required: true,
      type: 'boolean'
    },
    deliveryUpdates: {
      required: true,
      type: 'boolean'
    },
    marketingEmails: {
      required: true,
      type: 'boolean'
    }
  },
  security: {
    twoFactorAuth: {
      required: true,
      type: 'boolean'
    },
    sessionTimeout: {
      required: true,
      type: 'number',
      min: 5,
      max: 1440
    },
    passwordPolicy: {
      required: true,
      enum: ['basic', 'strong', 'very-strong']
    },
    loginAttempts: {
      required: true,
      type: 'number',
      min: 3,
      max: 20
    }
  },
  system: {
    maintenanceMode: {
      required: true,
      type: 'boolean'
    },
    debugMode: {
      required: true,
      type: 'boolean'
    },
    logLevel: {
      required: true,
      enum: ['error', 'warn', 'info', 'debug']
    },
    backupFrequency: {
      required: true,
      enum: ['hourly', 'daily', 'weekly', 'monthly']
    }
  }
}

export function validateSettings(category: string, settings: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = []
  const rules = validationRules[category as keyof typeof validationRules]

  if (!rules) {
    return {
      isValid: true,
      errors: []
    }
  }

  for (const [key, value] of Object.entries(settings)) {
    const rule = rules[key as keyof typeof rules] as any
    
    if (!rule) {
      continue // Skip validation for unknown fields
    }

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: key,
        message: `${key} is required`,
        value
      })
      continue
    }

    // Skip further validation if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // Type validation
    if (rule.type === 'number') {
      const numValue = Number(value)
      if (isNaN(numValue)) {
        errors.push({
          field: key,
          message: `${key} must be a valid number`,
          value
        })
        continue
      }
      
      if (rule.min !== undefined && numValue < rule.min) {
        errors.push({
          field: key,
          message: `${key} must be at least ${rule.min}`,
          value
        })
      }
      
      if (rule.max !== undefined && numValue > rule.max) {
        errors.push({
          field: key,
          message: `${key} must be at most ${rule.max}`,
          value
        })
      }
    }

    if (rule.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push({
          field: key,
          message: `${key} must be true or false`,
          value
        })
      }
    }

    // String validation
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({
          field: key,
          message: `${key} must be at least ${rule.minLength} characters long`,
          value
        })
      }
      
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({
          field: key,
          message: `${key} must be at most ${rule.maxLength} characters long`,
          value
        })
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field: key,
          message: `${key} format is invalid`,
          value
        })
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push({
        field: key,
        message: `${key} must be one of: ${rule.enum.join(', ')}`,
        value
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateBusinessHours(value: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  try {
    const hours = typeof value === 'string' ? JSON.parse(value) : value
    
    if (!hours || typeof hours !== 'object') {
      errors.push({
        field: 'businessHours',
        message: 'Business hours must be a valid object'
      })
      return errors
    }

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const validTimePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (hours.days && Array.isArray(hours.days)) {
      for (const day of hours.days) {
        if (!validDays.includes(day)) {
          errors.push({
            field: 'businessHours.days',
            message: `Invalid day: ${day}. Must be one of: ${validDays.join(', ')}`
          })
        }
      }
    }

    if (hours.open && !validTimePattern.test(hours.open)) {
      errors.push({
        field: 'businessHours.open',
        message: 'Open time must be in HH:MM format'
      })
    }

    if (hours.close && !validTimePattern.test(hours.close)) {
      errors.push({
        field: 'businessHours.close',
        message: 'Close time must be in HH:MM format'
      })
    }

  } catch (error) {
    errors.push({
      field: 'businessHours',
      message: 'Business hours must be valid JSON'
    })
  }

  return errors
}

export function validateDeliveryTimeSlots(value: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  try {
    const slots = typeof value === 'string' ? JSON.parse(value) : value
    
    if (!Array.isArray(slots)) {
      errors.push({
        field: 'deliveryTimeSlots',
        message: 'Delivery time slots must be an array'
      })
      return errors
    }

    const validTimeSlotPattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

    for (const slot of slots) {
      if (typeof slot !== 'string' || !validTimeSlotPattern.test(slot)) {
        errors.push({
          field: 'deliveryTimeSlots',
          message: `Invalid time slot: ${slot}. Must be in HH:MM-HH:MM format`
        })
      }
    }

  } catch (error) {
    errors.push({
      field: 'deliveryTimeSlots',
      message: 'Delivery time slots must be valid JSON'
    })
  }

  return errors
}

export function validatePaymentMethods(value: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  try {
    const methods = typeof value === 'string' ? JSON.parse(value) : value
    
    if (!Array.isArray(methods)) {
      errors.push({
        field: 'paymentMethods',
        message: 'Payment methods must be an array'
      })
      return errors
    }

    const validMethods = ['card', 'cash', 'eft', 'paypal', 'apple_pay', 'google_pay']

    for (const method of methods) {
      if (!validMethods.includes(method)) {
        errors.push({
          field: 'paymentMethods',
          message: `Invalid payment method: ${method}. Must be one of: ${validMethods.join(', ')}`
        })
      }
    }

  } catch (error) {
    errors.push({
      field: 'paymentMethods',
      message: 'Payment methods must be valid JSON'
    })
  }

  return errors
}

export function validateIpWhitelist(value: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  try {
    const ips = typeof value === 'string' ? JSON.parse(value) : value
    
    if (!Array.isArray(ips)) {
      errors.push({
        field: 'ipWhitelist',
        message: 'IP whitelist must be an array'
      })
      return errors
    }

    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const cidrPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/

    for (const ip of ips) {
      if (typeof ip !== 'string' || (!ipPattern.test(ip) && !cidrPattern.test(ip))) {
        errors.push({
          field: 'ipWhitelist',
          message: `Invalid IP address: ${ip}. Must be a valid IP or CIDR notation`
        })
      }
    }

  } catch (error) {
    errors.push({
      field: 'ipWhitelist',
      message: 'IP whitelist must be valid JSON'
    })
  }

  return errors
}
