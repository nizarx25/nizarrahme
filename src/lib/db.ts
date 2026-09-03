import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient | null = null
let _dbAvailable = false
let _dbChecked = false

/**
 * On Vercel, there is no SQLite database.
 * Detect Vercel by the VERCEL environment variable that Vercel always sets.
 * Also check for SQLite file: URLs which won't work on serverless.
 */
function shouldUseDb(): boolean {
  // On Vercel, never use DB (no SQLite filesystem available)
  if (process.env.VERCEL) return false

  // If no DATABASE_URL, can't use DB
  if (!process.env.DATABASE_URL) return false

  // SQLite file: URLs don't work on serverless platforms
  if (process.env.DATABASE_URL.startsWith('file:') && process.env.NODE_ENV === 'production') {
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
