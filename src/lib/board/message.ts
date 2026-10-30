import { MESSAGE_CONFIG, MESSAGE_DATE_FORMAT } from "@/constants/config";
import { COMPETITIONS, MESSAGE, SHEET } from "@/constants/content/board";
import { kitWords } from "./kit";
import { sentName } from "./names";
import type { BoardData } from "./types";

/** "2026-10-04" as "Sunday 4 October". Read as a local date, so it never slips a day. */
export function matchDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Intl.DateTimeFormat(MESSAGE_CONFIG.locale, MESSAGE_DATE_FORMAT).format(new Date(y, m - 1, d));
}

/** "v City Select · Friendly · Away · Sunday 4 October · KO 10:00", for the board header. Empty when nothing is in. */
export function matchSummary(d: BoardData): string {
  const { match } = d;
  return [
    d.fixture.trim(),
    COMPETITIONS.find((c) => c.key === match.competition)?.label,
    MESSAGE.venues.find((v) => v.key === match.venue)?.label,
    matchDate(match.date),
    match.kickoff && MESSAGE.kickoffShort + match.kickoff,
  ]
    .filter(Boolean)
    .join(SHEET.pictureJoin);
}

/** Whether this week's match is on the day of `now`, read as local dates. */
export function matchIsToday(d: BoardData, now: number): boolean {
  const [y, m, day] = d.match.date.split("-").map(Number);
  if (!y || !m || !day) return false;
  const today = new Date(now);
  return today.getFullYear() === y && today.getMonth() === m - 1 && today.getDate() === day;
}

const BOLD = MESSAGE_CONFIG.boldMark;

/** "*Sunday 1 November*", so WhatsApp shows it in bold. Stray marks inside are dropped so the pair still holds. */
function bold(text: string): string {
  const clean = text.split(BOLD).join("").trim();
  return clean ? BOLD + clean + BOLD : "";
}

/** A message line cut into plain and bold runs, so the preview on the board reads as WhatsApp will show it. */
export function boldRuns(line: string): { text: string; bold: boolean }[] {
  const parts = line.split(BOLD);
  // An odd mark with no partner is not bold in WhatsApp either: put it back and keep the line plain.
  if (parts.length % 2 === 0) return [{ text: line, bold: false }];
  return parts.map((text, i) => ({ text, bold: i % 2 === 1 })).filter((r) => r.text);
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
  const title = (d.team || SHEET.fallbackTitle) + (d.season ? SHEET.pictureJoin + d.season : "");
  // The lines a parent acts on are bold: who and when, the times, and the squad heading.
  const out: string[] = [bold(date ? `${title} - ${date}` : title)];
  const kind = COMPETITIONS.find((c) => c.key === match.competition)?.label.toLowerCase();
  const tag = MESSAGE.fixtureTag([match.venue, kind ?? ""].filter(Boolean));
  if (d.fixture.trim()) out.push(d.fixture.trim() + tag);
  // Home or away says which strip, in full. A board from before that keeps its own words.
  if (match.venue) {
    out.push(MESSAGE.kitLine(match.venue, kitWords(d.kits[match.venue])));
  } else if (match.kit.trim()) {
    out.push(match.kit.trim());
  }
  if (match.surface) out.push(MESSAGE.surfaceLine[match.surface]);

  const when: string[] = [];
  if (match.kickoff) when.push(MESSAGE.kickoff + bold(match.kickoff));
  if (match.meet) when.push(MESSAGE.meet + bold(match.meet));
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
  // In alphabetical order of the name as it goes out, so a parent finds their child at a glance.
  const squad = d.players
    .filter((p) => !p.out)
    .map((p) => sentName(d, p.name))
    .sort((a, b) => a.localeCompare(b, MESSAGE_CONFIG.locale));
  out.push("", bold(MESSAGE.squad), ...(squad.length ? squad : [MESSAGE.nobody]));
  out.push("", MESSAGE.confirm);
  if (d.sheetCredit) out.push("", SHEET.credit);
  return out.join("\n");
}
