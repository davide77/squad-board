import type { CSSProperties } from "react";
import { KIT_COLOURS, STRIP_COLOURS, type StripColour } from "@/constants/brand";
import { KIT } from "@/constants/content/board";
import { KIT_PATTERNS } from "@/constants/football";
import type { Kit, KitSide } from "./types";

/** The club colour the coach picked, read by every kit token in the SCSS. */
export function kitColours(index: number) {
  const kit = KIT_COLOURS[index] ?? KIT_COLOURS[0];
  return { "--kit": kit.kit, "--kit-ink": kit.ink, "--kit-edge": kit.edge } as CSSProperties;
}

export function isStripColour(v: unknown): v is StripColour {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(STRIP_COLOURS, v);
}

/** A KIT_COLOURS entry as a strip colour. Every one of them has a match, by name. */
export function stripOf(index: number): StripColour {
  const name = (KIT_COLOURS[index] ?? KIT_COLOURS[0]).name.toLowerCase();
  return isStripColour(name) ? name : "yellow";
}

/**
 * A new board's strips. Home is the club colour with black shorts; away is white with black shorts,
 * the change strip most clubs have. The coach changes either under Customise your club.
 */
export function defaultKits(home: StripColour): Record<KitSide, Kit> {
  return {
    home: { shirt: home, pattern: "plain", second: home === "white" ? "black" : "white", shorts: "black", socks: home },
    away: { shirt: "white", pattern: "plain", second: "black", shorts: "black", socks: "white" },
  };
}

/** Reads a saved kit, falling back part by part so a damaged file still opens. */
export function readKit(raw: unknown, fallback: Kit): Kit {
  if (typeof raw !== "object" || raw === null) return fallback;
  const r = raw as Record<string, unknown>;
  const pick = (v: unknown, or: StripColour) => (isStripColour(v) ? v : or);
  return {
    shirt: pick(r.shirt, fallback.shirt),
    pattern: KIT_PATTERNS.find((p) => p.key === r.pattern)?.key ?? fallback.pattern,
    second: pick(r.second, fallback.second),
    shorts: pick(r.shorts, fallback.shorts),
    socks: pick(r.socks, fallback.socks),
  };
}

const word = (c: StripColour) => STRIP_COLOURS[c].name.toLowerCase();

/** "black and yellow stripes, black shorts, black socks": the kit as the call-up says it. */
export function kitWords(kit: Kit): string {
  const shirt =
    kit.pattern === "plain" || kit.second === kit.shirt
      ? KIT.shirtWords.plain(word(kit.shirt))
      : KIT.shirtWords[kit.pattern](word(kit.shirt), word(kit.second));
  return [shirt, KIT.shortsWords(word(kit.shorts)), KIT.socksWords(word(kit.socks))].join(KIT.join);
}
