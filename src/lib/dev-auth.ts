import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

// Development email provider that auto-verifies emails
const DevEmailProvider = {
  ...EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
  }),
  // Override the sendVerificationRequest to auto-verify in development
  sendVerificationRequest: async ({ identifier: email, url, provider }) => {
    // In development, we'll just log the verification URL
    // In a real app, this would send an actual email
    console.log(`🔗 Development login link for ${email}: ${url}`)
    
    // For development, we can auto-redirect to the verification URL
    if (process.env.NODE_ENV === 'development') {
      // This is a simplified approach for development
      // In production, users would receive this link via email
      return Promise.resolve()
    }
    
    // Fallback to normal email sending in production
    return provider.sendVerificationRequest({ identifier: email, url })
  },
}

export const devAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DevEmailProvider,
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { profile: true },
        })
        
        if (user) {
          session.user.id = user.id
          session.user.role = user.role
          session.user.profile = user.profile
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
