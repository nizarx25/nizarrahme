/**
 * Redis-backed admin user store.
 *
 * Each admin user is a JSON blob stored under:
 *   - app:admin:by-email:<lowercased-email> -> { id, email, password, role, createdAt }
 *   - app:admin:by-id:<id>                  -> { id, email, password, role, createdAt }
 *
 * A Redis set `app:admin:ids` keeps track of all admin ids so we can list them
 * without scanning (SCAN is expensive on Upstash).
 */
import { Redis } from '@upstash/redis'
import { getRedis, RedisKeys } from './redis'

export type AdminRole = 'admin' | 'superadmin'

export type AdminUser = {
  id: string
  email: string
  /** bcrypt hash (legacy: SHA-256+salt) */
  password: string
  role: AdminRole
  createdAt: string
}

const LEGACY_SALT = 'nizar-domain-marketplace-salt-v1'

function requireClient(): Redis {
  const client = getRedis()
  if (!client) {
    throw new Error('Redis is not configured (missing UPSTASH_REDIS_REST_URL/TOKEN)')
  }
  return client
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const client = getRedis()
  if (!client) return null
  const user = (await client.get<AdminUser>(RedisKeys.adminByEmail(email))) ?? null
  return user
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  const client = getRedis()
  if (!client) return null
  const user = (await client.get<AdminUser>(RedisKeys.adminById(id))) ?? null
  return user
}

export async function createAdmin(input: {
  email: string
  password: string // already hashed (bcrypt)
  role?: AdminRole
}): Promise<AdminUser> {
  const client = requireClient()
  const cleanEmail = input.email.trim().toLowerCase()

  const existing = await findAdminByEmail(cleanEmail)
  if (existing) return existing

  const user: AdminUser = {
    id: cryptoRandomId(),
    email: cleanEmail,
    password: input.password,
    role: input.role ?? 'admin',
    createdAt: new Date().toISOString(),
  }

  // Two writes to support both lookup paths.
  await Promise.all([
    client.set(RedisKeys.adminByEmail(cleanEmail), user),
    client.set(RedisKeys.adminById(user.id), user),
    client.sadd(RedisKeys.adminList(), user.id),
  ])

  return user
}

export async function updateAdminPassword(id: string, hashed: string): Promise<void> {
  const client = requireClient()
  const user = await findAdminById(id)
  if (!user) return
  const updated: AdminUser = { ...user, password: hashed }
  await Promise.all([
    client.set(RedisKeys.adminByEmail(user.email), updated),
    client.set(RedisKeys.adminById(id), updated),
  ])
}

export async function listAdminIds(): Promise<string[]> {
  const client = getRedis()
  if (!client) return []
  return (await client.smembers(RedisKeys.adminList())) ?? []
}

function cryptoRandomId(): string {
  // 16 bytes → 32 hex chars. Plenty for our use case.
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export { LEGACY_SALT }