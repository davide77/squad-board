import type { MetadataRoute } from "next";
import { FORMAT_PAGES } from "@/constants/content/formats";
import { ROUTES, formatPagePath } from "@/constants/routes";
import { PAGE_UPDATED, SITE_URL } from "@/constants/seo";

// The board is left out: it is noindexed, because it renders in the browser only.
const INDEXED: readonly { readonly path: string; readonly updated: string }[] = [
  { path: ROUTES.home, updated: PAGE_UPDATED.home },
  ...FORMAT_PAGES.map((f) => ({ path: formatPagePath(f.slug), updated: PAGE_UPDATED.formats })),
  { path: ROUTES.privacy, updated: PAGE_UPDATED.privacy },
  { path: ROUTES.credits, updated: PAGE_UPDATED.credits },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXED.map((r) => ({
    url: r.path === ROUTES.home ? SITE_URL : SITE_URL + r.path,
    lastModified: r.updated,
  }));
}
