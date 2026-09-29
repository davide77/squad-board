import type { CSSProperties } from "react";
import { KIT_COLOURS } from "@/constants/brand";

/** The club colour the coach picked, read by every kit token in the SCSS. */
export function kitColours(index: number) {
  const kit = KIT_COLOURS[index] ?? KIT_COLOURS[0];
  return { "--kit": kit.kit, "--kit-ink": kit.ink, "--kit-edge": kit.edge } as CSSProperties;
}
