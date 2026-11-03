import type { Metadata } from "next";
import { FORMAT_PAGE, type FormatPage } from "@/constants/content/formats";
import { FORMATS } from "@/constants/football";
import { LANDING_META } from "@/constants/content/landing";
import { ROUTES, formatPagePath } from "@/constants/routes";
import {
  FAQ_NODE,
  OG_IMAGE,
  OPEN_GRAPH_BASE,
  PAGE_UPDATED,
  SITE_GRAPH,
  SITE_URL,
  TITLE_TEMPLATE,
  TWITTER_CARD,
} from "@/constants/seo";

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

const maker = { "@id": `${SITE_URL}/#maker` };

interface PageGraph {
  readonly path: string;
  readonly name: string;
  readonly description: string;
  readonly updated: string;
  /** WebPage for most pages, ProfilePage for the one about the maker. */
  readonly type?: "WebPage" | "ProfilePage";
  /** The page's main subject, by @id. */
  readonly mainEntity?: { readonly "@id": string };
  /** Nodes that belong to this page only, such as its FAQ or its list of shapes. */
  readonly nodes?: readonly ({ readonly "@id": string } & Record<string, unknown>)[];
}

/**
 * A page's structured data: the shared site graph, the page itself with its author and breadcrumb,
 * and whatever nodes are the page's own. Every page carries the site graph, because Google reads
 * each page alone and the @id links have to resolve on the page that uses them.
 */
export function pageJsonLd({ path, name, description, updated, type = "WebPage", mainEntity, nodes = [] }: PageGraph) {
  const isHome = path === ROUTES.home;
  const url = isHome ? SITE_URL : SITE_URL + path;
  const pageId = `${url}${isHome ? "/" : ""}#page`;
  const crumbId = `${url}#breadcrumb`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...SITE_GRAPH,
      {
        "@type": type,
        "@id": pageId,
        url,
        name,
        description,
        inLanguage: "en-GB",
        dateModified: updated,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#app` },
        author: maker,
        ...(isHome ? {} : { breadcrumb: { "@id": crumbId } }),
        ...(mainEntity ? { mainEntity } : {}),
        ...(nodes.length ? { hasPart: nodes.map((n) => ({ "@id": n["@id"] })) } : {}),
      },
      ...(isHome
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              "@id": crumbId,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: FORMAT_PAGE.home, item: SITE_URL },
                { "@type": "ListItem", position: 2, name, item: url },
              ],
            },
          ]),
      ...nodes,
    ],
  };
}

/** The homepage: the site graph, the page and its FAQ, in one script. */
export function homeJsonLd() {
  return pageJsonLd({
    path: ROUTES.home,
    name: LANDING_META.title,
    description: LANDING_META.description,
    updated: PAGE_UPDATED.home,
    mainEntity: { "@id": `${SITE_URL}/#app` },
    nodes: [FAQ_NODE],
  });
}

/**
 * Structured data for one format page: the shapes on the board as a list, and its questions as an
 * FAQ, built from the same words the page prints.
 */
export function formatPageJsonLd(page: FormatPage) {
  const url = SITE_URL + formatPagePath(page.slug);
  return pageJsonLd({
    path: formatPagePath(page.slug),
    name: page.title,
    description: page.description,
    updated: PAGE_UPDATED.formats,
    mainEntity: { "@id": `${url}#shapes` },
    nodes: [
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
  });
}
