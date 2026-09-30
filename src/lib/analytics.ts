import { track } from "@vercel/analytics";
import { ANALYTICS_CONFIG, type AnalyticsEvent } from "@/constants/config";

/**
 * Counts one thing a coach did, for the usage numbers a sponsor asks for.
 * Carries a count and a label only: nothing typed on the board ever leaves the device.
 */
export function trackEvent(name: AnalyticsEvent, props?: Readonly<Record<string, string>>): void {
  if (ANALYTICS_CONFIG.events) track(name, props);
}
