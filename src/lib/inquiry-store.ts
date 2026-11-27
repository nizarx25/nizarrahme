/**
 * Postgres-backed inquiry store (Prisma `Inquiry`).
 */
import { db } from './db'

export type InquiryStatus = 'New' | 'Read' | 'Replied' | 'Archived'

export type Inquiry = {
  id: string
  domainId: string | null
  domainSlug?: string | null
  domainName?: string | null
  inquiryType: string
  name: string
  email: string
  company: string | null
  offerAmount: number | null
  intendedUse: string | null
  message: string
  status: InquiryStatus
  adminNotes: string
  createdAt: string
  updatedAt: string
}

type Row = {
  id: string
  domainId: string | null
  domainSlug: string | null
  domainName: string | null
  inquiryType: string
  name: string
  email: string
  company: string | null
  offerAmount: number | null
  intendedUse: string | null
  message: string
  status: string
  adminNotes: string
  createdAt: Date
  updatedAt: Date
}

function toInquiry(r: Row): Inquiry {
  return {
    id: r.id,
    domainId: r.domainId,
    domainSlug: r.domainSlug,
    domainName: r.domainName,
    inquiryType: r.inquiryType,
    name: r.name,
    email: r.email,
    company: r.company,
    offerAmount: r.offerAmount,
    intendedUse: r.intendedUse,
    message: r.message,
    status: r.status as InquiryStatus,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export type CreateInquiryInput = {
  domainId: string | null
  domainSlug?: string | null
  domainName?: string | null
  inquiryType?: string
  name: string
  email: string
  company?: string | null
  offerAmount?: number | null
  intendedUse?: string | null
  message: string
}

export async function createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
  const r = await db.inquiry.create({
    data: {
      domainId: input.domainId,
      domainSlug: input.domainSlug ?? null,
      domainName: input.domainName ?? null,
      inquiryType: input.inquiryType ?? 'domain_offer',
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      offerAmount: input.offerAmount ?? null,
      intendedUse: input.intendedUse ?? null,
      message: input.message,
    },
  })
  return toInquiry(r as Row)
}

export type ListInquiriesOptions = {
  status?: InquiryStatus
  page?: number
  limit?: number
}

export type ListInquiriesResult = {
  inquiries: Inquiry[]
  total: number
  page: number
  limit: number
}

export async function listInquiries(options: ListInquiriesOptions = {}): Promise<ListInquiriesResult> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 50))
  const where = options.status ? { status: options.status } : {}
  const [rows, total] = await Promise.all([
    db.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.inquiry.count({ where }),
  ])
  return { inquiries: (rows as Row[]).map(toInquiry), total, page, limit }
}

export async function findInquiryById(id: string): Promise<Inquiry | null> {
  const r = await db.inquiry.findUnique({ where: { id } })
  return r ? toInquiry(r as Row) : null
}

export async function updateInquiry(
  id: string,
  patch: { status?: InquiryStatus; adminNotes?: string },
): Promise<Inquiry | null> {
  const existing = await db.inquiry.findUnique({ where: { id } })
  if (!existing) return null
  const r = await db.inquiry.update({
    where: { id },
    data: { status: patch.status ?? undefined, adminNotes: patch.adminNotes ?? undefined },
  })
  return toInquiry(r as Row)
}

export async function inquiryStats(): Promise<{
  total: number
  newCount: number
  repliedCount: number
}> {
  try {
    const [total, newCount, repliedCount] = await Promise.all([
      db.inquiry.count(),
      db.inquiry.count({ where: { status: 'New' } }),
      db.inquiry.count({ where: { status: 'Replied' } }),
    ])
    return { total, newCount, repliedCount }
  } catch {
    return { total: 0, newCount: 0, repliedCount: 0 }
  }
}
