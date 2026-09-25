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
];

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
