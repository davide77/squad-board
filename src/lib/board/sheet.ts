import { NO_NUMBER, SHEET, SUBS } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { firstName } from "./names";
import { blocked, byId, canonical, coverFor, slots } from "./queries";
import type { BoardData, Player } from "./types";

const pad = (s: string, n: number) => s.padEnd(n, " ");
const INDENT = "    ";

function section(out: string[], title: string, players: readonly Player[]) {
  if (!players.length) return;
  out.push("", title, ...players.map((p) => INDENT + p.name));
}

/** Plain text team sheet, ready to paste into a message. */
export function sheetText(d: BoardData): string {
  const out: string[] = [];
  out.push((d.team || SHEET.fallbackTitle) + (d.season ? `  ${d.season}` : ""));
  if (d.fixture) out.push(d.fixture);
  out.push(d.formation, "");

  for (const s of canonical(slots(d))) {
    const p = byId(d, d.xi[s.id]);
    const cover = coverFor(d, s.id)
      .slice(0, BOARD_CONFIG.coverNamesShown)
      .map((c) => firstName(c.name))
      .join(" / ");
    out.push(pad(s.role, 4) + (p ? pad(p.num, 3) + p.name + (cover ? `  (${cover})` : "") : NO_NUMBER));
  }

  if (d.bench.length) {
    out.push("", SHEET.bench);
    for (const id of d.bench) {
      const p = byId(d, id);
      if (p) out.push(INDENT + pad(p.num, 3) + p.name);
    }
  }
  section(out, SHEET.notCalledUp, d.players.filter((p) => p.out && !blocked(p)));
  section(out, SHEET.injured, d.players.filter((p) => p.inj));
  section(out, SHEET.unavailable, d.players.filter((p) => p.una));

  if (d.subs.length) {
    out.push("", SHEET.subs, ...d.subs.map((s) => `  ${s.min}' ${s.onName} ${SUBS.for} ${s.offName}`));
  }
  return out.join("\n");
}
