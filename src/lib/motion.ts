import { MOTION } from "@/constants/motion";

/**
 * How much further something thrown at `velocity` (px/s) travels before it comes to rest, slowing at
 * `rate` per millisecond. Apple's projection: what a flick is heading for, not where the finger let go.
 */
export function project(velocity: number, rate: number = MOTION.deceleration): number {
  return ((velocity / 1000) * rate) / (1 - rate);
}

interface Sample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

/** A pointer's speed in px/s over the recent samples, oldest first. Still, it is zero. */
export function velocityOf(samples: readonly Sample[]): { readonly x: number; readonly y: number } {
  const first = samples[0];
  const last = samples.at(-1);
  if (!first || !last || last.t <= first.t) return { x: 0, y: 0 };
  const seconds = (last.t - first.t) / 1000;
  return { x: (last.x - first.x) / seconds, y: (last.y - first.y) / seconds };
}
