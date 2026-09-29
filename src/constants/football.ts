// Positions, pitch roles and formations. Pure football data, no UI.

export const POSITIONS = [
  { key: "GK", label: "Goalkeeper" },
  { key: "FB", label: "Full-back" },
  { key: "CB", label: "Centre-back" },
  { key: "CDM", label: "Holding midfielder" },
  { key: "CM", label: "Central midfielder" },
  { key: "CAM", label: "Attacking midfielder" },
  { key: "W", label: "Winger" },
  { key: "ST", label: "Striker" },
] as const;

export type PositionKey = (typeof POSITIONS)[number]["key"];

export const POSITION_KEYS: readonly PositionKey[] = POSITIONS.map((p) => p.key);

// Older saves used "DM" before the holding role was renamed.
export const LEGACY_POSITIONS: Readonly<Record<string, PositionKey>> = { DM: "CDM" };

// Positions a coach might type after a name in a pasted squad list ("1 Alex GK").
// Codes only count in capitals, so an initial like "Sam W" or "Tom St" stays part of
// the name. Words count in any case. A lone "W" is left out for the same reason.
export const POSITION_CODES: Readonly<Record<string, PositionKey>> = {
  GK: "GK",
  FB: "FB",
  LB: "FB",
  RB: "FB",
  LWB: "FB",
  RWB: "FB",
  CB: "CB",
  CDM: "CDM",
  DM: "CDM",
  CM: "CM",
  CAM: "CAM",
  AM: "CAM",
  LW: "W",
  RW: "W",
  LM: "W",
  RM: "W",
  ST: "ST",
  CF: "ST",
};
/** A flank. A player can be kept to one, and most pitch roles sit on one. */
export type Side = "L" | "R";

// The flank a typed code names, so "RB" plays on the right and "LW" on the left.
export const POSITION_SIDES: Readonly<Record<string, Side>> = {
  LB: "L",
  RB: "R",
  LWB: "L",
  RWB: "R",
  LW: "L",
  RW: "R",
  LM: "L",
  RM: "R",
};

// How a sided position reads in lists: a right-sided full-back is an RB.
export const SIDED_CODES: Readonly<Partial<Record<PositionKey, Readonly<Record<Side, string>>>>> = {
  FB: { L: "LB", R: "RB" },
  W: { L: "LW", R: "RW" },
};

export const POSITION_WORDS: Readonly<Record<string, PositionKey>> = {
  goalkeeper: "GK",
  keeper: "GK",
  goalie: "GK",
  gk: "GK",
  defender: "CB",
  fullback: "FB",
  "full-back": "FB",
  midfielder: "CM",
  midfield: "CM",
  winger: "W",
  striker: "ST",
  forward: "ST",
};

interface RoleFit {
  /** Plays there. */
  readonly primary: readonly PositionKey[];
  /** Could fill in at a push. */
  readonly secondary: readonly PositionKey[];
}

// Which player positions suit each pitch role. Advisory only, never blocking.
export const ROLE_FIT = {
  GK: { primary: ["GK"], secondary: [] },
  LB: { primary: ["FB"], secondary: ["W", "CB"] },
  RB: { primary: ["FB"], secondary: ["W", "CB"] },
  LWB: { primary: ["FB"], secondary: ["W"] },
  RWB: { primary: ["FB"], secondary: ["W"] },
  LCB: { primary: ["CB"], secondary: ["FB", "CDM"] },
  CB: { primary: ["CB"], secondary: ["FB", "CDM"] },
  RCB: { primary: ["CB"], secondary: ["FB", "CDM"] },
  LDM: { primary: ["CDM"], secondary: ["CM", "CB"] },
  CDM: { primary: ["CDM"], secondary: ["CM", "CB"] },
  RDM: { primary: ["CDM"], secondary: ["CM", "CB"] },
  LCM: { primary: ["CM"], secondary: ["CDM", "CAM"] },
  CM: { primary: ["CM"], secondary: ["CDM", "CAM"] },
  RCM: { primary: ["CM"], secondary: ["CDM", "CAM"] },
  LM: { primary: ["W"], secondary: ["CM", "CAM"] },
  RM: { primary: ["W"], secondary: ["CM", "CAM"] },
  LAM: { primary: ["CAM", "W"], secondary: ["CM"] },
  CAM: { primary: ["CAM"], secondary: ["CM", "ST"] },
  RAM: { primary: ["CAM", "W"], secondary: ["CM"] },
  LW: { primary: ["W"], secondary: ["CAM", "ST"] },
  RW: { primary: ["W"], secondary: ["CAM", "ST"] },
  SS: { primary: ["CAM", "ST"], secondary: ["CM"] },
  ST: { primary: ["ST"], secondary: ["CAM", "W"] },
} as const satisfies Record<string, RoleFit>;

