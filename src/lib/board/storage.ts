import { KIT_COLOURS } from "@/constants/brand";
import { NAME_STYLES, type NameStyle } from "@/constants/content/board";
import { STORAGE_KEY } from "@/constants/config";
import { DEFAULT_VOICE } from "@/constants/content/landing";
import {
  AGE_GROUPS,
  CUSTOM_FORMATION,
  DEFAULT_FORMAT,
  FORMATIONS,
  FORMATS,
  LEGACY_POSITIONS,
  POSITION_KEYS,
  type AgeKey,
  type FormatKey,
  type PositionKey,
} from "@/constants/football";
import { isVoice } from "@/lib/voice";
import { captureLineup, elapsed } from "./queries";
import type { BoardData, Lineup, Minutes, NamedLineup, Player, Point, Sub, XI } from "./types";

export function emptyData(): BoardData {
  const d: BoardData = {
    team: "",
    season: "",
    fixture: "",
    formation: FORMATS[DEFAULT_FORMAT].shapes[0],
    players: [],
    xi: {},
    bench: [],
    subs: [],
    lineups: [],
    showCover: true,
    custom: [],
    nameStyle: "first",
    preset: null,
    saved: null,
    removed: [],
    colour: 0,
    clock: { running: false, base: 0, since: 0 },
    example: false,
    createdAt: 0,
    backedUpAt: 0,
    voice: DEFAULT_VOICE,
    age: null,
    format: DEFAULT_FORMAT,
    minutes: { on: {}, played: {} },
    sheetCredit: true,
  };
  d.preset = captureLineup(d);
  d.saved = captureLineup(d);
  return d;
}

/* ---------- reading untrusted JSON ---------- */

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const ids = (v: unknown): string[] => list(v).filter((x): x is string => typeof x === "string");
const isPos = (k: string): k is PositionKey => (POSITION_KEYS as readonly string[]).includes(k);

function readPlayer(v: unknown): Player | null {
  if (!isRec(v) || typeof v.id !== "string" || !str(v.name)) return null;
  const pos = list(v.pos)
    .map((k) => LEGACY_POSITIONS[str(k)] ?? str(k))
    .filter(isPos);
  return {
    id: v.id,
    num: str(v.num),
    name: str(v.name),
    init: str(v.init),
    pos: [...new Set(pos)],
    side: v.side === "L" || v.side === "R" ? v.side : null,
    out: !!v.out,
    inj: !!v.inj,
    una: !!v.una,
    trn: !!v.trn,
  };
}

function readXI(v: unknown): XI {
  const xi: XI = {};
  if (isRec(v)) for (const [k, id] of Object.entries(v)) if (typeof id === "string") xi[k] = id;
  return xi;
}

function readPoints(v: unknown): Point[] {
  return list(v)
    .filter(isRec)
    .map((p) => ({ x: num(p.x), y: num(p.y) }));
}

/** A shape that fits the format, or the format's first shape. */
function readFormation(v: unknown, custom: readonly Point[], format: FormatKey): string {
  const f = str(v);
  const { size, shapes } = FORMATS[format];
  if (f === CUSTOM_FORMATION) return custom.length === size ? f : shapes[0];
  return shapes.includes(f) ? f : shapes[0];
}

/** A saved plan keeps its own shape. Whether it fits the board is checked when it is loaded. */
function readPlanFormation(v: unknown, custom: readonly Point[]): string {
  const f = str(v);
  if (f === CUSTOM_FORMATION) return custom.length ? f : "";
  return f in FORMATIONS ? f : "";
}

const isFormat = (v: unknown): v is FormatKey => typeof v === "string" && v in FORMATS;
const isAge = (v: unknown): v is AgeKey => AGE_GROUPS.some((a) => a.key === v);

function readMinutes(v: unknown): Minutes {
  const times = (r: unknown) => {
    const out: Record<string, number> = {};
    if (isRec(r)) for (const [k, t] of Object.entries(r)) if (typeof t === "number" && t >= 0) out[k] = t;
    return out;
  };
  return isRec(v) ? { on: times(v.on), played: times(v.played) } : { on: {}, played: {} };
}

function readLineup(v: unknown): Lineup | null {
  if (!isRec(v) || !isRec(v.xi)) return null;
  const custom = readPoints(v.custom);
  return { formation: readPlanFormation(v.formation, custom), xi: readXI(v.xi), bench: ids(v.bench), custom };
}

function readNamedLineup(v: unknown): NamedLineup | null {
  const l = readLineup(v);
  return l && isRec(v) ? { ...l, name: str(v.name) } : null;
}

function readSub(v: unknown): Sub | null {
  return isRec(v) ? { min: num(v.min), onName: str(v.onName), offName: str(v.offName) } : null;
}

const notNull = <T,>(v: T | null): v is T => v !== null;

/** Turns a saved or imported board into safe state, or null when it is not a squad file. */
export function readBoard(raw: unknown): BoardData | null {
  if (!isRec(raw) || !Array.isArray(raw.players)) return null;
  const custom = readPoints(raw.custom);
  const style = str(raw.nameStyle);
  const colour = num(raw.colour);
  // Boards from before formats existed were all 11-a-side.
  const format = isFormat(raw.format) ? raw.format : DEFAULT_FORMAT;
  return {
    team: str(raw.team),
    season: str(raw.season),
    fixture: str(raw.fixture),
    formation: readFormation(raw.formation, custom, format),
    players: raw.players.map(readPlayer).filter(notNull),
    xi: readXI(raw.xi),
    bench: ids(raw.bench),
    subs: list(raw.subs).map(readSub).filter(notNull),
    lineups: list(raw.lineups).map(readNamedLineup).filter(notNull),
    showCover: raw.showCover !== false,
    custom,
    nameStyle: NAME_STYLES.some((o) => o.key === style) ? (style as NameStyle) : "first",
    preset: readLineup(raw.preset),
    saved: readLineup(raw.saved),
    removed: list(raw.removed).map(readPlayer).filter(notNull),
    colour: KIT_COLOURS[colour] ? colour : 0,
    // A board always reopens with the clock paused where it was left.
    clock: { running: false, base: isRec(raw.clock) ? num(raw.clock.base) : 0, since: 0 },
    example: raw.example === true,
    createdAt: num(raw.createdAt),
    backedUpAt: num(raw.backedUpAt),
    voice: isVoice(raw.voice) ? raw.voice : DEFAULT_VOICE,
    age: isAge(raw.age) ? raw.age : null,
    format,
    minutes: readMinutes(raw.minutes),
    sheetCredit: raw.sheetCredit !== false,
  };
}

/** What is written to storage and to an exported file. The clock is banked, never running. */
export function snapshot(d: BoardData, now: number): BoardData {
  return { ...d, clock: { running: false, base: elapsed(d, now), since: 0 } };
}

/* ---------- localStorage ---------- */

export function loadStored(): BoardData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = readBoard(JSON.parse(raw));
    return d && d.players.length ? d : null;
  } catch {
    return null;
  }
}

/** Returns false when the browser refuses to store anything. */
export function writeStored(d: BoardData, now: number): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot(d, now)));
    return true;
  } catch {
    return false;
  }
}

/** Asks the browser not to clear the board when space runs low. Browsers may say no. */
export async function keepStored(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    // not supported here, the board still saves as normal
  }
}

export function clearStored(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing stored to clear
  }
}
