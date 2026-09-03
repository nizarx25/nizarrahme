import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, revokeToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth.authenticated && auth.token) {
    revokeToken(auth.token)
  }

  // Clear cookie regardless of auth state
  const cookie = sessionCookieOptions()
  const response = NextResponse.json({ success: true })
  response.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 })
  return response
}