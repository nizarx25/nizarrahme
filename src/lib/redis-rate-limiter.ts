/**
 * Sliding-window rate limiter backed by Postgres (Prisma `RateLimitHit`).
 * Fails open when the database is unavailable so the public site never
 * blocks on it. (File name kept for existing imports.)
 */
import { db, isDbAvailable } from './db'

export type RateLimitResult = { allowed: boolean; remaining: number; resetIn: number }

export async function redisRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!isDbAvailable()) {
    return { allowed: true, remaining: maxAttempts, resetIn: Math.ceil(windowMs / 1000) }
  }
  const now = Date.now()
  const windowStart = new Date(now - windowMs)
  try {
    await db.rateLimitHit.deleteMany({ where: { key, at: { lt: windowStart } } })
    const current = await db.rateLimitHit.count({ where: { key } })
    if (current >= maxAttempts) {
      const oldest = await db.rateLimitHit.findFirst({ where: { key }, orderBy: { at: 'asc' } })
      const resetIn = oldest
        ? Math.max(1, Math.ceil((oldest.at.getTime() + windowMs - now) / 1000))
        : Math.ceil(windowMs / 1000)
      return { allowed: false, remaining: 0, resetIn }
    }
    await db.rateLimitHit.create({ data: { key } })
    return {
      allowed: true,
      remaining: maxAttempts - current - 1,
      resetIn: Math.ceil(windowMs / 1000),
    }
  } catch (error) {
    console.error('[rate-limit] DB error, failing open:', error)
    return { allowed: true, remaining: maxAttempts, resetIn: Math.ceil(windowMs / 1000) }
  }
}

/** Pre-configured limiters that match the in-memory defaults. */
export const RATE_LIMITS = {
  adminLogin: { max: 5, windowMs: 60 * 1000 },
  inquirySubmit: { max: 5, windowMs: 60 * 60 * 1000 },
} as const
