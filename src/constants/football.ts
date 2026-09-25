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

export const FORMATIONS: Readonly<Record<string, readonly SlotSpec[]>> = {
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

export const DEFAULT_FORMATION = "4-3-3";
export const CUSTOM_FORMATION = "Custom formation";
export const FORMATION_NAMES: readonly string[] = [...Object.keys(FORMATIONS), CUSTOM_FORMATION];
export const XI_SIZE = 11;

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
