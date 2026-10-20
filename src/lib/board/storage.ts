import { KIT_COLOURS } from "@/constants/brand";
import { COMPETITIONS, NAME_STYLES, type NameStyle } from "@/constants/content/board";
import { BADGE_CONFIG, BOARD_CONFIG, STORAGE_KEY } from "@/constants/config";
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
import { defaultKits, readKit, stripOf } from "./kit";
import { captureLineup, elapsed } from "./queries";
import type { BoardData, Clock, Kickoff, Lineup, MatchDetails, Minutes, NamedLineup, Player, Point, Sub, XI } from "./types";

export function emptyMatch(): MatchDetails {
  return { date: "", kickoff: "", meet: "", kit: "", address: "", venue: "", surface: "", competition: "", us: 0, them: 0, potm: "", ended: false, half: 1, atBreak: false };
}

export function emptyData(): BoardData {
  const d: BoardData = {
    team: "",
    season: "",
    fixture: "",
    match: emptyMatch(),
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
    kickoff: null,
    removed: [],
    colour: 0,
    kits: defaultKits(stripOf(0)),
    badge: "",
    clock: { running: false, base: 0, since: 0 },
    example: false,
    createdAt: 0,
    backedUpAt: 0,
    updatedAt: 0,
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

// Only the PNG this app writes. Anything else in the field could be a link, so it is dropped.
const BADGE_PREFIX = "data:image/png;base64,";
const isBadge = (v: unknown): v is string =>
  typeof v === "string" && v.startsWith(BADGE_PREFIX) && v.length <= BADGE_CONFIG.maxChars;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const matching = (v: unknown, re: RegExp) => (re.test(str(v)) ? str(v) : "");

function readMatch(v: unknown): MatchDetails {
  if (!isRec(v)) return emptyMatch();
  return {
    date: matching(v.date, DATE),
    kickoff: matching(v.kickoff, TIME),
    meet: matching(v.meet, TIME),
    kit: str(v.kit),
    address: str(v.address),
    venue: v.venue === "home" || v.venue === "away" ? v.venue : "",
    surface: v.surface === "grass" || v.surface === "astro" ? v.surface : "",
    competition: COMPETITIONS.find((c) => c.key === v.competition)?.key ?? "",
    us: Math.max(0, Math.floor(num(v.us))),
    them: Math.max(0, Math.floor(num(v.them))),
    potm: str(v.potm),
    ended: v.ended === true,
    half: v.half === 2 ? 2 : 1,
    atBreak: v.atBreak === true,
  };
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

function readKickoff(v: unknown): Kickoff | null {
  if (!isRec(v) || !isRec(v.flags)) return null;
  const lineup = readLineup(v.lineup);
  if (!lineup) return null;
  const flags: Kickoff["flags"] = {};
  for (const [id, f] of Object.entries(v.flags)) {
    if (isRec(f)) flags[id] = { out: f.out === true, inj: f.inj === true, una: f.una === true, trn: f.trn === true };
  }
  return { lineup, flags };
}

function readNamedLineup(v: unknown): NamedLineup | null {
  const l = readLineup(v);
  return l && isRec(v) ? { ...l, name: str(v.name) } : null;
}

function readSub(v: unknown): Sub | null {
  return isRec(v) ? { min: num(v.min), onName: str(v.onName), offName: str(v.offName), inj: v.inj === true } : null;
}

/**
 * The home and away strips. A board from before them wore its club colour at home and, when it had
 * one, its away colour away, each as a plain shirt with black shorts.
 */
function readKits(raw: Record<string, unknown>, colour: number): BoardData["kits"] {
  const fallback = defaultKits(stripOf(colour));
  if (typeof raw.awayColour === "number" && KIT_COLOURS[raw.awayColour]) {
    const away = stripOf(raw.awayColour);
    fallback.away = { ...fallback.away, shirt: away, socks: away, second: away === "white" ? "black" : "white" };
  }
  const kits = isRec(raw.kits) ? raw.kits : {};
  return { home: readKit(kits.home, fallback.home), away: readKit(kits.away, fallback.away) };
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
    match: readMatch(raw.match),
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
    kickoff: readKickoff(raw.kickoff),
    removed: list(raw.removed).map(readPlayer).filter(notNull),
    colour: KIT_COLOURS[colour] ? colour : 0,
    kits: readKits(raw, KIT_COLOURS[colour] ? colour : 0),
    badge: isBadge(raw.badge) ? raw.badge : "",
    // A file or link always opens with the clock paused. parseStored carries on a running one saved on this device.
    clock: { running: false, base: isRec(raw.clock) ? num(raw.clock.base) : 0, since: 0 },
    example: raw.example === true,
    createdAt: num(raw.createdAt),
    backedUpAt: num(raw.backedUpAt),
    updatedAt: num(raw.updatedAt),
    voice: isVoice(raw.voice) ? raw.voice : DEFAULT_VOICE,
    age: isAge(raw.age) ? raw.age : null,
    format,
    minutes: readMinutes(raw.minutes),
    sheetCredit: raw.sheetCredit !== false,
  };
}

/** What goes into an exported file or a squad link. The clock is banked, never running. */
export function snapshot(d: BoardData, now: number): BoardData {
  return { ...d, clock: { running: false, base: elapsed(d, now), since: 0 } };
}

/**
 * The clock as it was saved on this device. A running clock keeps running through a refresh:
 * it holds the moment it started, so the time on it is worked out from now, not from the last save.
 * One left running for hours, or started in the future by a changed device clock, reopens paused
 * at the time it had when the board last changed.
 */
export function storedClock(raw: unknown, updatedAt: number, now: number): Clock {
  const c = isRec(raw) ? raw : {};
  const base = Math.max(0, num(c.base));
  const since = num(c.since);
  if (c.running !== true || since <= 0) return { running: false, base, since: 0 };
  if (since <= now && now - since <= BOARD_CONFIG.clockStaleMs) return { running: true, base, since };
  return { running: false, base: base + Math.max(0, Math.min(updatedAt, now) - since), since: 0 };
}

/* ---------- localStorage ---------- */

/** The saved board as written, for anything that watches it change. */
export function readStoredRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** A stored board with players on it, or null. Given `now`, a running clock carries on from where it really is. */
export function parseStored(raw: string | null, now?: number): BoardData | null {
  if (!raw) return null;
  try {
    const json: unknown = JSON.parse(raw);
    const d = readBoard(json);
    if (!d || !d.players.length) return null;
    if (now !== undefined && isRec(json)) d.clock = storedClock(json.clock, d.updatedAt, now);
    return d;
  } catch {
    return null;
  }
}

/** The board another tab left in storage, to take up here. Nothing stored means it was cleared there. */
export function readSynced(raw: string | null, now: number): BoardData {
  try {
    const json: unknown = raw ? JSON.parse(raw) : null;
    const d = readBoard(json);
    if (!d || !isRec(json)) return emptyData();
    d.clock = storedClock(json.clock, d.updatedAt, now);
    return d;
  } catch {
    return emptyData();
  }
}

export function loadStored(now: number): BoardData | null {
  return parseStored(readStoredRaw(), now);
}

/** The board as this device keeps it. Unlike a file, a running clock stays running. */
export function storedJSON(d: BoardData): string {
  return JSON.stringify(d);
}

/** Writes the board and returns what was written, or null when the browser refuses to store anything. */
export function writeStored(d: BoardData): string | null {
  try {
    const json = storedJSON(d);
    localStorage.setItem(STORAGE_KEY, json);
    return json;
  } catch {
    return null;
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
