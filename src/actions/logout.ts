'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  try {
    const cookieStore = await cookies()
    
    // Clear authentication cookiesi
    cookieStore.delete('auth-token')
    cookieStore.delete('refresh-token')
    
    return {
      success: true,
      message: "Logged out successfully"
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      error: "An error occurred during logout"
    }
  }
}

export async function logoutAndRedirect() {
  await logout()
  redirect('/auth/login')
}