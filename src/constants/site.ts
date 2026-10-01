export const SITE = {
  name: "Gafferboard",
  skipLink: "Skip to main content",
  description:
    "A matchday board for grassroots coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen.",
} as const;

/** Where Gafferboard posts. Opened 2026-10-01. The footer links to it and the structured data names it. */
export const SOCIAL = {
  instagram: {
    handle: "@gafferboard",
    url: "https://www.instagram.com/gafferboard/",
    /** Read before the handle by a screen reader, since the glyph is hidden. */
    label: "Instagram",
  },
} as const;
