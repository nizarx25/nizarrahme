import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient | null = null
let _dbAvailable = false
let _dbChecked = false

/**
 * Database availability check.
 * - Vercel: only enabled if a Postgres-style DATABASE_URL is provided.
 * - Local: enabled for any DATABASE_URL (SQLite file: works fine in dev).
 */
function shouldUseDb(): boolean {
  if (!process.env.DATABASE_URL) return false

  // SQLite files don't work on serverless platforms (Vercel has no persistent fs)
  if (process.env.VERCEL && process.env.DATABASE_URL.startsWith('file:')) {
    return false
  }

  return true
}

function createDb(): PrismaClient | null {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  } catch (error) {
    console.error('[db] Failed to initialize PrismaClient:', error)
    _dbAvailable = false
    _dbChecked = true
    return null
  }
}

/**
 * Lazy Prisma client proxy. Returns undefined for all property access
 * when database is not available (Vercel, missing DATABASE_URL, etc.).
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_dbChecked) {
      _dbChecked = true
      if (!shouldUseDb()) {
        _dbAvailable = false
        return undefined
      }
      _db = globalForPrisma.prisma ?? createDb()
      _dbAvailable = _db !== null
    }
    if (!_dbAvailable) return undefined
    return (_db as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Returns true only if we're in an environment with a working database.
 */
export function isDbAvailable(): boolean {
  if (!_dbChecked) {
    _dbChecked = true
    if (!shouldUseDb()) {
      _dbAvailable = false
      return false
    }
    _db = globalForPrisma.prisma ?? createDb()
    _dbAvailable = _db !== null
  }
  return _dbAvailable
}
