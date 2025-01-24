import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Pages that don't require authentication
const publicPages = ['/', '/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public pages
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {  // Remove error parameter entirely
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
}

// Add paths that need authentication
export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/api/credits/:path*']
} 