'use server'

import { cookies } from 'next/headers'
import { verifyRefreshToken, generateToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function refreshAuthToken() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh-token')?.value

    if (!refreshToken) {
      return { error: "No refresh token found" }
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return { error: "Invalid refresh token" }
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        isVerified: true
      }
    })

    if (!user || !user.isVerified) {
      return { error: "User not found or not verified" }
    }

    // Generate new access token
    const newToken = generateToken({
      userId: user.id,
      email: user.email
    })

    // Set new token in cookie
    cookieStore.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return {
      success: true,
      token: newToken
    }

  } catch (error) {
    console.error('Token refresh error:', error)
    return { error: "Failed to refresh token" }
  }
}