import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://buildweth-abhinavk7852.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...["about", "work", "stack", "services", "blog", "faq", "contact"].map((page) => ({ url: `${BASE}/${page}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
