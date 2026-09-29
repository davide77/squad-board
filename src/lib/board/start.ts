import { BOARD_CONFIG } from "@/constants/config";
import { EXAMPLE } from "@/constants/content/board";
import { DEMO_BENCH, DEMO_SHAPES, DEMO_XI } from "@/constants/content/landing";
import { DEFAULT_FORMATION, POSITION_CODES, POSITION_WORDS, XI_SIZE, type PositionKey } from "@/constants/football";
import { canonical, captureLineup, fitLevel, slotOf, slots } from "./queries";
import { emptyData } from "./storage";
import type { BoardData } from "./types";

/** One player read from a pasted squad list. */
export interface SquadEntry {
  readonly num: string;
  readonly name: string;
  readonly pos: readonly PositionKey[];
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

function positionOf(token: string): PositionKey | null {
  const bare = token.replace(/[.:;]+$/, "");
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
  const words: string[] = [];
  for (const token of line.split(WORD_SPLIT).filter(Boolean)) {
    const p = positionOf(token);
    if (p) {
      if (!pos.includes(p)) pos.push(p);
    } else {
      words.push(token);
    }
  }
  // A line that was only position words is a name after all.
  const name = (words.length ? words.join(" ") : line).replace(/[\s.,;:\-]+$/, "").trim();
  if (!name || /^\d+$/.test(name)) return null;
  return { num, name, pos: words.length ? pos : [] };
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

/** How many of a squad of this size start. */
export function startingCount(squad: number): number {
  return Math.min(squad, XI_SIZE);
}

/**
 * A ready board for a new squad: everyone called up, the first eleven listed on the
 * pitch and the rest on the bench. Among the eleven, players go where their positions
 * suit first, then fill the gaps in list order, so a plain list starts with the keeper.
 */
export function buildBoard(
  team: string,
  squad: readonly SquadEntry[],
  newId: () => string,
  formation: string = DEFAULT_FORMATION,
): BoardData {
  const d = emptyData();
  d.team = team.trim();
  d.formation = formation;
  d.players = squad.map((e) => ({
    id: newId(),
    num: e.num,
    name: e.name,
    init: "",
    pos: [...e.pos],
    out: false,
    inj: false,
    una: false,
  }));

  const starters = d.players.slice(0, XI_SIZE);
  const unplaced = () => starters.filter((p) => !slotOf(d, p.id));
  const order = canonical(slots(d));
  for (const level of [2, 1] as const) {
    for (const s of order) {
      if (d.xi[s.id]) continue;
      const p = unplaced().find((c) => fitLevel(c, s.role) === level);
      if (p) d.xi[s.id] = p.id;
    }
  }
  for (const s of order) {
    if (d.xi[s.id]) continue;
    const p = unplaced()[0];
    if (!p) break;
    d.xi[s.id] = p.id;
  }
  d.bench = d.players.slice(XI_SIZE).map((p) => p.id);

  d.preset = captureLineup(d);
  d.saved = captureLineup(d);
  return d;
}

/** The made-up team from the landing page, in the shape it shows there. */
export function exampleBoard(newId: () => string): BoardData {
  const squad = [...DEMO_XI, ...DEMO_BENCH].map((p) => ({ num: String(p.num), name: p.name, pos: p.pos }));
  const d = buildBoard(EXAMPLE.team, squad, newId, DEMO_SHAPES[0]);
  d.fixture = EXAMPLE.fixture;
  d.example = true;
  return d;
}
