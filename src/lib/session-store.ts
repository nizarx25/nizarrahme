/**
 * Postgres-backed session store (Prisma `AdminSession`).
 * Sliding expiry: each successful lookup extends the session.
 */
import { db } from './db'

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export type SessionPayload = {
  email: string
  role: string
  createdAt: number
}

export async function storeSession(token: string, payload: Omit<SessionPayload, 'createdAt'>): Promise<void> {
  const now = Date.now()
  await db.adminSession.create({
    data: {
      token,
      email: payload.email,
      role: payload.role,
      createdAt: new Date(now),
      expiresAt: new Date(now + TOKEN_TTL_MS),
    },
  })
  // Opportunistic cleanup of expired sessions
  await db.adminSession.deleteMany({ where: { expiresAt: { lt: new Date(now) } } }).catch(() => {})
}

export async function readSession(token: string): Promise<SessionPayload | null> {
  const row = await db.adminSession.findUnique({ where: { token } })
  if (!row) return null
  if (row.expiresAt.getTime() < Date.now()) {
    await db.adminSession.deleteMany({ where: { token } }).catch(() => {})
    return null
  }
  await db.adminSession.update({
    where: { token },
    data: { expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  })
  return { email: row.email, role: row.role, createdAt: row.createdAt.getTime() }
}

export async function revokeSession(token: string): Promise<void> {
  await db.adminSession.deleteMany({ where: { token } })
}
