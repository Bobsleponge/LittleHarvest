import { NextApiRequest, NextApiResponse } from 'next'
import { SecurityUtils } from '../src/lib/security'
import { CSRFProtection } from '../src/lib/csrf'
import { FileValidator } from '../src/lib/file-validation'
import { VirusScanner } from '../src/lib/virus-scanning'
import { NetworkSecurity } from '../src/lib/network-security'
import { validationSchemas, validateWithJoi } from '../src/lib/joi-validation'

describe('Security Utils Tests', () => {
  describe('XSS Detection', () => {
    test('should detect basic XSS attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '"><script>alert("xss")</script>',
        "'><script>alert('xss')</script>",
        '<iframe src="javascript:alert(1)">',
        '<object data="javascript:alert(1)">',
        '<embed src="javascript:alert(1)">',
        '<link rel="stylesheet" href="javascript:alert(1)">'
      ]

      maliciousInputs.forEach(input => {
        expect(SecurityUtils.detectXSS(input)).toBe(true)
      })
    })

    test('should not flag legitimate content', () => {
      const legitimateInputs = [
        'Hello world',
        'This is a normal text',
        'User@example.com',
        'https://example.com',
        'Product name with & symbol',
        'Price: $19.99',
        'Description with <b>bold</b> text',
        'Math: 2 < 5 and 3 > 1'
      ]

      legitimateInputs.forEach(input => {
        expect(SecurityUtils.detectXSS(input)).toBe(false)
      })
    })
  })

  describe('HTML Sanitization', () => {
    test('should sanitize malicious HTML', () => {
      const maliciousHTML = '<script>alert("xss")</script><p>Hello</p>'
      const sanitized = SecurityUtils.sanitizeHTML(maliciousHTML)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('<p>Hello</p>')
    })

    test('should preserve safe HTML', () => {
      const safeHTML = '<p>Hello <strong>world</strong></p>'
      const sanitized = SecurityUtils.sanitizeHTML(safeHTML)
      
      expect(sanitized).toContain('<p>')
      expect(sanitized).toContain('<strong>')
    })
  })

  describe('Text Sanitization', () => {
    test('should remove dangerous characters', () => {
      const dangerousText = 'Hello<script>alert("xss")</script>World'
      const sanitized = SecurityUtils.sanitizeText(dangerousText)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Hello')
      expect(sanitized).toContain('World')
    })
  })

  describe('Email Validation', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.za',
        'user+tag@example.org',
        'user123@test-domain.com'
      ]

      validEmails.forEach(email => {
        expect(SecurityUtils.validateEmail(email)).toBe(true)
      })
    })

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com'
      ]

      invalidEmails.forEach(email => {
        expect(SecurityUtils.validateEmail(email)).toBe(false)
      })
    })
  })

  describe('Phone Number Validation', () => {
    test('should validate South African phone numbers', () => {
      const validPhones = [
        '0821234567',
        '0831234567',
        '0841234567',
        '+27821234567',
        '27821234567'
      ]

      validPhones.forEach(phone => {
        expect(SecurityUtils.validateSAPhoneNumber(phone)).toBe(true)
      })
    })

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '1234567890',
        '081234567',
        '0851234567',
        'invalid',
        '08212345678'
      ]

      invalidPhones.forEach(phone => {
        expect(SecurityUtils.validateSAPhoneNumber(phone)).toBe(false)
      })
    })
  })

  describe('URL Validation', () => {
    test('should validate safe URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://tinytastes.co.za',
        'https://www.google.com'
      ]

      validUrls.forEach(url => {
        expect(SecurityUtils.validateURL(url)).toBe(true)
      })
    })

    test('should reject dangerous URLs', () => {
      const dangerousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
        'ftp://malicious.com'
      ]

      dangerousUrls.forEach(url => {
        expect(SecurityUtils.validateURL(url)).toBe(false)
      })
    })
  })
})

