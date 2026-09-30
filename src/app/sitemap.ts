import type { MetadataRoute } from "next";
import { FORMAT_PAGES } from "@/constants/content/formats";
import { ROUTES, formatPagePath } from "@/constants/routes";
import { CONTENT_UPDATED, SITE_URL } from "@/constants/seo";

// The board is left out: it is noindexed, because it renders in the browser only.
const INDEXED = [ROUTES.home, ...FORMAT_PAGES.map((f) => formatPagePath(f.slug)), ROUTES.privacy, ROUTES.credits];

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXED.map((r) => ({
    url: r === ROUTES.home ? SITE_URL : SITE_URL + r,
    lastModified: CONTENT_UPDATED,
  }));
}
