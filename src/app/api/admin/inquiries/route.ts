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

    const status = searchParams.get('status') ? sanitizeString(searchParams.get('status')!) : undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [inquiries, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        include: {
          domain: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inquiry.count({ where }),
    ])

    return NextResponse.json({
      inquiries,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching admin inquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
