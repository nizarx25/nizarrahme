import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

// Simple in-memory token store
// In production, use proper JWT with expiry, rotation, and secure storage
type TokenEntry = { email: string; role: string; createdAt: number }
const tokenStore = new Map<string, TokenEntry>()

// NOTE: This is a simplified auth system for MVP.
// In production, replace with:
//   - Proper JWT tokens with expiry and signing
//   - bcrypt/scrypt password hashing
//   - HttpOnly secure cookies
//   - CSRF protection
//   - Token refresh/rotation

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function authenticateAdmin(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  // Sanitize input
  const cleanEmail = email.trim().toLowerCase()
  const cleanPassword = password.trim()

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email and password are required' }
  }

  // Check if admin user exists
  let adminUser = await db.adminUser.findUnique({ where: { email: cleanEmail } })

  if (!adminUser) {
    // Create admin on first login attempt
    // The password is stored as sha256 hash with a static salt
    // NOTE: In production, use bcrypt with proper salt rounds
    const salt = 'nizar-domain-marketplace-salt-v1'
    const hashedPassword = hashPassword(cleanPassword, salt)
    adminUser = await db.adminUser.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
      },
    })
  }

  // Verify password
  const salt = 'nizar-domain-marketplace-salt-v1'
  const hashedInput = hashPassword(cleanPassword, salt)

  if (adminUser.password !== hashedInput) {
    return { success: false, error: 'Invalid credentials' }
  }

  // Generate and store token
  const token = generateToken()
  tokenStore.set(token, {
    email: adminUser.email,
    role: adminUser.role,
    createdAt: Date.now(),
  })

  // Clean old tokens (older than 24 hours)
 const now = Date.now()
  for (const [key, value] of tokenStore.entries()) {
    if (now - value.createdAt > 24 * 60 * 60 * 1000) {
      tokenStore.delete(key)
    }
  }

  return { success: true, token }
}

export function requireAuth(request: NextRequest): { authenticated: boolean; error?: string; token?: string } {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid authorization header' }
  }

  const token = authHeader.slice(7) // Remove 'Bearer ' prefix

  if (!tokenStore.has(token)) {
    return { authenticated: false, error: 'Invalid or expired token' }
  }

  return { authenticated: true, token }
}

// Simple input sanitization
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
}

// Rate limiter for in-memory rate limiting
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

    // Clean old attempts outside the window
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

    // Record this attempt
    attempts.push(now)
    this.attempts.set(key, attempts)

    return {
      allowed: true,
      remaining: this.maxAttempts - attempts.length,
      resetIn: Math.ceil(this.windowMs / 1000),
    }
  }
}

// Inquiry rate limiter: 5 submissions per IP per hour
export const inquiryRateLimiter = new RateLimiter(5, 60 * 60 * 1000)

// Parse JSON strings safely
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
