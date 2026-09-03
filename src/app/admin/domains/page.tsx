import { Suspense } from 'react'
import { db } from '@/lib/db'
import { DomainsTable } from './domains-table'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

type SearchParams = {
  search?: string
  status?: string
  featured?: string
  page?: string
}

export default async function AdminDomainsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 25

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Domains</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit pricing, descriptions, and featured flags.
        </p>
      </div>

      <Suspense
        key={`${sp.search ?? ''}-${sp.status ?? ''}-${sp.featured ?? ''}-${page}`}
        fallback={<Skeleton className="h-96" />}
      >
        <DomainsLoader searchParams={sp} page={page} limit={limit} />
      </Suspense>
    </div>
  )
}

async function DomainsLoader({
  searchParams,
  page,
  limit,
}: {
  searchParams: SearchParams
  page: number
  limit: number
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search } },
      { category: { contains: searchParams.search } },
    ]
  }
  if (searchParams.status) where.status = searchParams.status
  if (searchParams.featured === 'true') where.featured = true
  if (searchParams.featured === 'false') where.featured = false

  let domains: Array<{
    id: string
    name: string
    slug: string
    category: string
    status: string
    featured: boolean
    price: number | null
    showPrice: boolean
    saleType: string
  }> = []
  let total = 0
  let dbError: string | null = null

  try {
    const [rows, count] = await Promise.all([
      db.domain.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          status: true,
          featured: true,
          price: true,
          showPrice: true,
          saleType: true,
        },
      }),
      db.domain.count({ where }),
    ])
    domains = rows
    total = count
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Unknown error'
  }

  if (dbError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        Database unavailable: {dbError}
        <p className="text-xs text-muted-foreground mt-2">
          On Vercel, the domain catalog is served from a bundled JSON snapshot
          and is read-only from this UI. Use the seed script and a redeploy to
          update the catalog.
        </p>
      </div>
    )
  }

  return (
    <DomainsTable
      domains={domains}
      total={total}
      page={page}
      limit={limit}
      filters={{
        search: searchParams.search ?? '',
        status: searchParams.status ?? '',
        featured: searchParams.featured ?? '',
      }}
    />
  )
}