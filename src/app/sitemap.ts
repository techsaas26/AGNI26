import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

/** The pages search engines should list. /m is left out: it is the phone edition of "/" (canonical "/"). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${site.url}/`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/events`, lastModified, changeFrequency: "daily", priority: 0.8 },
  ];
}
