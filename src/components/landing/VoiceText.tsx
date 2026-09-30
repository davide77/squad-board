"use client";

import type { VoiceCopy } from "@/constants/content/landing";
import { AGE_GROUPS, FORMATS } from "@/constants/football";
import { BoardCta } from "../BoardCta";
import { useLanding } from "./LandingProvider";

type TextKey = { [K in keyof VoiceCopy]: VoiceCopy[K] extends string ? K : never }[keyof VoiceCopy];

interface VoiceTextProps {
  readonly k: TextKey;
}

/** One line of copy in the voice picked in the hero, so a section can stay a Server Component. */
export function VoiceText({ k }: VoiceTextProps) {
  return useLanding().copy[k];
}

type CtaSize = "small" | "regular" | "large";

const CTA_SIZES: Record<CtaSize, string> = {
  small: "has-py-2 has-px-4 text-md",
  regular: "has-py-4 has-px-6 text-lg",
  large: "has-py-5 has-px-7 text-xl",
};

interface VoiceCtaProps {
  readonly size?: CtaSize;
}

/** The link to the board. Once an age is picked it names the format that board will open on. */
export function VoiceCta({ size = "regular" }: VoiceCtaProps) {
  const { age } = useLanding();
  const group = AGE_GROUPS.find((a) => a.key === age);
  return <BoardCta className={CTA_SIZES[size]} format={group && FORMATS[group.format].label} />;
}
