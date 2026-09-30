import { track } from "@vercel/analytics";
import {
  ANALYTICS_CONFIG,
  ANALYTICS_EVENTS,
  DAYS_SINCE,
  LAST_VISIT_KEY,
  NEXT_WEEK_DAYS,
  type AnalyticsEvent,
} from "@/constants/config";

/**
 * Counts one thing a coach did, for the usage numbers a sponsor asks for.
 * Carries a count and a label only: nothing typed on the board ever leaves the device.
 */
export function trackEvent(name: AnalyticsEvent, props?: Readonly<Record<string, string>>): void {
  if (ANALYTICS_CONFIG.events) track(name, props);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days since 1 January 1970, in the coach's own time zone, so a day turns over at their midnight. */
function dayNumber(now: Date): number {
  return Math.round(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / DAY_MS);
}

/**
 * Counts a saved board being opened again, with a rough gap since it was last open.
 * The day number of the last visit is the only thing kept, and only on this device.
 */
export function trackBoardOpened(): void {
  if (!ANALYTICS_CONFIG.events) return;
  const today = dayNumber(new Date());
  try {
    const last = Number(localStorage.getItem(LAST_VISIT_KEY));
    if (last > 0 && last <= today) {
      const gap = today - last;
      const since = gap === 0 ? DAYS_SINCE.sameDay : gap < NEXT_WEEK_DAYS ? DAYS_SINCE.thisWeek : DAYS_SINCE.nextWeek;
      trackEvent(ANALYTICS_EVENTS.boardReopened, { days: since });
    }
    localStorage.setItem(LAST_VISIT_KEY, String(today));
  } catch {
    // Storage blocked, as in some private windows. Nothing is counted rather than a guess.
  }
}
