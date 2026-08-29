import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safeJsonParse } from '@/lib/auth'

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

export async function GET() {
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

    const publicDomains = domains.map((d) => toPublicDomain(d as unknown as Record<string, unknown>))

    return NextResponse.json({ domains: publicDomains })
  } catch (error) {
    console.error('Error fetching featured domains:', error)
    return NextResponse.json({ error: 'Failed to fetch featured domains' }, { status: 500 })
  }
}
