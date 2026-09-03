/**
 * Redis-backed authentication primitives.
 *
 * These functions mirror the Prisma-backed ones in `auth.ts` so that
 * route handlers can call them through a single façade.
 *
 *   authenticateAdmin / bootstrapAdmin / requireAuth / logout
 *
 * On environments where Redis is unavailable (env vars missing), the
 * functions throw a `RedisUnavailableError` so the caller can fall back to
 * Prisma (local dev) or return a 503 (production with no Redis configured).
 */
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isRedisAvailable } from './redis'
import {
  createAdmin,
  findAdminByEmail,
  updateAdminPassword,
  LEGACY_SALT,
} from './admin-store'
import { readSession, revokeSession, storeSession, TOKEN_TTL_MS } from './session-store'

const BCRYPT_ROUNDS = 12
const COOKIE_NAME = 'admin_session'

export class RedisUnavailableError extends Error {
  constructor() {
    super('Redis is not configured')
    this.name = 'RedisUnavailableError'
  }
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function legacyHash(password: string): string {
  return createHash('sha256').update(password + LEGACY_SALT).digest('hex')
}

async function verifyAndMaybeUpgrade(
  stored: string,
  candidate: string,
  userId: string,
  email: string,
): Promise<boolean> {
  if (!stored) return false
  if (stored.startsWith('$2')) {
    return bcrypt.compare(candidate, stored)
  }
  if (stored === legacyHash(candidate)) {
    try {
      const upgraded = await hashPassword(candidate)
      await updateAdminPassword(userId, upgraded)
    } catch {
      // Best-effort upgrade; never fail login because of it
    }
    return true
  }
  return false
}

export async function authenticateAdminRedis(
  email: string,
  password: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!isRedisAvailable()) throw new RedisUnavailableError()

  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const user = await findAdminByEmail(cleanEmail)
  if (!user) {
    return { success: false, error: 'Invalid credentials' }
  }

  const ok = await verifyAndMaybeUpgrade(user.password, password, user.id, user.email)
  if (!ok) return { success: false, error: 'Invalid credentials' }

  const token = generateToken()
  await storeSession(token, { email: user.email, role: user.role })
  return { success: true, token }
}

export async function bootstrapAdminRedis(): Promise<{
  created: boolean
  email?: string
  error?: string
}> {
  if (!isRedisAvailable()) throw new RedisUnavailableError()

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

  const existing = await findAdminByEmail(email)
  if (existing) return { created: false, email }

  const hashed = await hashPassword(password)
  await createAdmin({ email, password: hashed, role: 'admin' })
  delete process.env.ADMIN_BOOTSTRAP_PASSWORD
  return { created: true, email }
}

function readTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim() || null
  }
  return null
}

export async function requireAuthRedis(request: NextRequest): Promise<{
  authenticated: boolean
  error?: string
  token?: string
  email?: string
}> {
  if (!isRedisAvailable()) throw new RedisUnavailableError()

  const token = readTokenFromRequest(request)
  if (!token) return { authenticated: false, error: 'Missing or invalid session' }

  const entry = await readSession(token)
  if (!entry) return { authenticated: false, error: 'Invalid or expired session' }

  return { authenticated: true, token, email: entry.email }
}

export async function logoutRedis(token: string): Promise<void> {
  if (!isRedisAvailable()) throw new RedisUnavailableError()
  await revokeSession(token)
}

export { TOKEN_TTL_MS }
export const ADMIN_COOKIE_NAME = COOKIE_NAME