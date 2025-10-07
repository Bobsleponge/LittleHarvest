import helmet from 'helmet'
import { NextApiRequest, NextApiResponse } from 'next'

// Enhanced security middleware using Helmet
export const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for Next.js development
        "https://vercel.live",
        "https://vitals.vercel-insights.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for CSS-in-JS
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://vercel.live",
        "https://vitals.vercel-insights.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disabled for Next.js compatibility

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frameguard
  frameguard: { action: 'deny' },

  // Hide Powered-By
  hidePoweredBy: true,

  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // XSS Filter
  xssFilter: true
})

/**
 * Apply security middleware to API routes
 */
export function withSecurityHeaders(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply Helmet security headers
    securityMiddleware(req as any, res as any, () => {
      // Continue to the actual handler
      return handler(req, res)
    })
  }
}

/**
 * Additional security headers for specific routes
 */
export function addSecurityHeaders(res: NextApiResponse, additionalHeaders: Record<string, string> = {}) {
  const defaultHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }

  // Apply default headers
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // Apply additional headers
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}

/**
 * Security headers for file uploads
 */
export function addFileUploadSecurityHeaders(res: NextApiResponse) {
  addSecurityHeaders(res, {
    'Content-Disposition': 'attachment',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  })
}

/**
 * Security headers for API responses
 */
export function addAPISecurityHeaders(res: NextApiResponse) {
  addSecurityHeaders(res, {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  })
}

/**
 * Security headers for admin routes
 */
export function addAdminSecurityHeaders(res: NextApiResponse) {
  addSecurityHeaders(res, {
    'X-Robots-Tag': 'noindex, nofollow',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  })
}

