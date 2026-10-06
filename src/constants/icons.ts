// The Gafferboard icon set, drawn the same way as the G in the logo: one round-capped stroke, the same
// weight all the way, on a 24 grid with 2 clear on every side. The source is the Figma file (Brand page,
// section 10, and the Components page). Change an icon there first, then copy its shapes here.

/** A stroked line, or a dot filled in the text colour, or the disc: the player picked, in the kit colour. */
export type IconShape =
  | { readonly kind: "path"; readonly d: string }
  | { readonly kind: "circle"; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly kind: "rect"; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly rx: number }
  | { readonly kind: "dot"; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly kind: "disc"; readonly cx: number; readonly cy: number; readonly r: number };

/** The grid every icon is drawn on, and the stroke it is drawn with. */
export const ICON_GRID = 24;
export const ICON_STROKE = 2;

/** 24 on the board, 20 inside a button, 16 beside small labels and in tiny buttons. */
export const ICON_SIZES = {
  board: 24,
  button: 20,
  small: 16,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

const SPLIT_DOT = 1.75;

export const ICONS = {
  // Squad
  squad: [
    { kind: "circle", cx: 9, cy: 8, r: 3.5 },
    { kind: "path", d: "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" },
    { kind: "path", d: "M15.5 4.6a3.5 3.5 0 0 1 0 6.8" },
    { kind: "path", d: "M18 14.5c1.8 1 3 3 3 5.5" },
  ],
  addPlayer: [
    { kind: "circle", cx: 10, cy: 8, r: 3.5 },
    { kind: "path", d: "M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6" },
    { kind: "path", d: "M19 8v6M16 11h6" },
  ],
  callUp: [
    { kind: "rect", x: 3, y: 3, w: 18, h: 18, rx: 4 },
    { kind: "path", d: "M8 12.5l2.8 2.8L16 9.5" },
  ],
  captain: [
    { kind: "rect", x: 2.5, y: 5.5, w: 19, h: 13, rx: 3 },
    { kind: "path", d: "M14.8 9.6a3.4 3.4 0 1 0 0 4.8" },
  ],
  injured: [
    { kind: "circle", cx: 12, cy: 12, r: 9 },
    { kind: "path", d: "M12 8v8M8 12h8" },
  ],
  kit: [{ kind: "path", d: "M9 3L3.5 6l2 5L7 10.2V21h10V10.2l1.5.8 2-5L15 3c-.4 1.7-1.6 2.6-3 2.6S9.4 4.7 9 3z" }],

  // Matchday
  matchday: [
    { kind: "rect", x: 3, y: 5, w: 18, h: 16, rx: 2 },
    { kind: "path", d: "M3 10h18M8 3v4M16 3v4" },
    { kind: "disc", cx: 15.5, cy: 15.5, r: 2.5 },
  ],
  formation: [
    { kind: "dot", cx: 5, cy: 5, r: SPLIT_DOT },
    { kind: "dot", cx: 12, cy: 5, r: SPLIT_DOT },
    { kind: "dot", cx: 19, cy: 5, r: SPLIT_DOT },
    { kind: "dot", cx: 7.5, cy: 12, r: SPLIT_DOT },
    { kind: "dot", cx: 16.5, cy: 12, r: SPLIT_DOT },
    { kind: "disc", cx: 12, cy: 19, r: 2.75 },
  ],
  pitch: [
    { kind: "rect", x: 4, y: 2, w: 16, h: 20, rx: 2 },
    { kind: "path", d: "M4 12h16M9 2v3h6V2M9 22v-3h6v3" },
    { kind: "circle", cx: 12, cy: 12, r: 2.5 },
  ],
  pick: [
    { kind: "circle", cx: 12, cy: 12, r: 9 },
    { kind: "disc", cx: 12, cy: 12, r: 4.5 },
  ],
  bench: [
    { kind: "path", d: "M3 15h18M5 15v5M19 15v5" },
    { kind: "dot", cx: 5.5, cy: 9.5, r: 2 },
    { kind: "dot", cx: 12, cy: 9.5, r: 2 },
    { kind: "dot", cx: 18.5, cy: 9.5, r: 2 },
  ],
  substitution: [{ kind: "path", d: "M8 20V5M4 9l4-4 4 4M16 4v15M12 15l4 4 4-4" }],
  clock: [
    { kind: "circle", cx: 12, cy: 13.5, r: 7.5 },
    { kind: "path", d: "M12 10v3.5l2.5 2.5M10 2.5h4" },
  ],

  // Sharing
  teamSheet: [
    { kind: "rect", x: 5, y: 4, w: 14, h: 18, rx: 2 },
    { kind: "path", d: "M9 2.5h6v3H9zM9 11h6M9 15h4" },
  ],
  copy: [
    { kind: "rect", x: 9, y: 9, w: 12, h: 12, rx: 2 },
    { kind: "path", d: "M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" },
  ],
  send: [{ kind: "path", d: "M21 3L10 14M21 3l-6.5 18-4.5-7-7-4.5z" }],
  phone: [
    { kind: "rect", x: 6.5, y: 2, w: 11, h: 20, rx: 2.5 },
    { kind: "path", d: "M11 18h2" },
  ],
  exportFile: [{ kind: "path", d: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 11v6M9 14l3 3 3-3" }],

  // Board
  saveLineup: [{ kind: "path", d: "M6 3h12v18l-6-4.5L6 21z" }],
  edit: [{ kind: "path", d: "M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3" }],
  customise: [
    { kind: "path", d: "M4 7h9M19 7h1M4 17h1M11 17h9" },
    { kind: "circle", cx: 16, cy: 7, r: 2.5 },
    { kind: "circle", cx: 8, cy: 17, r: 2.5 },
  ],
  yourClub: [{ kind: "path", d: "M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" }],
  undo: [{ kind: "path", d: "M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" }],
  close: [{ kind: "path", d: "M6 6l12 12M18 6L6 18" }],

  // Controls
  more: [
    { kind: "dot", cx: 5, cy: 12, r: SPLIT_DOT },
    { kind: "dot", cx: 12, cy: 12, r: SPLIT_DOT },
    { kind: "dot", cx: 19, cy: 12, r: SPLIT_DOT },
  ],
  grip: [
    { kind: "dot", cx: 9, cy: 6, r: 1.5 },
    { kind: "dot", cx: 15, cy: 6, r: 1.5 },
    { kind: "dot", cx: 9, cy: 12, r: 1.5 },
    { kind: "dot", cx: 15, cy: 12, r: 1.5 },
    { kind: "dot", cx: 9, cy: 18, r: 1.5 },
    { kind: "dot", cx: 15, cy: 18, r: 1.5 },
  ],
  chevronDown: [{ kind: "path", d: "M6 9l6 6 6-6" }],
} as const satisfies Record<string, readonly IconShape[]>;

export type IconName = keyof typeof ICONS;
