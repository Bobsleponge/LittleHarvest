import { promises as fs } from 'fs'
import path from 'path'

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  fileType?: string
  size?: number
}

export interface MagicBytes {
  [key: string]: number[]
}

// Magic bytes for common image formats
const MAGIC_BYTES: MagicBytes = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
  'image/bmp': [0x42, 0x4D],
  'image/tiff': [0x49, 0x49, 0x2A, 0x00], // Little-endian TIFF
}

export class FileValidator {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]

  /**
   * Validate file type using magic bytes
   */
  static async validateFileType(filePath: string, mimeType: string): Promise<FileValidationResult> {
    const errors: string[] = []

    try {
      // Read first 16 bytes to check magic bytes
      const buffer = await fs.readFile(filePath)
      const firstBytes = buffer.slice(0, 16)
      const bytes = Array.from(firstBytes)

      // Check magic bytes for declared MIME type
      const expectedBytes = MAGIC_BYTES[mimeType.toLowerCase()]
      if (expectedBytes) {
        const matches = expectedBytes.every((byte, index) => bytes[index] === byte)
        if (!matches) {
          errors.push(`File content does not match declared type: ${mimeType}`)
        }
      }

      // Additional validation for specific types
      if (mimeType === 'image/webp') {
        // Check for WEBP signature after RIFF header
        if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
          // Valid WEBP
        } else {
          errors.push('Invalid WEBP file format')
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        fileType: mimeType
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Validate file size
   */
  static validateFileSize(size: number): FileValidationResult {
    const errors: string[] = []

    if (size > this.MAX_FILE_SIZE) {
      errors.push(`File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    if (size === 0) {
      errors.push('File is empty')
    }

    return {
      isValid: errors.length === 0,
      errors,
      size
    }
  }

  /**
   * Validate MIME type against allowed types
   */
  static validateMimeType(mimeType: string): FileValidationResult {
    const errors: string[] = []

    if (!this.ALLOWED_TYPES.includes(mimeType.toLowerCase())) {
      errors.push(`File type ${mimeType} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileType: mimeType
    }
  }

  /**
   * Comprehensive file validation
   */
  static async validateFile(filePath: string, originalName: string, mimeType: string, size: number): Promise<FileValidationResult> {
    const allErrors: string[] = []

    // Validate MIME type
    const mimeValidation = this.validateMimeType(mimeType)
    if (!mimeValidation.isValid) {
      allErrors.push(...mimeValidation.errors)
    }

    // Validate file size
    const sizeValidation = this.validateFileSize(size)
    if (!sizeValidation.isValid) {
      allErrors.push(...sizeValidation.errors)
    }

    // Validate file content (magic bytes)
    const contentValidation = await this.validateFileType(filePath, mimeType)
    if (!contentValidation.isValid) {
      allErrors.push(...contentValidation.errors)
    }

    // Validate filename
    const filenameValidation = this.validateFilename(originalName)
    if (!filenameValidation.isValid) {
      allErrors.push(...filenameValidation.errors)
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      fileType: mimeType,
      size
    }
  }

  /**
   * Validate filename for security
   */
  static validateFilename(filename: string): FileValidationResult {
    const errors: string[] = []

    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Filename contains invalid characters')
    }

    // Check for executable extensions
    const executableExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar']
    const extension = path.extname(filename).toLowerCase()
    if (executableExtensions.includes(extension)) {
      errors.push('Executable files are not allowed')
    }

    // Check filename length
    if (filename.length > 255) {
      errors.push('Filename is too long')
    }

    // Check for null bytes
    if (filename.includes('\0')) {
      errors.push('Filename contains null bytes')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Generate secure filename
   */
  static generateSecureFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(originalName).toLowerCase()
    
    // Validate extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const safeExtension = allowedExtensions.includes(extension) ? extension : '.bin'
    
    return `upload-${timestamp}-${random}${safeExtension}`
  }

  /**
   * Check if file is potentially malicious
   */
  static async scanForMaliciousContent(filePath: string): Promise<FileValidationResult> {
    const errors: string[] = []

    try {
      const buffer = await fs.readFile(filePath)
      const firstKB = buffer.slice(0, 1024)
      const content = firstKB.toString('utf8')

      // Check for script tags
      if (content.includes('<script') || content.includes('javascript:')) {
        errors.push('File contains potentially malicious script content')
      }

      // Check for PHP tags
      if (content.includes('<?php') || content.includes('<?=')) {
        errors.push('File contains PHP code')
      }

      // Check for executable signatures
      const executableSignatures = [
        'MZ', // DOS/Windows executable
        'ELF', // Linux executable
        '\x7fELF', // ELF binary
      ]

      for (const signature of executableSignatures) {
        if (content.includes(signature)) {
          errors.push('File appears to be an executable')
          break
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Malicious content scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
}

