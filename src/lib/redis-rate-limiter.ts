/**
 * Distributed rate limiter backed by Redis.
 *
 * Strategy: per-key sliding-window via Redis ZSET. For each check we:
 *   1. Drop entries older than `now - windowMs`.
 *   2. Count the remaining.
 *   3. If under the limit, add a new entry with score = now.
 *   4. Set TTL on the key so abandoned keys clean up automatically.
 *
 * When Redis is unavailable, the limiter fails open (allows the request) so
 * that the public site is never blocked by a missing dependency.
 */
import { Redis } from '@upstash/redis'
import { getRedis, RedisKeys } from './redis'

export type RateLimitResult = { allowed: boolean; remaining: number; resetIn: number }

type Bucket = {
  ts: number
}

function requireClient(): Redis {
  const client = getRedis()
  if (!client) {
    throw new Error('Redis is not configured (missing UPSTASH_REDIS_REST_URL/TOKEN)')
  }
  return client
}

export async function redisRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const client = getRedis()
  if (!client) {
    // Fail open when not configured to keep public site functional
    return { allowed: true, remaining: maxAttempts, resetIn: Math.ceil(windowMs / 1000) }
  }

  const fullKey = RedisKeys.rateLimit(key)
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    // 1. Drop expired entries
    await client.zremrangebyscore(fullKey, 0, windowStart)

    // 2. Count current
    const current = await client.zcard(fullKey)

    if (current >= maxAttempts) {
      // Find the oldest entry to compute resetIn
      const oldest = (await client.zrange(fullKey, 0, 0, { withScores: true })) as Array<string | number>
      let resetIn = Math.ceil(windowMs / 1000)
      if (Array.isArray(oldest) && oldest.length >= 2) {
        const oldestScore = Number(oldest[1])
        if (!Number.isNaN(oldestScore)) {
          resetIn = Math.ceil((oldestScore + windowMs - now) / 1000)
        }
      }
      return { allowed: false, remaining: 0, resetIn }
    }

    // 3. Add this attempt
    const entry: Bucket = { ts: now }
    await client.zadd(fullKey, { score: now, member: `${now}-${Math.random().toString(36).slice(2, 10)}` })

    // 4. Set TTL slightly longer than window so it self-cleans
    await client.expire(fullKey, Math.ceil((windowMs + 1000) / 1000))

    return {
      allowed: true,
      remaining: maxAttempts - current - 1,
      resetIn: Math.ceil(windowMs / 1000),
    }
  } catch (error) {
    console.error('[rate-limit] Redis error, failing open:', error)
    return { allowed: true, remaining: maxAttempts, resetIn: Math.ceil(windowMs / 1000) }
  }
}

/** Pre-configured limiters that match the in-memory defaults. */
export const RATE_LIMITS = {
  adminLogin: { max: 5, windowMs: 60 * 1000 },
  inquirySubmit: { max: 5, windowMs: 60 * 60 * 1000 },
} as const