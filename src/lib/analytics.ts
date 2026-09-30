import { track } from "@vercel/analytics";
import {
  AGE_NOT_SET,
  ANALYTICS_CONFIG,
  ANALYTICS_EVENTS,
  FIRST_WEEK,
  LAST_ACTIVE_WEEK_KEY,
  LAST_OPENED_KEY,
  REOPEN_GAPS,
  WEEK_GAPS,
  type AnalyticsEvent,
  type SentHow,
} from "@/constants/config";
import type { AgeKey } from "@/constants/football";

/**
 * Counts one thing a coach did, for the usage numbers a sponsor asks for.
 * Carries a count and a label only: nothing typed on the board ever leaves the device.
 */
export function trackEvent(name: AnalyticsEvent, props?: Readonly<Record<string, string>>): void {
  if (!ANALYTICS_CONFIG.events) return;
  queueUntilLoaded();
  track(name, props);
}

type Queued = (...params: unknown[]) => void;
interface VercelQueue {
  va?: Queued;
  vaq?: unknown[][];
}

/**
 * track() drops an event sent before the analytics script has started, and a board opened on page
 * load gets there first. This is Vercel's own queue: the script replays it once it loads.
 */
function queueUntilLoaded(): void {
  const w = window as Window & VercelQueue;
  w.va ??= (...params: unknown[]) => {
    (w.vaq ??= []).push(params);
  };
}

/** The board a moment on the board belongs to: its age group, and whether it is the made-up example team. */
interface Tracked {
  readonly age: AgeKey | null;
  readonly example: boolean;
}

/**
 * Counts a moment on a coach's own board, with its age group. The example team is a demo, so nothing
 * done on it is counted.
 */
export function trackBoard(name: AnalyticsEvent, board: Tracked, props: Readonly<Record<string, string>> = {}): void {
  if (board.example) return;
  trackEvent(name, { age: board.age ?? AGE_NOT_SET, ...props });
}

/** A call-up, result or picture sent: which one, and how it went out. */
export function trackSend(name: AnalyticsEvent, board: Tracked, how: SentHow): void {
  trackBoard(name, board, { how });
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;
// 5 January 1970 was a Monday, so weeks counted from it turn over on a Monday, as matchweeks do.
const FIRST_MONDAY = new Date(1970, 0, 5);

/** Whole weeks since that Monday, from the coach's own calendar, so a week turns over at their Monday midnight. */
function weekNumber(now: Date): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = Date.UTC(FIRST_MONDAY.getFullYear(), FIRST_MONDAY.getMonth(), FIRST_MONDAY.getDate());
  return Math.floor(Math.round((today - monday) / DAY_MS) / WEEK_DAYS);
}

/** The band a gap in weeks falls in, such as "1 week". */
function weekGapLabel(weeks: number): string {
  return (WEEK_GAPS.find((g) => weeks < g.underWeeks) ?? WEEK_GAPS[WEEK_GAPS.length - 1]).label;
}

/**
 * Counts the first use of the board in a calendar week, with the weeks since it was last used, then
 * notes this week. Later uses in the same week count nothing. Only the week number is kept, on this device.
 */
function trackWeekActive(age: string): void {
  const week = weekNumber(new Date());
  const last = Number(localStorage.getItem(LAST_ACTIVE_WEEK_KEY) ?? NaN);
  if (last === week) return;
  const gap = week - last;
  const weeks = Number.isFinite(last) && gap > 0 ? weekGapLabel(gap) : FIRST_WEEK;
  trackEvent(ANALYTICS_EVENTS.weekActive, { age, weeks });
  localStorage.setItem(LAST_ACTIVE_WEEK_KEY, String(week));
}

// Once per page load, whatever remounts the board (and React runs effects twice in development).
let openCounted = false;

/** The band a gap falls in, such as "7 to 13 days". */
function gapLabel(ms: number): string {
  const days = ms / DAY_MS;
  return (REOPEN_GAPS.find((g) => days < g.underDays) ?? REOPEN_GAPS[REOPEN_GAPS.length - 1]).label;
}

/**
 * Counts a saved board opened again, with roughly how long since the last time, then notes this
 * open. The time stays on this device; only the band is sent. With nothing stored yet, as on a
 * board just made, it only notes the time.
 */
export function trackBoardOpened(age: AgeKey | null): void {
  if (!ANALYTICS_CONFIG.events || openCounted) return;
  openCounted = true;
  const now = Date.now();
  try {
    const last = Number(localStorage.getItem(LAST_OPENED_KEY));
    if (last > 0 && last <= now) trackEvent(ANALYTICS_EVENTS.boardReopened, { gap: gapLabel(now - last) });
    localStorage.setItem(LAST_OPENED_KEY, String(now));
    // Opening or starting a board is using it, so this is where a week becomes active.
    trackWeekActive(age ?? AGE_NOT_SET);
  } catch {
    // Storage blocked, as in some private windows. Nothing is counted rather than a guess.
  }
}
