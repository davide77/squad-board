export const SITE = {
  name: "Gafferboard",
  skipLink: "Skip to main content",
  /** The empty spot at the far end of the header on the board. The board fills it with Customise your club. */
  headerSlotId: "site-header-slot",
  description:
    "A matchday board for grassroots coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen.",
} as const;

/**
 * One plain sentence that says what Gafferboard is. Written to be quoted as it stands, so AI answers
 * can lift it. It opens the homepage FAQ and the structured data, and leads /llms.txt.
 */
export const DEFINITION =
  "Gafferboard is a free web app for grassroots football coaches. It holds the squad, who is called up, the formation, the bench and every substitution on one screen, works on a phone, and needs no account.";

/** Where Gafferboard posts. Opened 2026-10-01. The footer links to it and the structured data names it. */
export const SOCIAL = {
  instagram: {
    handle: "@gafferboard",
    url: "https://www.instagram.com/gafferboard/",
    /** Read before the handle by a screen reader, since the glyph is hidden. */
    label: "Instagram",
  },
} as const;