export type Role = keyof typeof ROLE_FIT;

/** A marker on the pitch. x runs left to right, y from your own goal (0) to theirs (100). */
export interface SlotSpec {
  readonly band: number;
  readonly x: number;
  readonly y: number;
  readonly role: Role;
}

// Pitch is drawn with your own goal at the bottom, so screen-left is the left flank.
const X2 = [35, 65];
const X3 = [25, 50, 75];
const X4 = [18, 39, 61, 82];
const X5 = [14, 32, 50, 68, 86];

function line(band: number, y: number, xs: readonly number[], roles: readonly Role[]): SlotSpec[] {
  return xs.map((x, i) => ({ band, y, x, role: roles[i] }));
}
function one(y: number, role: Role): SlotSpec[] {
  return [{ band: role === "ST" ? 5 : 4, y, x: 50, role }];
}

const GK: SlotSpec[] = [{ band: 0, y: 8, x: 50, role: "GK" }];
const D3 = line(1, 27, X3, ["LCB", "CB", "RCB"]);
const D4 = line(1, 26, X4, ["LB", "LCB", "RCB", "RB"]);
const D5 = line(1, 26, X5, ["LWB", "LCB", "CB", "RCB", "RWB"]);
const M3 = line(3, 52, X3, ["LCM", "CM", "RCM"]);
const M4 = line(3, 52, X4, ["LM", "LCM", "RCM", "RM"]);
const M5 = line(3, 52, X5, ["LM", "LCM", "CM", "RCM", "RM"]);
const F2 = line(5, 80, X2, ["ST", "ST"]);
const F2_HIGH = line(5, 86, X2, ["ST", "ST"]);
const F3 = line(5, 80, X3, ["LW", "ST", "RW"]);
const ANCHOR: SlotSpec[] = [{ band: 2, y: 42, x: 50, role: "CDM" }];

const ELEVEN_A_SIDE: Readonly<Record<string, readonly SlotSpec[]>> = {
  "4-3-3": [...GK, ...D4, ...M3, ...F3],
  "4-2-3-1": [...GK, ...D4, ...line(2, 44, X2, ["LDM", "RDM"]), ...line(4, 66, X3, ["LAM", "CAM", "RAM"]), ...one(86, "ST")],
  "4-4-2": [...GK, ...D4, ...M4, ...F2],
  "4-1-4-1": [...GK, ...D4, ...ANCHOR, ...line(3, 63, X4, ["LM", "LCM", "RCM", "RM"]), ...one(86, "ST")],
  "4-4-1-1": [...GK, ...D4, ...line(3, 50, X4, ["LM", "LCM", "RCM", "RM"]), ...one(68, "SS"), ...one(87, "ST")],
  "4-1-2-1-2": [...GK, ...D4, ...ANCHOR, ...line(3, 58, X2, ["LCM", "RCM"]), ...one(72, "CAM"), ...F2_HIGH],
  "4-3-1-2": [...GK, ...D4, ...line(3, 50, X3, ["LCM", "CM", "RCM"]), ...one(70, "CAM"), ...F2_HIGH],
  "4-2-4-0": [...GK, ...D4, ...line(3, 50, X2, ["LCM", "RCM"]), ...line(5, 80, X4, ["LW", "ST", "ST", "RW"])],
  "3-4-1-2": [...GK, ...D3, ...line(3, 50, X4, ["LM", "LCM", "RCM", "RM"]), ...one(70, "CAM"), ...F2_HIGH],
  "3-2-4-1": [...GK, ...D3, ...line(2, 44, X2, ["LDM", "RDM"]), ...line(4, 66, X4, ["LW", "LAM", "RAM", "RW"]), ...one(86, "ST")],
  "3-4-3": [...GK, ...D3, ...M4, ...F3],
  "3-4-2-1": [...GK, ...D3, ...line(3, 50, X4, ["LM", "LCM", "RCM", "RM"]), ...line(4, 68, X2, ["LAM", "RAM"]), ...one(87, "ST")],
  "3-5-2": [...GK, ...D3, ...M5, ...F2],
  "5-4-1": [...GK, ...D5, ...line(3, 54, X4, ["LM", "LCM", "RCM", "RM"]), ...one(83, "ST")],
  "5-3-2": [...GK, ...D5, ...M3, ...F2],
};

