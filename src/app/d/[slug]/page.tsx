import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db, isDbAvailable } from "@/lib/db"
import { toPublicDomain } from "@/lib/domain"
import { getFallbackDomain } from "@/lib/fallback-data"
import { DomainPermalinkView } from "./domain-permalink-view"

const SITE_URL = "https://nizarrahme.com"

// Revalidate the per-domain pages once an hour
export const revalidate = 3600

async function fetchDomain(slug: string) {
  if (isDbAvailable()) {
    try {
      const domain = await db.domain.findUnique({ where: { slug } })
      if (domain) {
        return toPublicDomain(domain as unknown as Record<string, unknown>)
      }
    } catch {
      // fall through to fallback
    }
  }
  const result = getFallbackDomain(slug)
  return result?.domain ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const domain = await fetchDomain(slug)
  if (!domain) return { title: "Domain not found" }

  const title = `${domain.name} — Premium Brandable Domain`
  const description =
    domain.shortDescription ||
    `Acquire ${domain.name}, a curated brandable domain for ${domain.category} businesses.`

  return {
    title,
    description,
    alternates: { canonical: `/d/${domain.slug}` },
    openGraph: {
      title,
      description,
      url: `/d/${domain.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function DomainPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const domain = await fetchDomain(slug)
  if (!domain) notFound()

  return <DomainPermalinkView domain={domain} siteUrl={SITE_URL} />
}