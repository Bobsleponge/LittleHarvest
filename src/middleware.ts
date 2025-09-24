import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token) {
        // Redirect to dev-login in development, auth/signin in production
        const signInUrl = process.env.NODE_ENV === 'development' ? '/dev-login' : '/auth/signin'
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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow public routes
        if (pathname === '/' || pathname.startsWith('/browse') || pathname.startsWith('/products') || pathname.startsWith('/packages') || pathname.startsWith('/auth') || pathname.startsWith('/dev-login')) {
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

