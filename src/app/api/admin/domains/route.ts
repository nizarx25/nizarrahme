import { NextRequest, NextResponse } from 'next/server'
import { isDbAvailable, db } from '@/lib/db'
import { requireAuth, sanitizeString } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Auth check
  const auth = await requireAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ error: 'Database not available in this environment' }, { status: 503 })
  }

  try {
    const { searchParams } = request.nextUrl

    const search = searchParams.get('search') ? sanitizeString(searchParams.get('search')!) : undefined
    const category = searchParams.get('category') ? sanitizeString(searchParams.get('category')!) : undefined
    const extension = searchParams.get('extension') ? sanitizeString(searchParams.get('extension')!) : undefined
    const status = searchParams.get('status') ? sanitizeString(searchParams.get('status')!) : undefined
    const featured = searchParams.get('featured')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { normalizedName: { contains: search.toLowerCase() } },
        { category: { contains: search } },
      ]
    }

    if (category) where.category = category
    if (extension) where.extension = extension
    if (status) where.status = status
    if (featured === 'true') where.featured = true
    if (featured === 'false') where.featured = false

    const [domains, total] = await Promise.all([
      db.domain.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.domain.count({ where }),
    ])

    return NextResponse.json({
      domains,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching admin domains:', error)
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ error: 'Database not available in this environment' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const extension = typeof body.extension === 'string' && body.extension.trim()
    ? body.extension.trim().toLowerCase()
    : extractExtension(name)
  const normalizedName = name.toLowerCase()
  const slugInput = typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : name
  const slug = slugify(slugInput)

  // Build defaults so we never insert nulls into non-null columns
  const createData = {
    name,
    normalizedName,
    slug: await uniqueSlug(slug),
    extension,
    category: typeof body.category === 'string' && body.category.trim() ? body.category.trim() : 'Brandable',
    tags: JSON.stringify(toStringArray(body.tags)),
    shortDescription: typeof body.shortDescription === 'string' ? body.shortDescription : '',
    useCases: JSON.stringify(toStringArray(body.useCases)),
    status: typeof body.status === 'string' && body.status.trim() ? body.status : 'Available',
    featured: body.featured === true,
    price: typeof body.price === 'number' && Number.isFinite(body.price) ? body.price : null,
    showPrice: body.showPrice === true,
    saleType: typeof body.saleType === 'string' && body.saleType.trim() ? body.saleType : 'Make an Offer',
    sourceMarketplace: typeof body.sourceMarketplace === 'string' ? body.sourceMarketplace : null,
    sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : null,
    registrar: typeof body.registrar === 'string' ? body.registrar : null,
    domainScore: typeof body.domainScore === 'number' ? body.domainScore : null,
    tldsTaken: typeof body.tldsTaken === 'number' ? body.tldsTaken : null,
    tldsDeveloped: typeof body.tldsDeveloped === 'number' ? body.tldsDeveloped : null,
    expirationDate: parseDateOrNull(body.expirationDate),
    legalReviewRequired: body.legalReviewRequired === true,
    publicNotes: typeof body.publicNotes === 'string' ? body.publicNotes : '',
    internalNotes: typeof body.internalNotes === 'string' ? body.internalNotes : '',
  }

  try {
    const created = await db.domain.create({ data: createData })
    return NextResponse.json({ domain: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating domain:', error)
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ error: 'Database not available in this environment' }, { status: 503 })
  }

  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const existing = await db.domain.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }
    await db.domain.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 })
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractExtension(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx).toLowerCase() : '.com'
}

function toStringArray(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((v) => String(v))
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      if (Array.isArray(parsed)) return parsed.map((v) => String(v))
    } catch {
      return input.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

function parseDateOrNull(input: unknown): Date | null {
  if (input === null || input === undefined || input === '') return null
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || 'domain'
  let candidate = root
  let attempt = 1
  while (await db.domain.findUnique({ where: { slug: candidate } })) {
    attempt += 1
    candidate = `${root}-${attempt}`
    if (attempt > 200) {
      candidate = `${root}-${Date.now()}`
      break
    }
  }
  return candidate
}