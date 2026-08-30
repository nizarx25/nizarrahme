import seedDomains from '@/data/domains.json'
import { safeJsonParse } from '@/lib/auth'

// Re-export seed data for API fallback when DB is empty (e.g., on Vercel)
export const fallbackDomains = seedDomains as unknown as Array<{
  id: string
  name: string
  normalizedName: string
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
  sourceMarketplace: string
  sourceUrl: string
  registrar: string
  domainScore: number | null
  tldsTaken: number | null
  tldsDeveloped: number | null
  expirationDate: string | null
  legalReviewRequired: boolean
  publicNotes: string
  createdAt: string
  updatedAt: string
}>

function toPublicDomain(d: (typeof fallbackDomains)[number]) {
  // tags/useCases may be JSON strings (from DB export) or arrays (from wholesale add)
  const tags = Array.isArray(d.tags) ? d.tags : safeJsonParse<string[]>(d.tags, [])
  const useCases = Array.isArray(d.useCases) ? d.useCases : safeJsonParse<string[]>(d.useCases, [])
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    extension: d.extension,
    category: d.category,
    tags,
    shortDescription: d.shortDescription,
    useCases,
    status: d.status,
    featured: d.featured,
    price: d.price,
    showPrice: d.showPrice,
    saleType: d.saleType,
    publicNotes: d.publicNotes,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

// Filter + sort + paginate fallback domains (mirrors the main API logic)
export function queryFallbackDomains(opts: {
  search?: string
  category?: string
  extension?: string
  status?: string
  featured?: string
  hasPrice?: string
  sort?: string
  page?: number
  limit?: number
}) {
  let results = [...fallbackDomains]

  // Filter: only show Available domains that don't need legal review
  results = results.filter((d) => d.status === 'Available' && !d.legalReviewRequired)

  if (opts.search) {
    const s = opts.search.toLowerCase()
    results = results.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.normalizedName.toLowerCase().includes(s) ||
        d.category.toLowerCase().includes(s) ||
        d.shortDescription.toLowerCase().includes(s)
    )
  }

  if (opts.category) {
    results = results.filter((d) => d.category === opts.category)
  }

  if (opts.extension) {
    results = results.filter((d) => d.extension === opts.extension)
  }

  if (opts.status) {
    results = results.filter((d) => d.status === opts.status)
  }

  if (opts.featured === 'true') {
    results = results.filter((d) => d.featured)
  }

  if (opts.hasPrice === 'true') {
    results = results.filter((d) => d.showPrice && d.price !== null)
  } else if (opts.hasPrice === 'false') {
    results = results.filter((d) => !d.showPrice || d.price === null)
  }

  // Sort
  switch (opts.sort) {
    case 'name_asc':
      results.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      results.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'featured':
      results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      break
    case 'price_asc':
      results.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
      break
    case 'price_desc':
      results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      break
    case 'newest':
    default:
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

  const total = results.length
  const page = opts.page || 1
  const limit = opts.limit || 20
  const paginated = results.slice((page - 1) * limit, page * limit)

  const categories = [...new Set(fallbackDomains.filter((d) => d.status === 'Available' && !d.legalReviewRequired).map((d) => d.category))].sort()
  const extensions = [...new Set(fallbackDomains.map((d) => d.extension))].sort()

  return {
    domains: paginated.map(toPublicDomain),
    total,
    page,
    limit,
    categories,
    extensions,
  }
}

// Get featured domains from fallback
export function getFallbackFeatured() {
  const featured = fallbackDomains
    .filter((d) => d.featured && d.status === 'Available' && !d.legalReviewRequired)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)
  return { domains: featured.map(toPublicDomain) }
}

// Get single domain + related from fallback
export function getFallbackDomain(slug: string) {
  const domain = fallbackDomains.find((d) => d.slug === slug && d.status === 'Available' && !d.legalReviewRequired)
  if (!domain) return null

  const relatedDomains = fallbackDomains
    .filter((d) => d.category === domain.category && d.slug !== slug && d.status === 'Available' && !d.legalReviewRequired)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 5)

  return {
    domain: toPublicDomain(domain),
    relatedDomains: relatedDomains.map(toPublicDomain),
  }
}

// Get stats from fallback
export function getFallbackStats() {
  const available = fallbackDomains.filter((d) => d.status === 'Available' && !d.legalReviewRequired)
  return {
    totalDomains: available.length,
    featuredCount: available.filter((d) => d.featured).length,
    atomListed: available.filter((d) => d.sourceMarketplace === 'Atom').length,
    categories: [...new Set(available.map((d) => d.category))].sort(),
    extensions: [...new Set(available.map((d) => d.extension))].sort(),
  }
}
