import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

// Image optimization utilities
export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export class ImageOptimizer {
  private static readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp',
    fit: 'cover',
  }

  /**
   * Optimize an image file
   */
  static async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: Partial<ImageOptimizationOptions> = {}
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Get original file size
      const originalStats = await fs.stat(inputPath)
      const originalSize = originalStats.size

      const opts = { ...this.DEFAULT_OPTIONS, ...options }

      await sharp(inputPath)
        .resize(opts.width, opts.height, { fit: opts.fit })
        .toFormat(opts.format, { quality: opts.quality })
        .toFile(outputPath)

      // Record metrics
      const duration = Date.now() - startTime
      const optimizedStats = await fs.stat(outputPath)
      const optimizedSize = optimizedStats.size

      // Import metrics dynamically to avoid circular dependency
      import('./metrics').then(({ metrics }) => {
        metrics.recordImageOptimizationTime(originalSize, optimizedSize, duration)
      }).catch(() => {
        // Silently fail if metrics module is not available
      })

    } catch (error) {
      const duration = Date.now() - startTime
      
      // Record error metrics
      import('./metrics').then(({ metrics }) => {
        metrics.recordError('image_optimization', error instanceof Error ? error.name : 'Unknown')
      }).catch(() => {
        // Silently fail if metrics module is not available
      })
      
      throw error
    }
  }

  /**
   * Generate multiple sizes for responsive images
   */
  static async generateResponsiveImages(
    inputPath: string,
    baseOutputPath: string,
    sizes: number[] = [320, 640, 800, 1200]
  ): Promise<string[]> {
    const outputPaths: string[] = []
    const ext = path.extname(baseOutputPath)
    const nameWithoutExt = path.basename(baseOutputPath, ext)

    for (const size of sizes) {
      const outputPath = path.join(
        path.dirname(baseOutputPath),
        `${nameWithoutExt}-${size}w${ext}`
      )

      await this.optimizeImage(inputPath, outputPath, {
        width: size,
        height: Math.round((size * 3) / 4), // 4:3 aspect ratio
      })

      outputPaths.push(outputPath)
    }

    return outputPaths
  }

  /**
   * Generate a blur placeholder for lazy loading
   */
  static async generateBlurPlaceholder(
    inputPath: string,
    outputPath: string
  ): Promise<string> {
    const buffer = await sharp(inputPath)
      .resize(20, 20, { fit: 'cover' })
      .blur(1)
      .jpeg({ quality: 50 })
      .toBuffer()

    const base64 = buffer.toString('base64')
    return `data:image/jpeg;base64,${base64}`
  }

  /**
   * Validate image file
   */
  static async validateImage(filePath: string): Promise<boolean> {
    try {
      const metadata = await sharp(filePath).metadata()
      return !!metadata.width && !!metadata.height
    } catch {
      return false
    }
  }

  /**
   * Get image metadata
   */
  static async getImageMetadata(filePath: string) {
    return await sharp(filePath).metadata()
  }
}

// Next.js Image component optimization
export const imageLoader = ({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) => {
  // If it's a local image, use Next.js optimization
  if (src.startsWith('/')) {
    return `${src}?w=${width}&q=${quality || 75}`
  }
  
  // For external images, you might want to use a CDN
  // Example: return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`
  return src
}

// Image optimization configuration for Next.js
export const imageConfig = {
  domains: ['localhost', 'tinytastes.co.za'],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
