import { NextRequest, NextResponse } from 'next/server'
import { isDbAvailable, db } from '@/lib/db'
import { requireAuth, sanitizeString } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Auth check
  const auth = requireAuth(request)
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