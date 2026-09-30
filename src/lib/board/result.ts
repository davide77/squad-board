import { FULL, SHEET } from "@/constants/content/board";
import { byId } from "./queries";
import { sentName } from "./names";
import type { BoardData } from "./types";

/** "v Northgate, league" as "Northgate": the other team, from the fixture the coach typed. */
export function opponentName(fixture: string): string {
  return fixture
    .trim()
    .replace(/^(v|vs)\.?\s+/i, "")
    .split(",")[0]
    .trim();
}

/**
 * The result for the parents' group: the score, and the player of the match when there is one.
 * Names follow the style picked, the same as the call-up.
 */
export function resultText(d: BoardData): string {
  const { us, them, potm } = d.match;
  const score = `${FULL.us(d.team)} ${us}-${them} ${opponentName(d.fixture)}`.trim();
  const out = [FULL.resultTitle, score];
  const star = byId(d, potm);
  if (star) out.push(FULL.potmLine(sentName(d, star.name)));
  if (d.sheetCredit) out.push("", SHEET.credit);
  return out.join("\n");
}
