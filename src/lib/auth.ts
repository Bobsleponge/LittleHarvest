import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Development credentials provider (only in development)
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: 'dev-login',
        name: 'Development Login',
        credentials: {
          email: { label: 'Email', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.email) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
            }
          }
          return null
        },
      })
    ] : []),
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
    }),
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
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: process.env.NODE_ENV === 'development' ? '/dev-login' : '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

