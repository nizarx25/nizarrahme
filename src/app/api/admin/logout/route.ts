import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, revokeToken, sessionCookieOptions } from '@/lib/auth'
import { logoutRedis } from '@/lib/auth-redis'
import { isRedisAvailable } from '@/lib/redis'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.authenticated && auth.token) {
    if (isRedisAvailable()) {
      try {
        await logoutRedis(auth.token)
      } catch {
        // Fall through to in-memory revoke
        revokeToken(auth.token)
      }
    } else {
      revokeToken(auth.token)
    }
  }

  // Clear cookie regardless of auth state
  const cookie = sessionCookieOptions()
  const response = NextResponse.json({ success: true })
  response.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 })
  return response
}