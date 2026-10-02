import {
  AGE_GROUPS,
  CUSTOM_BANDS,
  CUSTOM_FORMATION,
  DEFAULT_FORMATION,
  FORMATIONS,
  FORMATS,
  ROLE_FIT,
  SIDED_CODES,
  type AgeGroup,
  type FormatKey,
  type Phase,
  type Role,
  type Side,
} from "@/constants/football";
import type { BoardData, Lineup, Player, Point, Slot } from "./types";

/** A shape this format can use: one of its own, or the custom shape. */
export function isShape(name: string, format: FormatKey): boolean {
  return name === CUSTOM_FORMATION || FORMATS[format].shapes.includes(name);
}

/** How many play at once on this board. */
export function teamSize(d: BoardData): number {
  return FORMATS[d.format].size;
}

export function ageGroup(d: BoardData): AgeGroup | null {
  return AGE_GROUPS.find((a) => a.key === d.age) ?? null;
}

/** Boards made before age groups existed were 11-a-side league boards, so competitive. */
export function phaseOf(d: BoardData): Phase {
  return ageGroup(d)?.phase ?? "competitive";
}

/**
 * What the coach's first-choice side is called. Development football has a starting
 * line-up, not a strongest side. XI only when there really are eleven.
 */
export function planName(d: BoardData): "starting line-up" | "strongest XI" | "strongest team" {
  if (phaseOf(d) === "development") return "starting line-up";
  return d.format === "11v11" ? "strongest XI" : "strongest team";
}

/** Whether a saved line-up belongs to this board's format. */
export function fitsFormat(l: Lineup, d: BoardData): boolean {
  if (l.formation === CUSTOM_FORMATION) return l.custom.length === teamSize(d);
  return FORMATS[d.format].shapes.includes(l.formation);
}

function bandOf(y: number): number {
  return CUSTOM_BANDS.findIndex((b) => y <= b.maxY);
}

export function roleAt(point: Point): Role {
  return CUSTOM_BANDS[bandOf(point.y)].pick(point.x);
}

export function slotsFor(formation: string, custom: readonly Point[]): Slot[] {
  if (formation === CUSTOM_FORMATION) {
    return custom.map((c, i) => ({
      id: `${CUSTOM_FORMATION}#${i}`,
      band: bandOf(c.y),
      x: c.x,
      y: c.y,
      role: roleAt(c),
    }));
  }
  const list = FORMATIONS[formation] ?? FORMATIONS[DEFAULT_FORMATION];
  return list.map((s, i) => ({ id: `${formation}#${i}`, ...s }));
}

export function slots(d: BoardData): Slot[] {
  return slotsFor(d.formation, d.custom);
}

export function slotById(d: BoardData, id: string): Slot | null {
  return slots(d).find((s) => s.id === id) ?? null;
}

/** Back line first, then left to right. Used to carry players across a shape change. */
export function canonical(list: readonly Slot[]): Slot[] {
  return [...list].sort((a, b) => a.band - b.band || a.x - b.x);
}

export function byId(d: BoardData, id: string | null | undefined): Player | null {
  return (id && d.players.find((p) => p.id === id)) || null;
}

export function slotOf(d: BoardData, pid: string): string | null {
  for (const k in d.xi) if (d.xi[k] === pid) return k;
  return null;
}

export function onBench(d: BoardData, pid: string): boolean {
  return d.bench.includes(pid);
}

export function where(d: BoardData, pid: string): "xi" | "bench" | "pool" {
  if (slotOf(d, pid)) return "xi";
  if (onBench(d, pid)) return "bench";
  return "pool";
}

/** 2 plays there, 1 could fill in, 0 out of position. */
export function fitLevel(p: Player, role: Role): 0 | 1 | 2 {
  const fit = ROLE_FIT[role];
  const primary: readonly string[] = fit.primary;
  const secondary: readonly string[] = fit.secondary;
  if (p.pos.some((k) => primary.includes(k))) return 2;
  if (p.pos.some((k) => secondary.includes(k))) return 1;
  return 0;
}

/** The flank a pitch role sits on, from its code: LCB and LW are left, CB and ST neither. */
export function roleSide(role: Role): Side | null {
  if (role.length < 2) return null;
  return role[0] === "L" ? "L" : role[0] === "R" ? "R" : null;
}

/** 0 their side or a central role, 1 plays either side, 2 the other flank. */
export function sideRank(p: Player, role: Role): 0 | 1 | 2 {
  const side = roleSide(role);
  if (!side || p.side === side) return 0;
  return p.side ? 2 : 1;
}