describe('CSRF Protection Tests', () => {
  test('should generate valid CSRF tokens', () => {
    const token = CSRFProtection.createSignedToken()
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split(':')).toHaveLength(3)
  })

  test('should verify valid CSRF tokens', () => {
    const token = CSRFProtection.createSignedToken()
    const result = CSRFProtection.verifySignedToken(token)
    
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  test('should reject invalid CSRF tokens', () => {
    const invalidTokens = [
      'invalid-token',
      'invalid:token',
      'invalid:token:format',
      'expired:token:signature'
    ]

    invalidTokens.forEach(token => {
      const result = CSRFProtection.verifySignedToken(token)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  test('should reject expired CSRF tokens', () => {
    // Create a token with past expiry
    const pastTime = Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
    const token = 'test-token'
    const expires = pastTime.toString()
    const signature = 'invalid-signature'
    const expiredToken = `${token}:${expires}:${signature}`
    
    const result = CSRFProtection.verifySignedToken(expiredToken)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('expired')
  })
})

describe('File Validation Tests', () => {
  test('should validate file types', () => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const invalidTypes = ['text/html', 'application/javascript', 'application/x-executable']

    validTypes.forEach(type => {
      const result = FileValidator.validateMimeType(type)
      expect(result.isValid).toBe(true)
    })

    invalidTypes.forEach(type => {
      const result = FileValidator.validateMimeType(type)
      expect(result.isValid).toBe(false)
    })
  })

  test('should validate file sizes', () => {
    const validSize = 1024 * 1024 // 1MB
    const invalidSize = 10 * 1024 * 1024 // 10MB

    const validResult = FileValidator.validateFileSize(validSize)
    expect(validResult.isValid).toBe(true)

    const invalidResult = FileValidator.validateFileSize(invalidSize)
    expect(invalidResult.isValid).toBe(false)
  })

  test('should validate filenames', () => {
    const validNames = ['image.jpg', 'photo.png', 'document.pdf']
    const invalidNames = [
      '../../../etc/passwd',
      'file<script>.jpg',
      'file\0.jpg',
      'a'.repeat(300) + '.jpg'
    ]

    validNames.forEach(name => {
      const result = FileValidator.validateFilename(name)
      expect(result.isValid).toBe(true)
    })

    invalidNames.forEach(name => {
      const result = FileValidator.validateFilename(name)
      expect(result.isValid).toBe(false)
    })
  })

  test('should generate secure filenames', () => {
    const originalName = 'malicious<script>.jpg'
    const secureName = FileValidator.generateSecureFilename(originalName)
    
    expect(secureName).not.toContain('<script>')
    expect(secureName).toMatch(/^upload-\d+-[a-z0-9]+\.jpg$/)
  })
})

describe('Virus Scanning Tests', () => {
  test('should detect executable signatures', () => {
    const executableContent = Buffer.from('MZ\x90\x00') // DOS executable signature
    const result = VirusScanner.scanContent('/test/file.exe', executableContent)
    
    expect(result.isClean).toBe(false)
    expect(result.threats).toContain('Suspicious pattern detected: DOS/Windows executable signature')
  })

  test('should detect script content', () => {
    const scriptContent = Buffer.from('<script>alert("xss")</script>')
    const result = VirusScanner.scanContent('/test/file.html', scriptContent)
    
    expect(result.isClean).toBe(false)
    expect(result.threats).toContain('Suspicious pattern detected: HTML script tag')
  })

  test('should pass clean content', () => {
    const cleanContent = Buffer.from('This is just normal text content')
    const result = VirusScanner.scanContent('/test/file.txt', cleanContent)
    
    expect(result.isClean).toBe(true)
    expect(result.threats).toHaveLength(0)
  })
})

describe('Network Security Tests', () => {
  test('should validate allowed origins', () => {
    const validOrigins = [
      'http://localhost:3000',
      'https://tinytastes.co.za',
      'https://www.tinytastes.co.za'
    ]

    validOrigins.forEach(origin => {
      const mockReq = {
        headers: { origin }
      } as NextApiRequest

      expect(NetworkSecurity.validateOrigin(mockReq)).toBe(true)
    })
  })

  test('should reject invalid origins', () => {
    const invalidOrigins = [
      'https://malicious.com',
      'http://evil.com',
      'https://phishing-site.com'
    ]

    invalidOrigins.forEach(origin => {
      const mockReq = {
        headers: { origin }
      } as NextApiRequest

      expect(NetworkSecurity.validateOrigin(mockReq)).toBe(false)
    })
  })

  test('should detect suspicious headers', () => {
    const mockReq = {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'x-forwarded-host': 'malicious.com',
        'x-originating-ip': '192.168.1.1'
      }
    } as NextApiRequest

    const result = NetworkSecurity.validateHeaders(mockReq)
    expect(result.isValid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  test('should validate body size', () => {
    const mockReq = {
      headers: {
        'content-length': '1024'
      }
    } as NextApiRequest

    expect(NetworkSecurity.validateBodySize(mockReq, 2048)).toBe(true)
    expect(NetworkSecurity.validateBodySize(mockReq, 512)).toBe(false)
  })
})

describe('Input Validation Tests', () => {
  test('should validate user profile data', () => {
    const validProfile = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '0821234567',
      childName: 'Jane',
      childDob: '2020-01-01'
    }

    const result = validateWithJoi(validationSchemas.profile)(validProfile)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  test('should reject malicious profile data', () => {
    const maliciousProfile = {
      firstName: '<script>alert("xss")</script>',
      lastName: 'Doe',
      phone: '0821234567',
      childName: 'Jane',
      childDob: '2020-01-01'
    }

    const result = validateWithJoi(validationSchemas.profile)(maliciousProfile)
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })

  test('should validate product data', () => {
    const validProduct = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      ageGroupId: '123e4567-e89b-12d3-a456-426614174000',
      textureId: '123e4567-e89b-12d3-a456-426614174001',
      imageUrl: 'https://example.com/image.jpg',
      contains: 'Test ingredients',
      mayContain: 'Possible allergens',
      isActive: true
    }

    const result = validateWithJoi(validationSchemas.product)(validProduct)
    expect(result.success).toBe(true)
  })

  test('should reject invalid product data', () => {
    const invalidProduct = {
      name: '<script>alert("xss")</script>',
      slug: 'invalid slug with spaces',
      description: 'A test product',
      ageGroupId: 'invalid-uuid',
      textureId: 'invalid-uuid',
      imageUrl: 'javascript:alert(1)',
      contains: 'Test ingredients',
      mayContain: 'Possible allergens',
      isActive: true
    }

    const result = validateWithJoi(validationSchemas.product)(invalidProduct)
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })
})

describe('Security Integration Tests', () => {
  test('should handle complete security pipeline', () => {
    // Test data
    const userInput = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '0821234567'
    }

    // Step 1: Input validation
    const validationResult = validateWithJoi(validationSchemas.profile)(userInput)
    expect(validationResult.success).toBe(true)

    // Step 2: XSS detection
    const xssCheck = SecurityUtils.detectXSS(userInput.firstName)
    expect(xssCheck).toBe(false)

    // Step 3: Email validation
    const emailCheck = SecurityUtils.validateEmail(userInput.email)
    expect(emailCheck).toBe(true)

    // Step 4: Phone validation
    const phoneCheck = SecurityUtils.validateSAPhoneNumber(userInput.phone)
    expect(phoneCheck).toBe(true)

    // Step 5: Text sanitization
    const sanitizedData = {
      firstName: SecurityUtils.sanitizeText(userInput.firstName),
      lastName: SecurityUtils.sanitizeText(userInput.lastName)
    }

    expect(sanitizedData.firstName).toBe(userInput.firstName)
    expect(sanitizedData.lastName).toBe(userInput.lastName)
  })

  test('should detect and prevent XSS attack', () => {
    const maliciousInput = {
      firstName: '<script>alert("xss")</script>',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '0821234567'
    }

    // Step 1: XSS detection should catch this
    const xssDetected = SecurityUtils.detectXSS(maliciousInput.firstName)
    expect(xssDetected).toBe(true)

    // Step 2: Validation should reject this
    const validationResult = validateWithJoi(validationSchemas.profile)(maliciousInput)
    expect(validationResult.success).toBe(false)

    // Step 3: Sanitization should clean this
    const sanitized = SecurityUtils.sanitizeText(maliciousInput.firstName)
    expect(sanitized).not.toContain('<script>')
  })
})

