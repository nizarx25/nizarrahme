import type { MetadataRoute } from "next";
import { db, isDbAvailable } from "@/lib/db";
import { fallbackDomains } from "@/lib/fallback-data";

const SITE_URL = "https://nizarrahme.com";

// Revalidate the sitemap at most once an hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let domains: Array<{ slug: string; updatedAt: Date }> = [];

  if (isDbAvailable()) {
    try {
      domains = await db.domain.findMany({
        where: { status: "Available" },
        select: { slug: true, updatedAt: true },
      });
    } catch {
      // DB unavailable — fall back to bundled data
    }
  }

  if (domains.length === 0) {
    domains = fallbackDomains
      .filter((d) => d.status === "Available")
      .map((d) => ({ slug: d.slug, updatedAt: new Date(d.updatedAt) }));
  }

  // Each domain now has its own permalink for shareability + SEO.
  const domainEntries: MetadataRoute.Sitemap = domains.map((d) => ({
    url: `${SITE_URL}/d/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/#domains`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...domainEntries,
  ];
}