/** Positions as a coach writes them: a right-sided full-back reads RB, not FB. */
export function positionCodes(p: Player): string[] {
  return p.pos.map((k) => (p.side && SIDED_CODES[k]?.[p.side]) || k);
}

// Injured, unavailable and missed training all put a player beyond selection this week.
// "out" alone is the coach's choice.
export function blocked(p: Player): boolean {
  return p.inj || p.una || p.trn;
}

export type Reason = "inj" | "una" | "trn" | "out";
export function reasonOf(p: Player): Reason | null {
  return p.inj ? "inj" : p.una ? "una" : p.trn ? "trn" : p.out ? "out" : null;
}

function benchFirst(d: BoardData) {
  return (a: Player, b: Player) => Number(!onBench(d, a.id)) - Number(!onBench(d, b.id));
}

/** Called-up players off the pitch at a given fit level, bench first, then those on the role's side. */
export function freeAt(d: BoardData, role: Role, level: 0 | 1 | 2, except: string | null = null): Player[] {
  const bench = benchFirst(d);
  return d.players
    .filter((p) => !p.out && p.id !== except && !slotOf(d, p.id) && fitLevel(p, role) === level)
    .sort((a, b) => bench(a, b) || sideRank(a, role) - sideRank(b, role));
}

// Only players who actually play the position. No falling back to stand-ins:
// a blank is more honest than naming a winger as striker cover.
export function coverFor(d: BoardData, slotId: string): Player[] {
  const s = slotById(d, slotId);
  if (!s) return [];
  return freeAt(d, s.role, 2, d.xi[slotId] ?? null);
}

// Best available replacement: someone who plays there, then someone who could fill in.
export function bestFree(d: BoardData, role: Role): Player | null {
  return freeAt(d, role, 2)[0] ?? freeAt(d, role, 1)[0] ?? null;
}

/** What is worth checking before the call-up goes: shirt numbers on two players, and players with no position. */
export function squadChecks(d: BoardData) {
  const dupes = [...dupeNumbers(d)].sort((a, b) => Number(a) - Number(b));
  const noPosition = d.players.filter((p) => !p.pos.length);
  const flagged = (dupes.length ? 1 : 0) + (noPosition.length ? 1 : 0);
  return { dupes, noPosition, flagged };
}

export function dupeNumbers(d: BoardData): Set<string> {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const p of d.players) {
    if (!p.num) continue;
    if (seen.has(p.num)) dupes.add(p.num);
    else seen.add(p.num);
  }
  return dupes;
}

export function captureLineup(d: BoardData): Lineup {
  return structuredClone({ formation: d.formation, xi: d.xi, bench: d.bench, custom: d.custom });
}

function lineupSig(l: Lineup | null): string {
  if (!l) return "";
  return JSON.stringify([
    l.formation,
    Object.keys(l.xi).sort().map((k) => `${k}:${l.xi[k]}`),
    l.bench,
    l.custom,
  ]);
}

/** The team on the board is not the strongest side saved, or none is saved yet. */
export function changedFromStrongest(d: BoardData): boolean {
  return lineupSig(captureLineup(d)) !== lineupSig(d.preset);
}

export function started(d: BoardData): boolean {
  return d.clock.running || d.clock.base > 0;
}

export function matchUnderway(d: BoardData): boolean {
  return started(d) || d.subs.length > 0;
}

export function elapsed(d: BoardData, now: number): number {
  return d.clock.base + (d.clock.running ? now - d.clock.since : 0);
}

/** Match time a player has had so far, in milliseconds. */
export function playedMs(d: BoardData, pid: string, now: number): number {
  const since = d.minutes.on[pid];
  return (d.minutes.played[pid] ?? 0) + (since === undefined ? 0 : Math.max(0, elapsed(d, now) - since));
}

/** Whole minutes played, as the coach reads them. */
export function playedMinutes(d: BoardData, pid: string, now: number): number {
  return Math.floor(playedMs(d, pid, now) / 60000);
}

/** Called-up players who have not been on at all yet, bench first. */
export function yetToPlay(d: BoardData, now: number): Player[] {
  return d.players
    .filter((p) => !p.out && !blocked(p) && playedMs(d, p.id, now) === 0 && !(p.id in d.minutes.on))
    .sort(benchFirst(d));
}

export function fmtClock(ms: number): string {
  const t = Math.floor(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
