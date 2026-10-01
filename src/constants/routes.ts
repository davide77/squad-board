// Every page address in the app.
export const ROUTES = {
  home: "/",
  board: "/board",
  privacy: "/privacy",
  credits: "/credits",
  account: "/account",
  /** Where the sign-in email's link lands. A route handler, not a page. */
  signInLink: "/account/link",
} as const;

/** The board, opened on a format: /board?format=7v7. */
export const FORMAT_PARAM = "format";
export const boardOnFormat = (format: string) => `${ROUTES.board}?${FORMAT_PARAM}=${format}`;

/** A format page's address, such as /7-a-side. */
export const formatPagePath = (slug: string) => `/${slug}`;
