/**
 * Storage availability shim.
 *
 * Admin users, sessions, inquiries and rate limits used to live in Upstash
 * Redis. They now live in Postgres through Prisma. The old function name is
 * kept so existing callers keep working: "available" means a database is
 * configured.
 */
import { isDbAvailable } from './db'

export function isRedisAvailable(): boolean {
  return isDbAvailable()
}
