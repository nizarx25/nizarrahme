import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient | null = null
let _dbFailed = false

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
 * Returns null if Prisma client cannot be initialized (e.g. on Vercel without DB).
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (_dbFailed) return undefined
    if (!_db) {
      _db = globalForPrisma.prisma ?? createDb()
      if (!_db) {
        _dbFailed = true
        return undefined
      }
    }
    return (_db as Record<string | symbol, unknown>)[prop]
  },
})

export function isDbAvailable(): boolean {
  if (_dbFailed) return false
  if (!_db) {
    _db = globalForPrisma.prisma ?? createDb()
  }
  return _db !== null
}
