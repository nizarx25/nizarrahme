'use client'

// Shared TanStack Query hooks for domain data. Extracted from page.tsx so the
// page component can stay focused on layout and section composition.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

export type Stats = {
  totalDomains: number
  featuredCount: number
  atomListed: number
  wholesaleCount?: number
  categories: string[]
  extensions: string[]
}

export type SiteSettings = {
  contactEmail: string
  socialLinks: Record<string, string>
}

export type Transaction = {
  domain: string
  status: string
  amount: number
}

async function jsonOrThrow<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) throw new Error(fallback)
  return res.json() as Promise<T>
}

export function useFeaturedDomains() {
  return useQuery<PublicDomain[]>({
    queryKey: ['featured'],
    queryFn: async () => {
      const res = await fetch('/api/domains/featured')
      const data = await jsonOrThrow<{ domains: PublicDomain[] }>(res, 'Failed to fetch featured domains')
      return data.domains
    },
  })
}

export function useDomains(
  search: string,
  category: string,
  extension: string,
  status: string,
  featured: boolean,
  hasPrice: boolean,
  sort: string,
  page: number,
) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (extension) params.set('extension', extension)
  if (status) params.set('status', status)
  if (featured) params.set('featured', 'true')
  if (hasPrice) params.set('hasPrice', 'true')
  if (sort) params.set('sort', sort)
  params.set('page', String(page))
  params.set('limit', '12')

  return useQuery<{
    domains: PublicDomain[]
    total: number
    page: number
    limit: number
    categories: string[]
    extensions: string[]
  }>({
    queryKey: ['domains', search, category, extension, status, featured, hasPrice, sort, page],
    queryFn: async () => {
      const res = await fetch(`/api/domains?${params.toString()}`)
      return jsonOrThrow(res, 'Failed to fetch domains')
    },
  })
}

export function useDomainDetail(slug: string | null) {
  return useQuery<{ domain: PublicDomain; relatedDomains: PublicDomain[] } | null>({
    queryKey: ['domain', slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await fetch(`/api/domains/${slug}`)
      return jsonOrThrow(res, 'Failed to fetch domain')
    },
    enabled: !!slug,
  })
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/domains/stats')
      return jsonOrThrow(res, 'Failed to fetch stats')
    },
  })
}

export function useTransactions() {
  return useQuery<{ transactions: Transaction[] }>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions')
      return jsonOrThrow(res, 'Failed to fetch transactions')
    },
  })
}

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      return jsonOrThrow(res, 'Failed to fetch settings')
    },
  })
}

export function useSubmitInquiry(
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.details) throw new Error(JSON.stringify(json.details))
        throw new Error(json.error || 'Submission failed')
      }
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
      onSuccess?.()
    },
  })
}