import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sanitizeString } from '@/lib/auth'
import { getFallbackDomain } from '@/lib/fallback-data'
import { toPublicDomain } from '@/lib/domain'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const cleanSlug = sanitizeString(slug)

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    try {
      const domain = await db.domain.findUnique({
        where: { slug: cleanSlug },
      })

      if (domain) {
        const relatedDomains = await db.domain.findMany({
          where: {
            category: domain.category,
            slug: { not: cleanSlug },
            status: 'Available',
            legalReviewRequired: false,
          },
          take: 5,
          orderBy: { featured: 'desc' },
        })

        return NextResponse.json({
          domain: toPublicDomain(domain as unknown as Record<string, unknown>),
          relatedDomains: relatedDomains.map((d) =>
            toPublicDomain(d as unknown as Record<string, unknown>)
          ),
        })
      }
    } catch {
      // DB error — fall through to fallback
    }

    // Fallback to bundled seed data
    const result = getFallbackDomain(cleanSlug)
    if (!result) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching domain:', error)
    return NextResponse.json({ error: 'Failed to fetch domain' }, { status: 500 })
  }
}
