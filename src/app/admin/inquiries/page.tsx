import { Suspense } from 'react'
import { listInquiries } from '@/lib/inquiry-store'
import { isRedisAvailable } from '@/lib/redis'
import { db } from '@/lib/db'
import { InquiriesList } from './inquiries-list'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

type SearchParams = {
  status?: string
  page?: string
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 20

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and respond to customer inquiries.
        </p>
      </div>

      <Suspense
        key={`${sp.status ?? ''}-${page}`}
        fallback={<Skeleton className="h-96" />}
      >
        <InquiriesLoader searchParams={sp} page={page} limit={limit} />
      </Suspense>
    </div>
  )
}

type InquiryRow = {
  id: string
  name: string
  email: string
  company: string | null
  offerAmount: number | null
  intendedUse: string | null
  message: string
  status: 'New' | 'Read' | 'Replied' | 'Archived'
  adminNotes: string
  domainName: string | null
  domainSlug: string | null
  createdAt: string
}

async function InquiriesLoader({
  searchParams,
  page,
  limit,
}: {
  searchParams: SearchParams
  page: number
  limit: number
}) {
  let inquiries: InquiryRow[] = []
  let total = 0
  let backend: 'redis' | 'prisma' = 'prisma'
  let error: string | null = null

  try {
    if (isRedisAvailable()) {
      backend = 'redis'
      const result = await listInquiries({
        status: (searchParams.status as InquiryRow['status']) || undefined,
        page,
        limit,
      })
      inquiries = result.inquiries.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        company: i.company,
        offerAmount: i.offerAmount,
        intendedUse: i.intendedUse,
        message: i.message,
        status: i.status,
        adminNotes: i.adminNotes,
        domainName: i.domainName ?? null,
        domainSlug: i.domainSlug ?? null,
        createdAt: i.createdAt,
      }))
      total = result.total
    } else {
      const where: Record<string, unknown> = {}
      if (searchParams.status) where.status = searchParams.status
      const [rows, count] = await Promise.all([
        db.inquiry.findMany({
          where,
          include: { domain: { select: { name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.inquiry.count({ where }),
      ])
      inquiries = rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        company: r.company,
        offerAmount: r.offerAmount,
        intendedUse: r.intendedUse,
        message: r.message,
        status: r.status as InquiryRow['status'],
        adminNotes: r.adminNotes,
        domainName: r.domain?.name ?? null,
        domainSlug: r.domain?.slug ?? null,
        createdAt: r.createdAt.toISOString(),
      }))
      total = count
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load inquiries: {error}
      </div>
    )
  }

  return (
    <InquiriesList
      inquiries={inquiries}
      total={total}
      page={page}
      limit={limit}
      filters={{ status: searchParams.status ?? '' }}
      backend={backend}
    />
  )
}