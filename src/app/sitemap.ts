import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { fallbackDomains } from "@/lib/fallback-data";

export const dynamic = 'force-dynamic';

const SITE_URL = "https://nizarrahme.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let domains: Array<{ slug: string; updatedAt: Date }> = [];

  try {
    domains = await db.domain.findMany({
      where: { status: "Available" },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // DB unavailable on Vercel — use fallback
  }

  // If DB returned nothing, use seed data
  if (domains.length === 0) {
    domains = fallbackDomains
      .filter((d) => d.status === 'Available')
      .map((d) => ({ slug: d.slug, updatedAt: new Date(d.updatedAt) }));
  }

  const domainEntries: MetadataRoute.Sitemap = domains.map((d) => ({
    url: `${SITE_URL}/#domains`,
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
    ...domainEntries,
  ];
}