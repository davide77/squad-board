import { KIT_COLOURS } from "@/constants/brand";
import { BOARD_CONFIG } from "@/constants/config";
import { EXAMPLE } from "@/constants/content/board";
import { DEMO_BENCH, DEMO_SHAPES, DEMO_XI } from "@/constants/content/landing";
import {
  AGE_GROUPS,
  FORMATS,
  POSITION_CODES,
  POSITION_SIDES,
  POSITION_WORDS,
  type AgeKey,
  type PositionKey,
  type Side,
} from "@/constants/football";
import { defaultKits, stripOf } from "./kit";
import { canonical, captureLineup, fitLevel, sideRank, slotOf, slots, teamSize } from "./queries";
import { emptyData } from "./storage";
import type { BoardData, Player } from "./types";

/** One player read from a pasted squad list. */
export interface SquadEntry {
  readonly num: string;
  readonly name: string;
  readonly pos: readonly PositionKey[];
  /** From a sided code such as "RB". Null when none was typed, or both flanks were. */
  readonly side?: Side | null;
}

// Pasted lists come from WhatsApp, notes apps and spreadsheets, so they carry
// bullets, list numbers, emoji and captain marks. Dashes are escaped so the
// source holds no long dash characters.
const BULLET = /^[\s\-*+>\u2022\u00B7\u2013\u2014]+/;
const EMOJI = /[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]/gu;
const CAPTAIN = /\((?:c|vc)\)/gi;
const LEAD_NUMBER = /^#?(\d{1,2})(?:[.):\-\s]+|$)/;
const TRAIL_NUMBER = /[\s(#,\-]+#?(\d{1,2})\)?$/;
const WORD_SPLIT = /[\s,/|()]+/;

const bareToken = (token: string) => token.replace(/[.:;]+$/, "");

function positionOf(token: string): PositionKey | null {
  const bare = bareToken(token);
  return POSITION_CODES[bare] ?? POSITION_WORDS[bare.toLowerCase()] ?? null;
}

function readLine(raw: string): SquadEntry | null {
  let line = raw.replace(EMOJI, "").replace(CAPTAIN, "").replace(BULLET, "").trim();
  // "Saturday squad:" and similar headings are not players.
  if (!line || line.endsWith(":")) return null;

  let num = "";
  const lead = line.match(LEAD_NUMBER);
  if (lead) {
    num = lead[1];
    line = line.slice(lead[0].length);
  } else {
    const trail = line.match(TRAIL_NUMBER);
    if (trail) {
      num = trail[1];
      line = line.slice(0, trail.index);
    }
  }

  const pos: PositionKey[] = [];
  const sides = new Set<Side>();
  const words: string[] = [];
  for (const token of line.split(WORD_SPLIT).filter(Boolean)) {
    const p = positionOf(token);
    if (p) {
      if (!pos.includes(p)) pos.push(p);
      const side = POSITION_SIDES[bareToken(token)];
      if (side) sides.add(side);
    } else {
      words.push(token);
    }
  }
  // A line that was only position words is a name after all.
  const name = (words.length ? words.join(" ") : line).replace(/[\s.,;:\-]+$/, "").trim();
  if (!name || /^\d+$/.test(name)) return null;
  // "LB RB" means either flank, so only a single side is kept.
  const side = sides.size === 1 ? [...sides][0] : null;
  return words.length ? { num, name, pos, side } : { num, name, pos: [], side: null };
}

/** Reads a pasted or typed squad, one player per line, or a single comma separated line. */
export function parseSquad(text: string): SquadEntry[] {
  let lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 1 && /[,;]/.test(lines[0])) lines = lines[0].split(/[,;]/);
  return lines
    .map(readLine)
    .filter((e): e is SquadEntry => e !== null)
    .slice(0, BOARD_CONFIG.pasteMaxPlayers);
}

/** How many of a squad of this size start, for a side of this size. */
export function startingCount(squad: number, size: number): number {
  return Math.min(squad, size);
}

/**
 * Fills the empty positions from these players, in this order of preference: someone
 * who plays there on their own flank, then someone who plays either side, then the other
 * flank; then someone who could fill in, the same way; then whoever is left, in list
 * order, so a plain list starts with the keeper. Returns the players left over.
 */
export function placeStarters(d: BoardData, candidates: readonly Player[]): Player[] {
  const order = canonical(slots(d));
  const unplaced = () => candidates.filter((p) => !slotOf(d, p.id));
  for (const level of [2, 1] as const) {
    for (const worstSide of [0, 1, 2] as const) {
      for (const s of order) {
        if (d.xi[s.id]) continue;
        const p = unplaced().find((c) => fitLevel(c, s.role) === level && sideRank(c, s.role) <= worstSide);
        if (p) d.xi[s.id] = p.id;
      }
    }
  }
  for (const s of order) {
    if (d.xi[s.id]) continue;
    const p = unplaced()[0];
    if (!p) break;
    d.xi[s.id] = p.id;
  }
  return unplaced();
}

/**
 * A ready board for a new squad: everyone called up, the first players listed on the
 * pitch (as many as the age group's format plays) and the rest on the bench. Among
 * them, players go where their positions suit, on their own flank first.
 */
export function buildBoard(
  team: string,
  squad: readonly SquadEntry[],
  newId: () => string,
  age: AgeKey | null,
  formation?: string,
): BoardData {
  const d = emptyData();
  d.team = team.trim();
  d.age = age;
  d.format = AGE_GROUPS.find((a) => a.key === age)?.format ?? d.format;
  d.formation = formation && FORMATS[d.format].shapes.includes(formation) ? formation : FORMATS[d.format].shapes[0];
  d.players = squad.map((e) => ({
    id: newId(),
    num: e.num,
    name: e.name,
    init: "",
    pos: [...e.pos],
    side: e.side ?? null,
    out: false,
    inj: false,
    una: false,
    trn: false,
  }));

  const size = teamSize(d);
  placeStarters(d, d.players.slice(0, size));
  d.bench = d.players.slice(size).map((p) => p.id);

  d.preset = captureLineup(d);
  d.saved = captureLineup(d);
  return d;
}

/** The made-up team from the landing page, in the shape it shows there. */
export function exampleBoard(newId: () => string): BoardData {
  const squad = [...DEMO_XI, ...DEMO_BENCH].map((p) => ({ num: String(p.num), name: p.name, pos: p.pos }));
  const d = buildBoard(EXAMPLE.team, squad, newId, EXAMPLE.age, DEMO_SHAPES[0]);
  d.fixture = EXAMPLE.fixture;
  d.match = { ...d.match, ...EXAMPLE.match };
  d.colour = Math.max(0, KIT_COLOURS.findIndex((k) => k.name === EXAMPLE.kit));
  d.kits = defaultKits(stripOf(d.colour));
  d.example = true;
  return d;
}
