// lib/auth-middleware.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  // Fetch user from database to ensure they still exist and are verified
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      role: true,
      createdAt: true
    }
  })

  if (!user || !user.isVerified) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

// For API routes - supports both JWT and NextAuth sessions
export async function authenticateRequest(request: NextRequest) {
  // First, try JWT authentication (email/password login)
  const token = request.cookies.get('auth-token')?.value

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          isVerified: true,
          role: true
        }
      })

      if (user) return user
    }
  }

  // If no JWT, try NextAuth session (OAuth login)
  const nextAuthSessionToken = request.cookies.get('next-auth.session-token')?.value ||
                                request.cookies.get('__Secure-next-auth.session-token')?.value

  if (nextAuthSessionToken) {
    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken: nextAuthSessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            isVerified: true,
            role: true
          }
        }
      }
    })

    // Check if session exists and hasn't expired
    if (session && session.expires > new Date()) {
      return session.user
    }
  }

  return null
}