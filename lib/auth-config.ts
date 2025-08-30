import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// Define authorized users with their roles
const authorizedUsers = {
  'musicbyhayde@gmail.com': UserRole.ADMIN,
  'ziv200@gmail.com': UserRole.MODERATOR,
  'kobile@gmail.com': UserRole.MODERATOR
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email?.toLowerCase()
      
      // Check if user is authorized
      if (!email || !(email in authorizedUsers)) {
        console.log(`Unauthorized sign-in attempt: ${email}`)
        return false
      }
      
      // Create or update user in database during sign-in
      const role = authorizedUsers[email as keyof typeof authorizedUsers]
      await prisma.user.upsert({
        where: { email },
        update: { 
          name: user.name,
          image: user.image,
          role: role,
          active: true
        },
        create: {
          email,
          name: user.name,
          image: user.image,
          role: role,
          active: true
        }
      })
      
      return true
    },
    async session({ session, user }) {
      // user comes from database when using database sessions
      if (user && session.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'database'
  }
}