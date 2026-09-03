import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

// Server-side session store.
// In production, replace with a persistent store (Redis/DB) so sessions
// survive serverless restarts and can be revoked across instances.
type TokenEntry = { email: string; role: string; createdAt: number }
const tokenStore = new Map<string, TokenEntry>()

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const BCRYPT_ROUNDS = 12
const COOKIE_NAME = 'admin_session'

// Legacy password hashing — kept to support a one-time transparent migration
// of any rows stored under the old scheme.
const LEGACY_SALT = 'nizar-domain-marketplace-salt-v1'

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

/** Hash a plaintext password with bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/** Legacy SHA-256 + static-salt hash used by the original implementation. */
export function legacyHash(password: string): string {
  return createHash('sha256').update(password + LEGACY_SALT).digest('hex')
}

/**
 * Verify a password against the stored hash.
 * If the stored hash uses the legacy SHA-256 scheme, transparently upgrade it
 * to bcrypt on a successful match.
 */
async function verifyAndMaybeUpgrade(
  stored: string,
  candidate: string,
  userId: string,
): Promise<boolean> {
  if (!stored) return false
  if (stored.startsWith('$2')) {
    return bcrypt.compare(candidate, stored)
  }
  if (stored === legacyHash(candidate)) {
    try {
      const upgraded = await hashPassword(candidate)
      await db.adminUser.update({ where: { id: userId }, data: { password: upgraded } })
    } catch {
      // Best-effort upgrade; never fail login because of it
    }
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/** Remove tokens older than TOKEN_TTL_MS. */
function purgeExpiredTokens() {
  const now = Date.now()
  for (const [key, value] of tokenStore.entries()) {
    if (now - value.createdAt > TOKEN_TTL_MS) {
      tokenStore.delete(key)
    }
  }
}

/** Invalidate a single token. */
export function revokeToken(token: string): void {
  tokenStore.delete(token)
}

/** Persist a token in the server-side store. */
export function storeToken(token: string, email: string, role: string): void {
  tokenStore.set(token, { email, role, createdAt: Date.now() })
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Authenticate an admin user.
 *
 * SECURITY:
 *   - Never auto-creates users. Unknown emails always return "Invalid credentials".
 *   - Use `bootstrapAdmin` to seed the very first admin from environment variables.
 */
export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanPassword = password

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email and password are required' }
  }

  const adminUser = await db.adminUser.findUnique({ where: { email: cleanEmail } })
  if (!adminUser) {
    return { success: false, error: 'Invalid credentials' }
  }

  const ok = await verifyAndMaybeUpgrade(adminUser.password, cleanPassword, adminUser.id)
  if (!ok) {
    return { success: false, error: 'Invalid credentials' }
  }

  purgeExpiredTokens()
  const token = generateToken()
  storeToken(token, adminUser.email, adminUser.role)

  return { success: true, token }
}

/**
 * One-time bootstrap helper: creates an admin user only when explicitly enabled
 * via environment variables. Safe default is "disabled".
 */
export async function bootstrapAdmin(): Promise<{
  created: boolean
  email?: string
  error?: string
}> {
  const enabled = process.env.ALLOW_ADMIN_BOOTSTRAP === 'true'
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD

  if (!enabled) return { created: false }
  if (!email || !password) {
    return {
      created: false,
      error:
        'ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD required when ALLOW_ADMIN_BOOTSTRAP=true',
    }
  }
  if (password.length < 12) {
    return { created: false, error: 'ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters' }
  }

  const existing = await db.adminUser.findUnique({ where: { email } })
  if (existing) return { created: false, email }

  const hashed = await hashPassword(password)
  await db.adminUser.create({
    data: { email, password: hashed, role: 'admin' },
  })

  delete process.env.ADMIN_BOOTSTRAP_PASSWORD
  return { created: true, email }
}

// ---------------------------------------------------------------------------
// Auth check (reads from cookie OR Authorization header for backward compat)
// ---------------------------------------------------------------------------

/** Read a session token from a request, checking cookie first then header. */
function readTokenFromRequest(request: NextRequest): string | null {
  // Preferred: HttpOnly cookie
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  // Fallback: Authorization header (for tools/CLI that can't set cookies)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim() || null
  }

  return null
}

export function requireAuth(request: NextRequest): {
  authenticated: boolean
  error?: string
  token?: string
  email?: string
} {
  const token = readTokenFromRequest(request)
  if (!token) {
    return { authenticated: false, error: 'Missing or invalid session' }
  }

  const entry = tokenStore.get(token)
  if (!entry) {
    return { authenticated: false, error: 'Invalid or expired session' }
  }

  if (Date.now() - entry.createdAt > TOKEN_TTL_MS) {
    tokenStore.delete(token)
    return { authenticated: false, error: 'Invalid or expired session' }
  }

  return { authenticated: true, token, email: entry.email }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/** Build the Set-Cookie options for the session cookie. */
export function sessionCookieOptions(): {
  name: string
  options: Parameters<NextResponse['cookies']['set']>[2]
} {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    name: COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_TTL_MS / 1000,
    },
  }
}

// ---------------------------------------------------------------------------
// Input sanitization
// ---------------------------------------------------------------------------

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory; sufficient for single-instance deployments)
// ---------------------------------------------------------------------------

export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number, windowMs: number) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const windowStart = now - this.windowMs

    let attempts = this.attempts.get(key) || []
    attempts = attempts.filter((timestamp) => timestamp > windowStart)
    this.attempts.set(key, attempts)

    if (attempts.length >= this.maxAttempts) {
      const oldestInWindow = attempts[0]
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((oldestInWindow + this.windowMs - now) / 1000),
      }
    }

    attempts.push(now)
    this.attempts.set(key, attempts)

    return {
      allowed: true,
      remaining: this.maxAttempts - attempts.length,
      resetIn: Math.ceil(this.windowMs / 1000),
    }
  }
}

/** Inquiry submissions: 5 per IP per hour. */
export const inquiryRateLimiter = new RateLimiter(5, 60 * 60 * 1000)

/** Admin login attempts: 5 per IP per minute. */
export const adminLoginRateLimiter = new RateLimiter(5, 60 * 1000)

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

// Silence "NextRequest is unused" when only types are needed
export type { NextRequest }

// Re-export for convenience
import { NextResponse } from 'next/server'