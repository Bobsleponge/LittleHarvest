import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import { CSRFProtection } from './lib/csrf'
import { SessionSecurityManager } from './lib/session-security'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // CSRF protection for API routes
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/csrf-token')) {
      // Skip CSRF for GET requests and auth endpoints
      if (req.method !== 'GET' && !pathname.startsWith('/api/auth/')) {
        const csrfToken = req.headers.get('x-csrf-token')
        if (!csrfToken) {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF token required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
        
        // Note: Full CSRF validation would require converting NextRequest to NextApiRequest
        // For now, we'll do basic token presence check
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token) {
        // Redirect to dev-login in development (if enabled), auth/signin otherwise
        const signInUrl = process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_AUTH === 'true' ? '/dev-login' : '/auth/signin'
        return NextResponse.redirect(new URL(signInUrl, req.url))
      }
      
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Protect authenticated routes
    if (pathname.startsWith('/profile') || pathname.startsWith('/orders') || pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Add security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
    
    // Add HSTS header for HTTPS
    if (req.nextUrl.protocol === 'https:') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow public routes
        if (pathname === '/' || pathname.startsWith('/browse') || pathname.startsWith('/products') || pathname.startsWith('/packages') || pathname.startsWith('/auth') || (pathname.startsWith('/dev-login') && process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_AUTH === 'true')) {
          return true
        }
        
        // Require authentication for protected routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/profile') || pathname.startsWith('/orders') || pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/cart/:path*',
    '/checkout/:path*',
  ],
}

