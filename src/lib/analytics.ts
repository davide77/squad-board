import { track } from "@vercel/analytics";
import { ANALYTICS_CONFIG, ANALYTICS_EVENTS, LAST_OPENED_KEY, REOPEN_GAPS, type AnalyticsEvent } from "@/constants/config";

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

const DAY_MS = 24 * 60 * 60 * 1000;

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
export function trackBoardOpened(): void {
  if (!ANALYTICS_CONFIG.events || openCounted) return;
  openCounted = true;
  const now = Date.now();
  try {
    const last = Number(localStorage.getItem(LAST_OPENED_KEY));
    if (last > 0 && last <= now) trackEvent(ANALYTICS_EVENTS.boardReopened, { gap: gapLabel(now - last) });
    localStorage.setItem(LAST_OPENED_KEY, String(now));
  } catch {
    // Storage blocked, as in some private windows. Nothing is counted rather than a guess.
  }
}
