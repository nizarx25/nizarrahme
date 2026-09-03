import { Redis } from '@upstash/redis'

/**
 * Redis client singleton (Upstash REST).
 *
 * Returns `null` (not throws) when env vars are missing so that the public
 * site keeps working in environments where Redis is not configured (e.g. a
 * local preview without Upstash credentials). All callers must therefore
 * check `isRedisAvailable()` before using the client.
 */
let _client: Redis | null = null
let _checked = false
let _available = false

function buildClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  return new Redis({ url, token })
}

export function getRedis(): Redis | null {
  if (!_checked) {
    _checked = true
    _client = buildClient()
    _available = _client !== null
  }
  return _client
}

export function isRedisAvailable(): boolean {
  // Trigger lazy init
  getRedis()
  return _available
}

/**
 * Key helpers — centralize the namespace so we can grep or migrate later.
 * Convention: `app:<entity>:<id>`
 */
export const RedisKeys = {
  adminByEmail: (email: string) => `app:admin:by-email:${email.toLowerCase()}`,
  adminById: (id: string) => `app:admin:by-id:${id}`,
  adminList: () => 'app:admin:ids',
  session: (token: string) => `app:session:${token}`,
  inquiry: (id: string) => `app:inquiry:${id}`,
  inquiryList: () => 'app:inquiry:ids',
  rateLimit: (key: string) => `app:ratelimit:${key}`,
} as const