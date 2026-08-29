import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safeJsonParse, sanitizeString } from '@/lib/auth'
import { queryFallbackDomains } from '@/lib/fallback-data'

const ALLOWED_SORTS = ['newest', 'name_asc', 'name_desc', 'featured', 'price_asc', 'price_desc'] as const

type PublicDomain = {
  id: string
  name: string
  slug: string
  extension: string
  category: string
  tags: string[]
  shortDescription: string
  useCases: string[]
  status: string
  featured: boolean
  price: number | null
  showPrice: boolean
  saleType: string
  publicNotes: string
  createdAt: string
  updatedAt: string
}

function toPublicDomain(d: Record<string, unknown>): PublicDomain {
  return {
    id: d.id as string,
    name: d.name as string,
    slug: d.slug as string,
    extension: d.extension as string,
    category: d.category as string,
    tags: safeJsonParse<string[]>(d.tags as string, []),
    shortDescription: d.shortDescription as string,
    useCases: safeJsonParse<string[]>(d.useCases as string, []),
    status: d.status as string,
    featured: d.featured as boolean,
    price: d.price as number | null,
    showPrice: d.showPrice as boolean,
    saleType: d.saleType as string,
    publicNotes: d.publicNotes as string,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse and sanitize query params
    const search = searchParams.get('search') ? sanitizeString(searchParams.get('search')!) : undefined
    const category = searchParams.get('category') ? sanitizeString(searchParams.get('category')!) : undefined
    const extension = searchParams.get('extension') ? sanitizeString(searchParams.get('extension')!) : undefined
    const status = searchParams.get('status') ? sanitizeString(searchParams.get('status')!) : undefined
    const featured = searchParams.get('featured')
    const hasPrice = searchParams.get('hasPrice')
    const sortParam = searchParams.get('sort') || 'newest'
    const sort = ALLOWED_SORTS.includes(sortParam as typeof ALLOWED_SORTS[number]) ? sortParam : 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { normalizedName: { contains: search.toLowerCase() } },
        { category: { contains: search } },
        { shortDescription: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (extension) {
      where.extension = extension
    }

    if (status) {
      where.status = status
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (hasPrice === 'true') {
      where.showPrice = true
      where.price = { not: null }
    } else if (hasPrice === 'false') {
      where.OR2 = [{ showPrice: false }, { price: null }]
    }

    // Build order
    let orderBy: Record<string, unknown> = { createdAt: 'desc' }
    switch (sort) {
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      case 'featured':
        orderBy = { featured: 'desc' }
        break
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Try database first, fall back to seed data
    try {
      const [domains, total] = await Promise.all([
        db.domain.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.domain.count({ where }),
      ])

      // If DB has data, use it
      if (total > 0) {
        const [categories, extensions] = await Promise.all([
          db.domain.findMany({ distinct: ['category'], select: { category: true }, orderBy: { category: 'asc' } }),
          db.domain.findMany({ distinct: ['extension'], select: { extension: true }, orderBy: { extension: 'asc' } }),
        ])

        return NextResponse.json({
          domains: domains.map(toPublicDomain),
          total,
          page,
          limit,
          categories: categories.map((c) => c.category),
          extensions: extensions.map((e) => e.extension),
        })
      }
    } catch {
      // DB error — fall through to fallback
    }

    // Fallback to bundled seed data
    return NextResponse.json(queryFallbackDomains({ search, category, extension, status, featured, hasPrice, sort, page, limit }))
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
  }
}