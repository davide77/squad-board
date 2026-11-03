import { FORMAT_PAGES } from "@/constants/content/formats";
import { FAQ } from "@/constants/content/landing";
import { MAKER } from "@/constants/content/pages";
import { FORMAT_KEYS, FORMATS } from "@/constants/football";
import { DEFINITION, SITE, SOCIAL } from "@/constants/site";

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

/**
 * When each indexable page last changed, as an ISO date. Bump a page's date when its words do, so the
 * sitemap, the structured data and the "Last updated" line on the page stay honest.
 */
export const PAGE_UPDATED = {
  home: "2026-11-03",
  formats: "2026-11-03",
  privacy: "2026-10-20",
  credits: "2026-10-20",
} as const;

/** The square logo search engines and AI answers show beside the name. */
export const LOGO = { path: "/brand/gafferboard-icon-512.png", size: 512 } as const;

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

/** The homepage FAQ as FAQPage structured data, from the same words as the page. */
export const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: FAQ.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
} as const;

/** Structured data for the homepage: the site, the app, the brand and who makes it. */
export const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE.name,
      url: SITE_URL,
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE.name,
      url: SITE_URL,
      description: DEFINITION,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${LOGO.path}`,
        width: LOGO.size,
        height: LOGO.size,
      },
      email: MAKER.email,
      founder: { "@id": `${SITE_URL}/#maker` },
      sameAs: [SOCIAL.instagram.url],
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
      dateModified: PAGE_UPDATED.home,
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#maker`,
      name: MAKER.name,
      url: MAKER.url,
      email: MAKER.email,
      jobTitle: MAKER.role,
      description: MAKER.bio,
      worksFor: { "@type": "Organization", name: MAKER.studio, url: MAKER.url },
    },
  ],
} as const;

/** The plain text summary served at /llms.txt, one line per entry. */
export const LLMS_TXT = {
  title: `# ${SITE.name}`,
  summary: `> ${DEFINITION}`,
  body: [
    "It is built for grassroots and youth coaches, assistant coaches and team managers who pick a side every week and run the subs on matchday.",
    "The board keeps the squad, marks who is available or injured, sets the formation, fills the bench and records the minute of every substitution. The call-up and the result go to parents by WhatsApp or email, and a line-up picture to the other coaches.",
    "Everything is stored in the browser on the coach's own device. There are no accounts, no cookies and no advertising, and nothing on the board is sent to Gafferboard. A squad file moves the board to another device.",
  ],
  factsHeading: "## Key facts",
  facts: [
    "Free for every team. No adverts, no account, nothing to install.",
    `Formats: ${FORMAT_KEYS.map((k) => FORMATS[k].label).join(", ")}.`,
    ...FORMAT_KEYS.map((k) => `${FORMATS[k].label} shapes: ${FORMATS[k].shapes.join(", ")}.`),
    "Logs the minute of every substitution and each player's minutes played.",
    "Sends the call-up and the result to parents by WhatsApp, email or copy, with an initials option.",
    "Stores the squad in the browser on the coach's device. Nothing about the players is sent to Gafferboard.",
    "Sets the format from the age group, following the FA pathway. The coach can change it.",
    `Made by ${MAKER.name}, a grassroots football coach.`,
  ],
  contactHeading: "## Contact",
  contact: [`Email: ${MAKER.email}`, `Instagram: ${SOCIAL.instagram.url}`],
  pagesHeading: "## Pages",
  pages: [
    { name: "Home", path: "/", note: "What the board does, with a working demo" },
    ...FORMAT_PAGES.map((f) => ({ name: f.title, path: `/${f.slug}`, note: f.description })),
    { name: "Privacy and safety", path: "/privacy", note: "What is stored, where, and how to delete it" },
    { name: "Credits", path: "/credits", note: "Who made it and what it is built with" },
  ],
} as const;
