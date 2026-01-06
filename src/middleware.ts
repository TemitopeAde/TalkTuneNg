import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const marketingDomain = process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/^https?:\/\//, "");
const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "");

const protectedRoutes = ['/dashboard', '/admin', '/settings', '/profile', '/api/user', '/api/scripts', '/api/flutterwave/payment']
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify']
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/verify-otp', '/api/auth/resend-otp', '/api/flutterwave/webhook', '/api/auth/callback', '/api/auth/signin', '/api/auth/signout', '/api/auth/session', '/api/auth/providers', '/api/auth/csrf']

export async function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE RUNNING ===')
  console.log('Path:', request.nextUrl.pathname)

  const url = request.nextUrl.clone()
  const host = request.headers.get("host")
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Check for NextAuth session token (database sessions)
  const nextAuthSessionToken = request.cookies.get('next-auth.session-token')?.value ||
                                request.cookies.get('__Secure-next-auth.session-token')?.value

  console.log('Host:', host, 'Has JWT Token:', !!token, 'Has NextAuth Session:', !!nextAuthSessionToken)

  if (!host) return NextResponse.next()

  const isAppContext = host === appDomain || host?.startsWith('localhost:') || host?.startsWith('127.0.0.1:')
  const isMarketingContext = host === marketingDomain

  // Skip marketing context rewrite on localhost (both domains are localhost:3000)
  // The root page.tsx will handle routing for the root path
  if (isMarketingContext && !host?.startsWith('localhost:') && !host?.startsWith('127.0.0.1:')) {
    if (!url.pathname.startsWith("/(main)")) {
      url.pathname = `/(main)${url.pathname === "/" ? "" : url.pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  if (isAppContext) {
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))


    if (isPublicApiRoute) return NextResponse.next()

    // User is authenticated via NextAuth (database session)
    if (nextAuthSessionToken) {
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // For database sessions, we can't easily get user info from the cookie
      // The SessionProvider will handle this on the client side
      return NextResponse.next()
    }

    if (isProtectedRoute && !token && !nextAuthSessionToken) {

      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // User is authenticated via custom JWT
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)

        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', payload.userId as string)
        requestHeaders.set('x-user-email', payload.email as string)

        return NextResponse.next({ request: { headers: requestHeaders } })
      } catch (error) {
        console.error('Token verification failed:', error)

        // Clear the invalid token
        const isApiRoute = pathname.startsWith('/api/')

        if (isProtectedRoute) {
          // For API routes, return 401 instead of redirecting
          if (isApiRoute) {
            const response = NextResponse.json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            )
            response.cookies.delete('auth-token')
            response.cookies.delete('refresh-token')
            return response
          }

          // For page routes, redirect to login
          const response = NextResponse.redirect(new URL('/auth/login', request.url))
          response.cookies.delete('auth-token')
          response.cookies.delete('refresh-token')
          return response
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}