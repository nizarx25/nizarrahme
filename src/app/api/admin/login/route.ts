import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  authenticateAdmin,
  bootstrapAdmin,
  sessionCookieOptions,
} from '@/lib/auth'
import { isDbAvailable } from '@/lib/db'
import { redisRateLimit, RATE_LIMITS } from '@/lib/redis-rate-limiter'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  // Per-IP rate limit before parsing the body (distributed via Redis when available)
  const ip = clientIp(request)
  const rate = await redisRateLimit(`admin-login:${ip}`, RATE_LIMITS.adminLogin.max, RATE_LIMITS.adminLogin.windowMs)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
        resetIn: rate.resetIn,
      },
      { status: 429 },
    )
  }

  // When Redis is the auth backend, the DB check is irrelevant.
  // We still allow it for Prisma-backed local dev.
  const authUsesRedis = !!process.env.UPSTASH_REDIS_REST_URL
  if (!authUsesRedis && !isDbAvailable()) {
    return NextResponse.json(
      { error: 'Admin API not available in this environment' },
      { status: 503 },
    )
  }

  // Allow one-time bootstrap of the first admin via env vars
  await bootstrapAdmin()

  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 },
      )
    }

    const { email, password } = result.data
    const authResult = await authenticateAdmin(email, password)

    if (!authResult.success || !authResult.token) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Set HttpOnly cookie + return token (for clients that prefer header auth)
    const cookie = sessionCookieOptions()
    const response = NextResponse.json({
      success: true,
      token: authResult.token,
    })
    response.cookies.set(cookie.name, authResult.token, cookie.options)
    return response
  } catch (error) {
    console.error('Error during admin login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}