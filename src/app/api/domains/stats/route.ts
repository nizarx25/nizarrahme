import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getFallbackStats } from '@/lib/fallback-data'

export async function GET() {
  try {
    try {
      const [totalDomains, featuredCount, atomListed, categories, extensions] = await Promise.all([
        db.domain.count(),
        db.domain.count({ where: { featured: true, status: 'Available' } }),
        db.domain.count({ where: { sourceMarketplace: 'Atom' } }),
        db.domain.findMany({
          distinct: ['category'],
          select: { category: true },
          orderBy: { category: 'asc' },
        }),
        db.domain.findMany({
          distinct: ['extension'],
          select: { extension: true },
          orderBy: { extension: 'asc' },
        }),
      ])

      if (totalDomains > 0) {
        return NextResponse.json({
          totalDomains,
          featuredCount,
          atomListed,
          categories: categories.map((c) => c.category),
          extensions: extensions.map((e) => e.extension),
        })
      }
    } catch {
      // DB error — fall through to fallback
    }

    // Fallback to bundled seed data
    return NextResponse.json(getFallbackStats())
  } catch (error) {
    console.error('Error fetching portfolio stats:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio stats' }, { status: 500 })
  }
}
