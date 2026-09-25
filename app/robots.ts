import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const AGENTS = ["*", "GPTBot", "Google-Extended", "PerplexityBot", "ClaudeBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: ["/admin", "/api", "/client"],
    })),
    sitemap: "https://buildweth-abhinavk7852.vercel.app/sitemap.xml",
  };
}
