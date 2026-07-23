import type { MetadataRoute } from "next";
import { tools, SITE_URL } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const home = { url: SITE_URL, changeFrequency: "weekly" as const, priority: 1 };
  const toolUrls = tools
    .filter((t) => t.ready)
    .map((t) => ({
      url: `${SITE_URL}/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  return [home, ...toolUrls];
}
