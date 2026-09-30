import { LANDING_CONFIG } from "@/constants/config";
import {
  DEMO_BENCH,
  DEMO_XI,
  SAY,
  SHEET_SECTION,
  type DemoEvent,
  type DemoPlayer,
  type DemoShape,
  type VoiceKey,
} from "@/constants/content/landing";

export interface DemoSub {
  readonly min: number;
  readonly on: string;
  readonly off: string;
}

export interface DemoState {
  readonly xi: readonly DemoPlayer[];
  readonly bench: readonly DemoPlayer[];
  readonly subs: readonly DemoSub[];
  readonly injured: readonly string[];
  readonly shape: DemoShape;
  /** Index into `xi` of the tapped player. */
  readonly sel: number | null;
  readonly ev: DemoEvent;
  readonly minute: number;
}

export type DemoAction =
  | { readonly type: "tap"; readonly index: number }
  | { readonly type: "clear" }
  | { readonly type: "change"; readonly kind: "sub" | "injury" }
  | { readonly type: "shape"; readonly shape: DemoShape }
  | { readonly type: "copied" }
  | { readonly type: "reset" };

export const DEMO_START: DemoState = {
  xi: DEMO_XI,
  bench: DEMO_BENCH,
  subs: [],
  injured: [],
  shape: "4-2-3-1",
  sel: null,
  ev: { t: "idle" },
  minute: 0,
};

function nextMinute(s: DemoState): number {
  const c = LANDING_CONFIG;
  return Math.min(
    c.fullTimeMinute,
    (s.minute || c.halfTimeMinute) + c.minutesPerChange + s.subs.length * c.extraMinutesPerSub,
  );
}

export function demoReducer(s: DemoState, a: DemoAction): DemoState {
  switch (a.type) {
    case "tap":
      return s.sel === a.index
        ? { ...s, sel: null, ev: { t: "idle" } }
        : { ...s, sel: a.index, ev: { t: "select", a: s.xi[a.index].name } };
    case "clear":
      return { ...s, sel: null, ev: { t: "idle" } };
    case "change": {
      const on = s.bench[0];
      if (s.sel === null || !on) return s;
      const off = s.xi[s.sel];
      const minute = nextMinute(s);
      const bench = s.bench.slice(1);
      return {
        ...s,
        xi: s.xi.map((p, i) => (i === s.sel ? on : p)),
        bench,
        subs: [...s.subs, { min: minute, on: on.name, off: off.name }],
        injured: a.kind === "injury" ? [...s.injured, off.name] : s.injured,
        minute,
        sel: null,
        ev: bench.length ? { t: a.kind, a: off.name, b: on.name } : { t: "empty" },
      };
    }
    case "shape":
      return { ...s, shape: a.shape, sel: null, ev: { t: "shape", a: a.shape } };
    case "copied":
      return { ...s, ev: { t: "copied" } };
    case "reset":
      return DEMO_START;
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => `${w.charAt(0)}.`)
    .join("");
}

/** The plain text team sheet for the demo. Always straight, whatever the voice. */
/**
 * The message the demo board sends: who's in, by shirt number, the way the real board's call-up
 * reads. Never the shape, the bench or who is injured: those stay with the coach.
 */
export function demoSheet(s: DemoState, useInitials: boolean): string {
  const nm = (n: string) => (useInitials ? initials(n) : n);
  const squad = [...s.xi, ...s.bench].sort((a, b) => a.num - b.num);
  return [SHEET_SECTION.title, "", SHEET_SECTION.squad, ...squad.map((p) => `${p.num} ${nm(p.name)}`)].join("\n");
}

/** The Gaffer's line for what just happened, in the picked voice. */
export function sayLine(voice: VoiceKey, ev: DemoEvent): string {
  const s = SAY[voice];
  switch (ev.t) {
    case "select":
      return s.select(ev);
    case "shape":
      return s.shape(ev);
    case "sub":
      return s.sub(ev);
    case "injury":
      return s.injury(ev);
    default:
      return s[ev.t]();
  }
}