// Small-sided shapes. Grassroots names count outfield players only, like the
// 11-a-side ones. 3v3 has no goalkeepers. Every name is unique across formats.
const SMALL_SIDED: Readonly<Record<string, readonly SlotSpec[]>> = {
  // 3v3
  "2-1": [...line(1, 30, [30, 70], ["LCB", "RCB"]), ...one(72, "ST")],
  "1-2": [...one(28, "CB"), ...line(4, 68, [30, 70], ["LW", "RW"])],
  "1-1-1": [...one(24, "CB"), ...one(50, "CM"), ...one(78, "ST")],
  // 5v5
  "1-2-1": [...GK, ...one(30, "CB"), ...line(3, 52, [22, 78], ["LM", "RM"]), ...one(78, "ST")],
  "2-2": [...GK, ...line(1, 30, [32, 68], ["LCB", "RCB"]), ...line(4, 70, [32, 68], ["LW", "RW"])],
  "2-1-1": [...GK, ...line(1, 30, [32, 68], ["LCB", "RCB"]), ...one(54, "CM"), ...one(80, "ST")],
  // 7v7
  "2-3-1": [...GK, ...line(1, 26, [33, 67], ["LCB", "RCB"]), ...line(3, 52, [20, 50, 80], ["LM", "CM", "RM"]), ...one(80, "ST")],
  "3-2-1": [...GK, ...line(1, 26, X3, ["LCB", "CB", "RCB"]), ...line(3, 52, X2, ["LCM", "RCM"]), ...one(80, "ST")],
  "2-1-2-1": [
    ...GK,
    ...line(1, 25, [33, 67], ["LCB", "RCB"]),
    ...line(2, 42, [50], ["CDM"]),
    ...line(4, 62, [22, 78], ["LW", "RW"]),
    ...one(84, "ST"),
  ],
  "3-1-2": [...GK, ...line(1, 26, X3, ["LCB", "CB", "RCB"]), ...line(3, 50, [50], ["CM"]), ...line(5, 76, X2, ["ST", "ST"])],
  // 9v9
  "3-2-3": [...GK, ...line(1, 24, X3, ["LCB", "CB", "RCB"]), ...line(3, 46, X2, ["LCM", "RCM"]), ...line(5, 74, [20, 50, 80], ["LW", "ST", "RW"])],
  "2-3-2-1": [
    ...GK,
    ...line(1, 24, [33, 67], ["LCB", "RCB"]),
    ...line(3, 44, [18, 50, 82], ["LM", "CM", "RM"]),
    ...line(4, 64, X2, ["LAM", "RAM"]),
    ...one(84, "ST"),
  ],
  "3-3-2": [...GK, ...line(1, 24, X3, ["LCB", "CB", "RCB"]), ...line(3, 48, [20, 50, 80], ["LM", "CM", "RM"]), ...line(5, 76, X2, ["ST", "ST"])],
  "3-4-1": [...GK, ...line(1, 24, X3, ["LCB", "CB", "RCB"]), ...line(3, 50, X4, ["LM", "LCM", "RCM", "RM"]), ...one(80, "ST")],
  "4-3-1": [...GK, ...line(1, 25, X4, ["LB", "LCB", "RCB", "RB"]), ...line(3, 50, X3, ["LCM", "CM", "RCM"]), ...one(80, "ST")],
};
/** Every shape, keyed by name. Which ones a board offers depends on its format. */
export const FORMATIONS: Readonly<Record<string, readonly SlotSpec[]>> = { ...ELEVEN_A_SIDE, ...SMALL_SIDED };

export const DEFAULT_FORMATION = "4-3-3";
export const CUSTOM_FORMATION = "Custom formation";

/* ---------- match formats and age groups ---------- */

export type FormatKey = "3v3" | "5v5" | "7v7" | "9v9" | "11v11";

export interface MatchFormat {
  readonly key: FormatKey;
  readonly label: string;
  /** Players on the pitch, keeper included when there is one. */
  readonly size: number;
  /** Shapes a coach can pick, first is the default. Keys of FORMATIONS. */
  readonly shapes: readonly string[];
}

