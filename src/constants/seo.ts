import { MAKER } from "@/constants/content/pages";
import { SITE } from "@/constants/site";

// The live address. Used as the base for every absolute URL in the metadata.
export const SITE_URL = "https://gafferboard.com";

/** Every page title but the homepage reads "Page · Gafferboard". `%s` is the page's own title. */
export const TITLE_TEMPLATE = `%s · ${SITE.name}`;

export const OPEN_GRAPH_BASE = {
  siteName: SITE.name,
  type: "website",
  locale: "en_GB",
} as const;

export const TWITTER_CARD = "summary_large_image";

/** When the indexable pages last changed. Bump it when their content does, so the sitemap stays honest. */
export const CONTENT_UPDATED = "2026-09-29";

/** The share card drawn by src/app/opengraph-image.tsx. 1200 by 630 is the size every network crops to. */
export const OG_IMAGE = {
  /** Where Next serves it. Pages name it themselves, because a page's own openGraph drops the inherited image. */
  path: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Gafferboard - line-ups and team sheets for grassroots football",
  headline: "Pick the team on the touchline.",
  sub: "Squad, call-ups, shape, bench and subs. One screen, on your phone.",
  domain: "gafferboard.com",
  /** Where the headline font is fetched from at build time. The css2 API serves TTF to a plain user agent. */
  fontCss: "https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@700",
  fontName: "Saira Condensed",
} as const;

/** One plain sentence that says what Gafferboard is. Written to be quoted as it stands. */
export const DEFINITION =
  "Gafferboard is a free web app for grassroots football coaches. It holds the squad, who is called up, the formation, the bench and every substitution on one screen, works on a phone, and needs no account.";

/** Structured data for the homepage: the app, the site and who makes it. */
export const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE.name,
      url: SITE_URL,
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}/#maker` },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE.name,
      url: SITE_URL,
      description: DEFINITION,
      applicationCategory: "SportsApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser",
      inLanguage: "en-GB",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
      audience: { "@type": "Audience", audienceType: "Grassroots and youth football coaches" },
      publisher: { "@id": `${SITE_URL}/#maker` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#maker`,
      name: MAKER.name,
      url: MAKER.url,
      jobTitle: MAKER.role,
      description: MAKER.bio,
    },
  ],
} as const;

/** The plain text summary served at /llms.txt, one line per entry. */
export const LLMS_TXT = {
  title: `# ${SITE.name}`,
  summary: `> ${DEFINITION}`,
  body: [
    "It is built for grassroots and youth coaches, assistant coaches and team managers who pick a side every week and run the subs on matchday.",
    "The board keeps the squad, marks who is available or injured, sets the formation, fills the bench and records the minute of every substitution. The team sheet can be sent to parents by WhatsApp or email.",
    "Everything is stored in the browser on the coach's own device. There are no accounts, no cookies and no tracking. A squad file moves the board to another device.",
  ],
  pagesHeading: "## Pages",
  pages: [
    { name: "Home", path: "/", note: "What the board does, with a working demo" },
    { name: "Privacy and safety", path: "/privacy", note: "What is stored, where, and how to delete it" },
    { name: "Credits", path: "/credits", note: "Who made it and what it is built with" },
  ],
} as const;
