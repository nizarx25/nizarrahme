import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getFallbackFeatured } from '@/lib/fallback-data'
import { toPublicDomain } from '@/lib/domain'

export async function GET() {
  try {
    try {
      const domains = await db.domain.findMany({
        where: {
          featured: true,
          status: 'Available',
          legalReviewRequired: false,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      if (domains.length > 0) {
        return NextResponse.json({ domains: domains.map((d) => toPublicDomain(d as unknown as Record<string, unknown>)) })
      }
    } catch {
      // DB error — fall through to fallback
    }

    // Fallback to bundled seed data
    return NextResponse.json(getFallbackFeatured())
  } catch (error) {
    console.error('Error fetching featured domains:', error)
    return NextResponse.json({ error: 'Failed to fetch featured domains' }, { status: 500 })
  }
}
