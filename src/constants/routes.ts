// Every page address in the app.
export const ROUTES = {
  home: "/",
  board: "/board",
  privacy: "/privacy",
  credits: "/credits",
} as const;

/** The board, opened on a format: /board?format=7v7. */
export const FORMAT_PARAM = "format";
export const boardOnFormat = (format: string) => `${ROUTES.board}?${FORMAT_PARAM}=${format}`;

/** A format page's address, such as /7-a-side. */
export const formatPagePath = (slug: string) => `/${slug}`;