export const FORMATS: Readonly<Record<FormatKey, MatchFormat>> = {
  "3v3": { key: "3v3", label: "3-a-side", size: 3, shapes: ["2-1", "1-2", "1-1-1"] },
  "5v5": { key: "5v5", label: "5-a-side", size: 5, shapes: ["1-2-1", "2-2", "2-1-1"] },
  "7v7": { key: "7v7", label: "7-a-side", size: 7, shapes: ["2-3-1", "3-2-1", "2-1-2-1", "3-1-2"] },
  "9v9": { key: "9v9", label: "9-a-side", size: 9, shapes: ["3-2-3", "2-3-2-1", "3-3-2", "3-4-1", "4-3-1"] },
  "11v11": {
    key: "11v11",
    label: "11-a-side",
    size: 11,
    shapes: [
      "4-3-3", "4-2-3-1", "4-4-2", "4-1-4-1", "4-4-1-1", "4-1-2-1-2", "4-3-1-2", "4-2-4-0",
      "3-4-1-2", "3-2-4-1", "3-4-3", "3-4-2-1", "3-5-2", "5-4-1", "5-3-2",
    ],
  },
};
export const FORMAT_KEYS = Object.keys(FORMATS) as FormatKey[];
export const DEFAULT_FORMAT: FormatKey = "11v11";

/**
 * Up to under 11s is development football: everyone plays, winning is a metaphor.
 * From under 12s results count and coaches play to win (FA, from 2026-27).
 */
export type Phase = "development" | "competitive";

export type AgeKey = "U7" | "U8" | "U9" | "U10" | "U11" | "U12" | "U13" | "U14" | "U15" | "U16" | "U17" | "U18" | "Open";

export interface AgeGroup {
  readonly key: AgeKey;
  readonly label: string;
  /** The FA format for this age from 2026-27. Leagues and other nations can differ, so the coach can change it. */
  readonly format: FormatKey;
  readonly phase: Phase;
}

const dev = (key: AgeKey, n: number, format: FormatKey): AgeGroup => ({ key, label: `Under ${n}s`, format, phase: "development" });
const comp = (key: AgeKey, n: number, format: FormatKey): AgeGroup => ({ key, label: `Under ${n}s`, format, phase: "competitive" });

export const AGE_GROUPS: readonly AgeGroup[] = [
  dev("U7", 7, "3v3"),
  dev("U8", 8, "5v5"),
  dev("U9", 9, "5v5"),
  dev("U10", 10, "7v7"),
  dev("U11", 11, "7v7"),
  comp("U12", 12, "9v9"),
  comp("U13", 13, "9v9"),
  comp("U14", 14, "11v11"),
  comp("U15", 15, "11v11"),
  comp("U16", 16, "11v11"),
  comp("U17", 17, "11v11"),
  comp("U18", 18, "11v11"),
  { key: "Open", label: "Adults", format: "11v11", phase: "competitive" },
];

// In a custom shape the role is read from where the marker sits on the pitch,
// so cover suggestions keep working without anyone labelling anything.
// Each band runs up to `maxY`; within it the x thresholds pick the role.
interface Band {
  readonly maxY: number;
  readonly pick: (x: number) => Role;
}
export const CUSTOM_BANDS: readonly Band[] = [
  { maxY: 16, pick: () => "GK" },
  { maxY: 36, pick: (x) => (x < 26 ? "LB" : x > 74 ? "RB" : x < 45 ? "LCB" : x > 55 ? "RCB" : "CB") },
  { maxY: 48, pick: (x) => (x < 24 ? "LM" : x > 76 ? "RM" : x < 45 ? "LDM" : x > 55 ? "RDM" : "CDM") },
  { maxY: 62, pick: (x) => (x < 24 ? "LM" : x > 76 ? "RM" : x < 45 ? "LCM" : x > 55 ? "RCM" : "CM") },
  { maxY: 75, pick: (x) => (x < 26 ? "LAM" : x > 74 ? "RAM" : "CAM") },
  { maxY: Infinity, pick: (x) => (x < 30 ? "LW" : x > 70 ? "RW" : "ST") },
];

/** How far a custom marker can be dragged, in percent of the pitch. */
export const CUSTOM_BOUNDS = { minX: 7, maxX: 93, minY: 3, maxY: 96 } as const;
