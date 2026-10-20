import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

/** Crawl everything; point search engines at the sitemap. (Cloudflare prepends its own AI-crawler rules on the live site.) */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
