import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  return [
    { url: `${base}/`,         lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/assistant`,lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/about`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
