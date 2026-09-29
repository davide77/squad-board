import type { Metadata } from "next";
import { OG_IMAGE, OPEN_GRAPH_BASE, TITLE_TEMPLATE, TWITTER_CARD } from "@/constants/seo";

const SHARE_IMAGE = { url: OG_IMAGE.path, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt };

interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  /** The homepage title stands on its own, without the site name template. */
  readonly absolute?: boolean;
}

/**
 * A page's own title, description, canonical and share tags. Next replaces the root
 * layout's `openGraph` rather than merging it, so every page sets the whole object.
 */
export function pageMetadata({ title, description, path, absolute = false }: PageMeta): Metadata {
  const fullTitle = absolute ? title : TITLE_TEMPLATE.replace("%s", title);

  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, title: fullTitle, description, url: path, images: [SHARE_IMAGE] },
    twitter: { card: TWITTER_CARD, title: fullTitle, description, images: [SHARE_IMAGE] },
  };
}
