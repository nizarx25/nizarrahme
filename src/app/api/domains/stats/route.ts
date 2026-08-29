import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
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

    return NextResponse.json({
      totalDomains,
      featuredCount,
      atomListed,
      categories: categories.map((c) => c.category),
      extensions: extensions.map((e) => e.extension),
    })
  } catch (error) {
    console.error('Error fetching portfolio stats:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio stats' }, { status: 500 })
  }
}
