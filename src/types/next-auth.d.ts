import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'ADMIN' | 'CUSTOMER'
      profile?: {
        id: string
        userId: string
        firstName: string
        lastName: string
        phone: string | null
        createdAt: Date
        updatedAt: Date
      }
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: 'ADMIN' | 'CUSTOMER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: 'ADMIN' | 'CUSTOMER'
  }
}
