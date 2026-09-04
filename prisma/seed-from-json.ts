// One-shot importer that reads the bundled JSON snapshot and upserts it into
// the configured database. Run on Vercel (or locally) with:
//   npm run db:seed:json
//
// This lets the admin dashboard edit the same data that the public site shows,
// even though Vercel can't use a SQLite file.

import { PrismaClient } from '@prisma/client'
import seedDomains from '../src/data/domains.json' assert { type: 'json' }

type SeedRow = {
  id: string
  name: string
  normalizedName: string
  slug: string
  extension: string
  category: string
  tags: string | string[]
  shortDescription: string
  useCases: string | string[]
  status: string
  featured: boolean
  price: number | null
  showPrice: boolean
  saleType: string
  sourceMarketplace: string | null
  sourceUrl: string | null
  registrar: string | null
  domainScore: number | null
  tldsTaken: number | null
  tldsDeveloped: number | null
  expirationDate: string | null
  legalReviewRequired: boolean
  publicNotes: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
}

function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return JSON.stringify(value)
  return value ?? '[]'
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('[seed-from-json] DATABASE_URL is not set; nothing to do.')
    process.exit(0)
  }

  const prisma = new PrismaClient()
  const rows = (seedDomains as SeedRow[]).map((d) => ({
    id: d.id,
    name: d.name,
    normalizedName: d.normalizedName,
    slug: d.slug,
    extension: d.extension,
    category: d.category,
    tags: asString(d.tags),
    shortDescription: d.shortDescription,
    useCases: asString(d.useCases),
    status: d.status,
    featured: d.featured,
    price: d.price,
    showPrice: d.showPrice,
    saleType: d.saleType,
    sourceMarketplace: d.sourceMarketplace,
    sourceUrl: d.sourceUrl,
    registrar: d.registrar,
    domainScore: d.domainScore,
    tldsTaken: d.tldsTaken,
    tldsDeveloped: d.tldsDeveloped,
    expirationDate: d.expirationDate ? new Date(d.expirationDate) : null,
    legalReviewRequired: d.legalReviewRequired,
    publicNotes: d.publicNotes,
    internalNotes: d.internalNotes ?? '',
  }))

  console.log(`[seed-from-json] Upserting ${rows.length} domains…`)

  // Upsert in chunks to keep transactions small on free-tier databases.
  const CHUNK = 50
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK)
    await prisma.$transaction(
      batch.map((row) =>
        prisma.domain.upsert({
          where: { id: row.id },
          update: row,
          create: row,
        })
      )
    )
    console.log(`[seed-from-json]   ✓ ${Math.min(i + CHUNK, rows.length)} / ${rows.length}`)
  }

  await prisma.$disconnect()
  console.log('[seed-from-json] Done.')
}

main().catch((err) => {
  console.error('[seed-from-json] Failed:', err)
  process.exit(1)
})
