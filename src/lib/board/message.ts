import { MESSAGE_CONFIG, MESSAGE_DATE_FORMAT } from "@/constants/config";
import { MESSAGE, SHEET } from "@/constants/content/board";
import { sentName } from "./names";
import type { BoardData } from "./types";

/** "2026-10-04" as "Sunday 4 October". Read as a local date, so it never slips a day. */
export function matchDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Intl.DateTimeFormat(MESSAGE_CONFIG.dateLocale, MESSAGE_DATE_FORMAT).format(new Date(y, m - 1, d));
}

export function mapLink(address: string): string {
  return MESSAGE_CONFIG.mapUrl + encodeURIComponent(address.replace(/\s+/g, " ").trim());
}

/**
 * The top of every message to the parents: the team and date, the fixture, the kit, then the times
 * and the ground with its map link. Every detail is optional: one left empty is simply not sent.
 */
export function matchHeader(d: BoardData): string[] {
  const { match } = d;
  const date = matchDate(match.date);
  const title = (d.team || SHEET.fallbackTitle) + (d.season ? `  ${d.season}` : "");
  const out: string[] = [date ? `${title} - ${date}` : title];
  if (d.fixture.trim()) out.push(d.fixture.trim());
  if (match.kit.trim()) out.push(match.kit.trim());

  const when: string[] = [];
  if (match.kickoff) when.push(MESSAGE.kickoff + match.kickoff);
  if (match.meet) when.push(MESSAGE.meet + match.meet);
  const address = match.address.trim();
  if (address) when.push(MESSAGE.address + address.replace(/\s*\n\s*/g, ", "), MESSAGE.map + mapLink(address));
  if (when.length) out.push("", ...when);
  return out;
}

/**
 * The call-up for the parents' group: when, where, what to wear and who is in.
 * Only called-up players are named. Who was left out, injured or unavailable stays with the coach.
 */
export function squadMessage(d: BoardData): string {
  const out = matchHeader(d);
  const squad = d.players.filter((p) => !p.out).map((p) => sentName(d, p.name));
  out.push("", MESSAGE.squad, ...(squad.length ? squad : [MESSAGE.nobody]));
  out.push("", MESSAGE.confirm);
  if (d.sheetCredit) out.push("", SHEET.credit);
  return out.join("\n");
}
