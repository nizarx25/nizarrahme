import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = "https://nizarrahme.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domains = await db.domain.findMany({
    where: { status: "available" },
    select: { slug: true, updatedAt: true },
  });

  const domainEntries: MetadataRoute.Sitemap = domains.map((d) => ({
    url: `${SITE_URL}/domains/${d.slug}`,
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
