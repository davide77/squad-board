import type { Metadata } from "next";
import { FORMAT_PAGE, type FormatPage } from "@/constants/content/formats";
import { FORMATS } from "@/constants/football";
import { formatPagePath } from "@/constants/routes";
import { OG_IMAGE, OPEN_GRAPH_BASE, PAGE_UPDATED, SITE_URL, TITLE_TEMPLATE, TWITTER_CARD } from "@/constants/seo";

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

const LONG_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "2026-11-03" as "3 November 2026", the way the pages print a date. */
export function longDate(iso: string): string {
  return LONG_DATE.format(new Date(iso));
}

/**
 * Structured data for one format page: the page in the site, its breadcrumb, the shapes on the board
 * as a list, and its questions as an FAQ. Built from the same words the page prints.
 */
export function formatPageJsonLd(page: FormatPage) {
  const url = SITE_URL + formatPagePath(page.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en-GB",
        dateModified: PAGE_UPDATED.formats,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#app` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#shapes` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: FORMAT_PAGE.home, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: page.title, item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#shapes`,
        name: `${FORMATS[page.format].label} formations`,
        itemListElement: FORMATS[page.format].shapes.map((shape, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: shape,
          description: page.shapeNotes[shape],
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.questions.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a.join(" ") },
        })),
      },
    ],
  };
}
