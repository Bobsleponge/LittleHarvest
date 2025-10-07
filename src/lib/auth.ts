import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { sendWelcomeEmail } from './email'
import { logger } from './logger'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Development credentials provider (only in development AND when explicitly enabled)
    ...(process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_AUTH === 'true' ? [
      CredentialsProvider({
        id: 'dev-login',
        name: 'Development Login',
        credentials: {
          email: { label: 'Email', type: 'text' },
        },
        async authorize(credentials) {
          console.log('Dev-login authorize called with credentials:', credentials)
          
          if (!credentials?.email) {
            console.log('Dev-login: No email provided')
            return null
          }

          console.log('Dev-login: Looking up user with email:', credentials.email)
          
          try {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            })

            console.log('Dev-login: Found user:', user)

            if (user) {
              const result = {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role as 'ADMIN' | 'CUSTOMER',
              }
              console.log('Dev-login: Returning user:', result)
              return result
            }
            console.log('Dev-login: No user found')
            return null
          } catch (error) {
            console.error('Dev-login: Database error:', error)
            return null
          }
        },
      })
    ] : []),
    // Only include EmailProvider if nodemailer is available and email config is set
    ...(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM ? [
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
      })
    ] : []),
    // Only include GoogleProvider if credentials are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ] : []),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      try {
        // Check if this is a new user (first time signing in)
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, createdAt: true }
        })

        // If user exists and was created recently (within last 5 minutes), send welcome email
        if (existingUser && existingUser.createdAt) {
          const timeSinceCreation = Date.now() - existingUser.createdAt.getTime()
          const isNewUser = timeSinceCreation < 5 * 60 * 1000 // 5 minutes

          if (isNewUser) {
            // Send welcome email in background (don't wait for it)
            sendWelcomeEmail({
              customerName: user.name || 'Valued Customer',
              customerEmail: user.email!
            }).catch(error => {
              logger.error('Failed to send welcome email', {
                userId: existingUser.id,
                email: user.email,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
            })
          }
        }
      } catch (error) {
        logger.error('Error in signIn callback', {
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        // Don't fail the sign-in process if email sending fails
      }

      return true
    },
    session: async ({ session, token }) => {
      console.log('Session callback - token:', token)
      console.log('Session callback - session:', session)
      
      if (token?.id) {
        session.user.id = token.id
        session.user.role = token.role as 'ADMIN' | 'CUSTOMER'
      }
      
      return session
    },
    jwt: async ({ user, token, account }) => {
      console.log('JWT callback - user:', user)
      console.log('JWT callback - token:', token)
      
      if (user) {
        token.role = user.role
        token.id = user.id
        console.log('JWT callback - updated token:', token)
      }
      
      return token
    },
  },
  pages: {
    signIn: process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_AUTH === 'true' ? '/dev-login' : '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

