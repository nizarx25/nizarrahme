/**
 * Redis-backed session store.
 *
 * Tokens live under `app:session:<token>` with a TTL equal to TOKEN_TTL_MS.
 * On lookup we refresh the TTL to implement sliding expiry.
 */
import { Redis } from '@upstash/redis'
import { getRedis, RedisKeys } from './redis'

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export type SessionPayload = {
  email: string
  role: string
  createdAt: number
}

function requireClient(): Redis {
  const client = getRedis()
  if (!client) {
    throw new Error('Redis is not configured (missing UPSTASH_REDIS_REST_URL/TOKEN)')
  }
  return client
}

export async function storeSession(token: string, payload: Omit<SessionPayload, 'createdAt'>): Promise<void> {
  const client = requireClient()
  const value: SessionPayload = { ...payload, createdAt: Date.now() }
  await client.set(RedisKeys.session(token), value, { ex: Math.ceil(TOKEN_TTL_MS / 1000) })
}

export async function readSession(token: string): Promise<SessionPayload | null> {
  const client = getRedis()
  if (!client) return null
  const value = await client.get<SessionPayload>(RedisKeys.session(token))
  if (!value) return null
  // Sliding TTL: refresh expiry on each successful auth check
  await client.expire(RedisKeys.session(token), Math.ceil(TOKEN_TTL_MS / 1000))
  return value
}

export async function revokeSession(token: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  await client.del(RedisKeys.session(token))
}