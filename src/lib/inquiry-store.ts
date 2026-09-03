/**
 * Redis-backed inquiry store.
 *
 * Each inquiry is stored as a JSON blob under `app:inquiry:<id>` and added to
 * a Redis sorted set `app:inquiry:ids` keyed by `createdAt` (ms) so we can
 * paginate newest-first without scanning all keys.
 */
import { Redis } from '@upstash/redis'
import { getRedis, RedisKeys } from './redis'

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

function requireClient(): Redis {
  const client = getRedis()
  if (!client) {
    throw new Error('Redis is not configured (missing UPSTASH_REDIS_REST_URL/TOKEN)')
  }
  return client
}

function cryptoRandomId(): string {
  const bytes = new Uint8Array(12)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
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
  const client = requireClient()
  const now = new Date().toISOString()
  const inquiry: Inquiry = {
    id: cryptoRandomId(),
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
    status: 'New',
    adminNotes: '',
    createdAt: now,
    updatedAt: now,
  }

  await Promise.all([
    client.set(RedisKeys.inquiry(inquiry.id), inquiry),
    client.zadd(RedisKeys.inquiryList(), { score: Date.now(), member: inquiry.id }),
  ])

  return inquiry
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
  const client = getRedis()
  if (!client) return { inquiries: [], total: 0, page: 1, limit: 0 }
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 50))

  // Newest first: highest score first
  const start = (page - 1) * limit
  const end = start + limit - 1
  const ids = (await client.zrange(RedisKeys.inquiryList(), start, end, { rev: true })) as string[]
  const total = await client.zcard(RedisKeys.inquiryList())

  if (ids.length === 0) return { inquiries: [], total, page, limit }

  const pipeline = client.pipeline()
  for (const id of ids) pipeline.get<Inquiry>(RedisKeys.inquiry(id))
  const results = await pipeline.exec<Inquiry[]>()

  const inquiries = (results ?? []).filter((i): i is Inquiry => !!i)
  const filtered = options.status ? inquiries.filter((i) => i.status === options.status) : inquiries

  return { inquiries: filtered, total, page, limit }
}

export async function findInquiryById(id: string): Promise<Inquiry | null> {
  const client = getRedis()
  if (!client) return null
  return (await client.get<Inquiry>(RedisKeys.inquiry(id))) ?? null
}

export async function updateInquiry(
  id: string,
  patch: { status?: InquiryStatus; adminNotes?: string },
): Promise<Inquiry | null> {
  const client = requireClient()
  const existing = await findInquiryById(id)
  if (!existing) return null
  const updated: Inquiry = {
    ...existing,
    status: patch.status ?? existing.status,
    adminNotes: patch.adminNotes ?? existing.adminNotes,
    updatedAt: new Date().toISOString(),
  }
  await client.set(RedisKeys.inquiry(id), updated)
  return updated
}

export async function inquiryStats(): Promise<{
  total: number
  newCount: number
  repliedCount: number
}> {
  const client = getRedis()
  if (!client) return { total: 0, newCount: 0, repliedCount: 0 }
  const total = await client.zcard(RedisKeys.inquiryList())
  // Cheap heuristic: scan a window of the most recent 200 for status counts.
  const ids = (await client.zrange(RedisKeys.inquiryList(), 0, 199, { rev: true })) as string[]
  if (ids.length === 0) return { total, newCount: 0, repliedCount: 0 }
  const pipeline = client.pipeline()
  for (const id of ids) pipeline.get<Inquiry>(RedisKeys.inquiry(id))
  const items = (await pipeline.exec<Inquiry[]>()) ?? []
  const list = items.filter((i): i is Inquiry => !!i)
  return {
    total,
    newCount: list.filter((i) => i.status === 'New').length,
    repliedCount: list.filter((i) => i.status === 'Replied').length,
  }
}