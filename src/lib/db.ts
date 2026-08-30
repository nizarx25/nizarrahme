import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient | null = null
let _dbFailed = false

/** Check if a real database is configured (has DATABASE_URL env var). */
function hasDbConfig(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
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
    _dbFailed = true
    return null
  }
}

/**
 * Lazy Prisma client that won't crash on import if prisma generate hasn't run.
 * Returns undefined for any property access if DB is not available.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb()
    return client ? (client as Record<string | symbol, unknown>)[prop] : undefined
  },
})

/** Return a usable Prisma client, or null when database access is not configured. */
export function getDb(): PrismaClient | null {
  if (_dbFailed || !hasDbConfig()) return null
  if (!_db) {
    _db = globalForPrisma.prisma ?? createDb()
    if (!_db) _dbFailed = true
  }
  return _db
}

/**
 * Returns true only if DATABASE_URL is set AND Prisma client initialized successfully.
 */
export function isDbAvailable(): boolean {
  return getDb() !== null
}
