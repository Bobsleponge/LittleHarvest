import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

/**
 * Input sanitization utilities
 */
export class SecurityUtils {
  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    })
  }

  /**
   * Sanitize text content (remove HTML tags)
   */
  static sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
  }

  /**
   * Validate file type based on magic bytes
   */
  static async validateFileType(file: File, allowedTypes: string[]): Promise<boolean> {
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    // Check magic bytes for common image formats
    const magicBytes = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
    }

    for (const [mimeType, bytes] of Object.entries(magicBytes)) {
      if (allowedTypes.includes(mimeType)) {
        const matches = bytes.every((byte, index) => uint8Array[index] === byte)
        if (matches) return true
      }
    }

    return false
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes
  }

  /**
   * Generate secure filename
   */
  static generateSecureFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()?.toLowerCase() || 'bin'
    
    return `secure-${timestamp}-${random}.${extension}`
  }

  /**
   * Validate South African phone number
   */
  static validateSAPhoneNumber(phone: string): boolean {
    const saPhoneRegex = /^(\+27|0)[6-8][0-9]{8}$/
    return saPhoneRegex.test(phone)
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Escape SQL injection attempts (though Prisma handles this)
   */
  static escapeSQL(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
  }

  /**
   * Validate URL
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check for XSS attempts
   */
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Sanitize and validate user input
   */
  static sanitizeUserInput(input: string, options: {
    allowHTML?: boolean
    maxLength?: number
    checkXSS?: boolean
  } = {}): {
    sanitized: string
    isValid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []
    let sanitized = input

    // Check length
    if (options.maxLength && input.length > options.maxLength) {
      warnings.push(`Input exceeds maximum length of ${options.maxLength}`)
      sanitized = input.substring(0, options.maxLength)
    }

    // Check for XSS
    if (options.checkXSS && this.detectXSS(input)) {
      warnings.push('Potential XSS attempt detected')
    }

    // Sanitize based on options
    if (options.allowHTML) {
      sanitized = this.sanitizeHTML(sanitized)
    } else {
      sanitized = this.sanitizeText(sanitized)
    }

    return {
      sanitized,
      isValid: warnings.length === 0,
      warnings,
    }
  }
}

/**
 * Enhanced validation schemas with security checks
 */
export const securitySchemas = {
  // Enhanced product schema with security
  product: z.object({
    name: z.string()
      .min(1, 'Product name is required')
      .max(100, 'Product name too long')
      .refine(val => !SecurityUtils.detectXSS(val), 'Invalid characters detected'),
    slug: z.string()
      .min(1, 'Slug is required')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, alphanumeric, and hyphenated')
      .max(100, 'Slug too long'),
    description: z.string()
      .max(1000, 'Description too long')
      .optional()
      .transform(val => val ? SecurityUtils.sanitizeText(val) : ''),
    ageGroupId: z.string().min(1, 'Age group is required'),
    textureId: z.string().min(1, 'Texture is required'),
    imageUrl: z.string().url('Invalid image URL').nullable(),
    contains: z.string()
      .max(500, 'Contains field too long')
      .optional()
      .transform(val => val ? SecurityUtils.sanitizeText(val) : ''),
    mayContain: z.string()
      .max(500, 'May contain field too long')
      .optional()
      .transform(val => val ? SecurityUtils.sanitizeText(val) : ''),
    isActive: z.boolean().default(true),
  }),

  // Enhanced profile schema with security
  profile: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name too long')
      .refine(val => !SecurityUtils.detectXSS(val), 'Invalid characters detected'),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name too long')
      .refine(val => !SecurityUtils.detectXSS(val), 'Invalid characters detected'),
    phone: z.string()
      .refine(val => !val || SecurityUtils.validateSAPhoneNumber(val), 'Invalid phone number')
      .optional()
      .or(z.literal('')),
    childName: z.string()
      .max(50, 'Child name too long')
      .optional()
      .transform(val => val ? SecurityUtils.sanitizeText(val) : ''),
    childDob: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .optional()
      .or(z.literal('')),
  }),

  // File upload validation
  fileUpload: z.object({
    file: z.instanceof(File)
      .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
      .refine(file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type), 'Invalid file type'),
  }),
}

/**
 * Security middleware for API routes
 */
export function withSecurity<T extends z.ZodTypeAny>(
  schema: T,
  options: {
    sanitizeHTML?: boolean
    checkXSS?: boolean
    maxLength?: number
  } = {}
) {
  return function securityMiddleware(data: unknown) {
    // First validate with Zod
    const validation = schema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.issues,
        sanitized: null,
      }
    }

    // Then apply security sanitization
    const sanitized = { ...validation.data }
    const warnings: string[] = []

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        const result = SecurityUtils.sanitizeUserInput(value, {
          allowHTML: options.sanitizeHTML,
          maxLength: options.maxLength,
          checkXSS: options.checkXSS,
        })
        
        sanitized[key] = result.sanitized
        warnings.push(...result.warnings)
      }
    }

    return {
      success: true,
      data: sanitized,
      warnings,
    }
  }
}
