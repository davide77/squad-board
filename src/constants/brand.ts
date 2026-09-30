// Club colours the coach can pick. Each carries its own ink so numbers stay
// readable on the shirt. The first entry is the default and is mirrored in
// $kit-defaults in src/styles/abstracts/_colors.scss.

export interface KitColour {
  readonly name: string;
  readonly kit: string;
  readonly ink: string;
  readonly edge: string;
}

export const KIT_COLOURS: readonly KitColour[] = [
  { name: "Yellow", kit: "#F2D106", ink: "#0A0A0A", edge: "#C7AB08" },
  { name: "Red", kit: "#D93A2B", ink: "#FFFFFF", edge: "#A82C20" },
  { name: "Blue", kit: "#2E6BD9", ink: "#FFFFFF", edge: "#2453AB" },
  { name: "Green", kit: "#1FA463", ink: "#04150C", edge: "#17804D" },
  { name: "Sky", kit: "#59B6E8", ink: "#04151F", edge: "#3E8FBC" },
  { name: "Claret", kit: "#8A2B4A", ink: "#FFFFFF", edge: "#6B2039" },
  { name: "Orange", kit: "#E8811F", ink: "#1A0D02", edge: "#B96517" },
  { name: "White", kit: "#ECECE8", ink: "#0A0A0A", edge: "#B9B9B3" },
  // Added last so a colour saved on a board keeps its place. The example team plays in it.
  { name: "Pink", kit: "#EC4F9B", ink: "#1A0610", edge: "#BD3F7C" },
];

/**
 * What a strip is made of: the colours a shirt, its second colour, the shorts and the socks can be.
 * Wider than KIT_COLOURS, because black and navy are the commonest shorts and socks there are, and
 * neither would show as the board's colour. Every KIT_COLOURS name is here too, so an older board's
 * kit carries over.
 */
export const STRIP_COLOURS = {
  black: { name: "Black", hex: "#161616" },
  white: { name: "White", hex: "#ECECE8" },
  yellow: { name: "Yellow", hex: "#F2D106" },
  amber: { name: "Amber", hex: "#F2A51A" },
  orange: { name: "Orange", hex: "#E8811F" },
  red: { name: "Red", hex: "#D93A2B" },
  claret: { name: "Claret", hex: "#8A2B4A" },
  pink: { name: "Pink", hex: "#EC4F9B" },
  purple: { name: "Purple", hex: "#6B3FA0" },
  navy: { name: "Navy", hex: "#1D2B53" },
  blue: { name: "Blue", hex: "#2E6BD9" },
  sky: { name: "Sky", hex: "#59B6E8" },
  green: { name: "Green", hex: "#1FA463" },
  grey: { name: "Grey", hex: "#8C8C86" },
} as const;

export type StripColour = keyof typeof STRIP_COLOURS;

export const STRIP_COLOUR_KEYS = Object.keys(STRIP_COLOURS) as StripColour[];

/**
 * The board's neutrals, for drawing the line-up picture on a canvas, which cannot
 * read SCSS. Mirrors $theme-colors in src/styles/abstracts/_colors.scss: keep in sync.
 */
export const BOARD_PALETTE = {
  board: "#0A0A0A",
  chalk: "#F6F6F3",
  dim: "#96968F",
  dimmer: "#7E7E76",
  keeperEdge: "#C9C9C3",
  pitchTop: "#1A1A18",
  pitchBottom: "#0C0C0B",
  /** Chalk at 13%, the edge hairline. */
  edge: "rgba(246, 246, 243, 0.13)",
  /** Black at 76%, behind a name on the pitch. */
  nameBack: "rgba(0, 0, 0, 0.76)",
} as const;

/** Browser chrome colour, matches the board background. */
export const THEME_COLOUR = "#0A0A0A";

/** The horizontal logo, for dark backgrounds. Width and height match the SVG's viewBox ratio. */
export const LOGO = {
  src: "/brand/gafferboard-logo.svg",
  width: 205,
  height: 48,
  /** Shown at this height in the footer. */
  footerHeight: 24,
} as const;

/**
 * The G in a coach's visor, option F from the logo shortlist. Used on the
 * landing page. The art is square, drawn on a 240 box.
 */
export const VISOR_MARK = {
  src: "/brand/gafferboard-visor.svg",
  size: 240,
  /** Drawn at this size in the site header from bp(md), spacer(11). .site-logo in _landing.scss takes it to 48px on a phone. */
  headerSize: 80,
  /** Beside the Gaffer's line at the top of each board step. Mirrors .gaffer-line__mark in components/_board.scss. */
  lineSize: 34,
} as const;

/**
 * The app icons for the web manifest, rendered from gafferboard-icon.svg. The maskable
 * one is the mark on a full-bleed Board square, inside the central safe zone.
 */
export const APP_ICONS = [
  { src: "/brand/gafferboard-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/brand/gafferboard-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/brand/gafferboard-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
] as const;
