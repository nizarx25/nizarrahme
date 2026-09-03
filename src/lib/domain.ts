// Shared domain types and serialization helpers used by every API route.
// Centralizing this prevents the duplication that previously lived in four
// separate files.

import { safeJsonParse } from '@/lib/auth'

/** Public-facing domain shape (safe to send to the browser). */
export type PublicDomain = {
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

/** Map a Prisma domain row (or any object with the same shape) to the public DTO. */
export function toPublicDomain(d: Record<string, unknown>): PublicDomain {
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