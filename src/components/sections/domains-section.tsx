'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useDomains } from '@/hooks/use-domain-data'
import { DomainCard } from '@/components/domain/domain-card'

export function DomainsSection() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [extension, setExtension] = useState('')
  const [status, setStatus] = useState('')
  const [featured, setFeatured] = useState(false)
  const [hasPrice, setHasPrice] = useState(false)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useDomains(
    search,
    category,
    extension,
    status,
    featured,
    hasPrice,
    sort,
    page,
  )

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  const resetFilters = () => {
    setSearch('')
    setCategory('')
    setExtension('')
    setStatus('')
    setFeatured(false)
    setHasPrice(false)
    setSort('newest')
    setPage(1)
  }

  return (
    <section className="py-8 sm:py-12" aria-labelledby="domains-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-mono-accent text-teal uppercase tracking-[0.2em] mb-3">Browse Catalog</p>
          <h1 id="domains-heading" className="font-display text-3xl sm:text-4xl font-bold text-white">Domain Catalog</h1>
          <p className="text-[#718581] mt-2">Browse available domain names. Click any domain to view details and make an offer.</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#718581]" />
          <Input
            placeholder="Search domains by name, category, or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-12 h-12 bg-surface border-surface-border rounded-[12px] text-white placeholder:text-[#718581] focus:border-teal/40 focus:ring-teal/20 transition-all"
            aria-label="Search domains"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="size-4 mr-2" /> Filters
          </Button>
          <div className="hidden lg:block text-sm font-mono-accent text-[#718581]">
            {data && <span>{data.total} domain{data.total !== 1 ? 's' : ''} found</span>}
          </div>
        </div>

        <div className={`mb-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={category || '_all'} onValueChange={(v) => { setCategory(v === '_all' ? '' : v); setPage(1) }}>
              <SelectTrigger aria-label="Filter by category" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {data?.categories?.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={extension || '_all'} onValueChange={(v) => { setExtension(v === '_all' ? '' : v); setPage(1) }}>
              <SelectTrigger aria-label="Filter by extension" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Extension" />
              </SelectTrigger>
              <SelectContent>
                {data?.extensions?.map((ext) => (
                  <SelectItem key={ext} value={ext}>
                    {ext}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status || '_all'} onValueChange={(v) => { setStatus(v === '_all' ? '' : v); setPage(1) }}>
              <SelectTrigger aria-label="Filter by status" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Negotiating">Negotiating</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
              <SelectTrigger aria-label="Sort by" className="bg-surface border-surface-border rounded-[12px] text-[#B8C8C4]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name_asc">A → Z</SelectItem>
                <SelectItem value="name_desc">Z → A</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured-toggle"
                  checked={featured}
                  onCheckedChange={(v) => {
                    setFeatured(v)
                    setPage(1)
                  }}
                  className="data-[state=checked]:bg-teal"
                />
                <Label htmlFor="featured-toggle" className="text-sm text-[#B8C8C4] cursor-pointer">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="price-toggle"
                  checked={hasPrice}
                  onCheckedChange={(v) => {
                    setHasPrice(v)
                    setPage(1)
                  }}
                  className="data-[state=checked]:bg-teal"
                />
                <Label htmlFor="price-toggle" className="text-sm text-[#B8C8C4] cursor-pointer">Has Price</Label>
              </div>
            </div>
          </div>
          {(category || extension || status || featured || hasPrice) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono-accent text-[#718581]">Active filters:</span>
              {category && (
                <Badge variant="secondary" className="text-xs bg-elevated text-[#B8C8C4] rounded-full">
                  {category}
                  <button
                    onClick={() => {
                      setCategory('')
                      setPage(1)
                    }}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${category} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {extension && (
                <Badge variant="secondary" className="text-xs bg-elevated text-[#B8C8C4] rounded-full">
                  {extension}
                  <button
                    onClick={() => {
                      setExtension('')
                      setPage(1)
                    }}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${extension} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {status && (
                <Badge variant="secondary" className="text-xs bg-elevated text-[#B8C8C4] rounded-full">
                  {status}
                  <button
                    onClick={() => {
                      setStatus('')
                      setPage(1)
                    }}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${status} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-teal hover:underline ml-2 font-mono-accent"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 bg-surface rounded-[16px]" />
            ))}
          </div>
        ) : data && data.domains.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.domains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) pageNum = i + 1
                    else if (page <= 4) pageNum = i + 1
                    else if (page >= totalPages - 3) pageNum = totalPages - 6 + i
                    else pageNum = page - 3 + i
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        className={`w-9 rounded-[10px] ${pageNum === page ? 'bg-teal text-[#061312] hover:bg-teal/90 border-0' : 'border-surface-border text-[#B8C8C4] hover:bg-elevated'}`}
                        onClick={() => setPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={pageNum === page ? 'page' : undefined}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[10px]"
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Globe className="size-12 text-surface-border mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-white mb-2">No domains found</h3>
            <p className="text-sm text-[#718581] mb-6">Try adjusting your search or filters.</p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-surface-border text-[#B8C8C4] hover:bg-elevated rounded-[12px]"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}