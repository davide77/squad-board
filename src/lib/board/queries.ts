import {
  CUSTOM_BANDS,
  CUSTOM_FORMATION,
  DEFAULT_FORMATION,
  FORMATIONS,
  ROLE_FIT,
  type Role,
} from "@/constants/football";
import type { BoardData, Lineup, Player, Point, Slot } from "./types";

export function isShape(name: string): boolean {
  return name === CUSTOM_FORMATION || name in FORMATIONS;
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

// Injured and unavailable both put a player beyond selection. "out" alone is the coach's choice.
export function blocked(p: Player): boolean {
  return p.inj || p.una;
}

export type Reason = "inj" | "una" | "out";
export function reasonOf(p: Player): Reason | null {
  return p.inj ? "inj" : p.una ? "una" : p.out ? "out" : null;
}

function benchFirst(d: BoardData) {
  return (a: Player, b: Player) => Number(!onBench(d, a.id)) - Number(!onBench(d, b.id));
}

/** Called-up players off the pitch at a given fit level, bench first. */
export function freeAt(d: BoardData, role: Role, level: 0 | 1 | 2, except: string | null = null): Player[] {
  return d.players
    .filter((p) => !p.out && p.id !== except && !slotOf(d, p.id) && fitLevel(p, role) === level)
    .sort(benchFirst(d));
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

export function unsaved(d: BoardData): boolean {
  return lineupSig(captureLineup(d)) !== lineupSig(d.saved);
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

export function fmtClock(ms: number): string {
  const t = Math.floor(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
