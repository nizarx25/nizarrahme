/**
 * Postgres-backed admin user store (Prisma `AdminUser`).
 */
import { db } from './db'

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

function toUser(r: { id: string; email: string; password: string; role: string; createdAt: Date }): AdminUser {
  return {
    id: r.id,
    email: r.email,
    password: r.password,
    role: (r.role === 'superadmin' ? 'superadmin' : 'admin') as AdminRole,
    createdAt: r.createdAt.toISOString(),
  }
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const r = await db.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } })
  return r ? toUser(r) : null
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  const r = await db.adminUser.findUnique({ where: { id } })
  return r ? toUser(r) : null
}

export async function createAdmin(input: {
  email: string
  password: string // already hashed (bcrypt)
  role?: AdminRole
}): Promise<AdminUser> {
  const email = input.email.trim().toLowerCase()
  const existing = await findAdminByEmail(email)
  if (existing) return existing
  const r = await db.adminUser.create({
    data: { email, password: input.password, role: input.role ?? 'admin' },
  })
  return toUser(r)
}

export async function updateAdminPassword(id: string, hashed: string): Promise<void> {
  await db.adminUser.updateMany({ where: { id }, data: { password: hashed } })
}

export async function listAdminIds(): Promise<string[]> {
  const rows = await db.adminUser.findMany({ select: { id: true } })
  return rows.map((r) => r.id)
}

export { LEGACY_SALT }
