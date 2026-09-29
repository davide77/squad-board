import { NO_NUMBER, SHEET, SUBS } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { matchHeader } from "./message";
import { firstName } from "./names";
import { byId, canonical, coverFor, slots } from "./queries";
import type { BoardData } from "./types";

const pad = (s: string, n: number) => s.padEnd(n, " ");
const INDENT = "    ";

/** Plain text team sheet, ready to paste into a message. */
export function sheetText(d: BoardData): string {
  // The same match details as the squad message, so the line-up can go out on its own.
  const out = matchHeader(d);
  out.push("", d.formation, "");

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
  // Who was left out, injured or unavailable stays with the coach. The sheet names only who is playing.

  if (d.subs.length) {
    out.push("", SHEET.subs, ...d.subs.map((s) => `  ${s.min}' ${s.onName} ${SUBS.for} ${s.offName}`));
  }
  if (d.sheetCredit) out.push("", SHEET.credit);
  return out.join("\n");
}
