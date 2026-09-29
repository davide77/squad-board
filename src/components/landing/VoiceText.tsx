"use client";

import Link from "next/link";
import type { VoiceCopy } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { cx } from "../cx";
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

/** The link to the board, labelled in the picked voice. */
export function VoiceCta({ size = "regular" }: VoiceCtaProps) {
  return (
    <Link
      href={ROUTES.board}
      className={cx(
        "button button--primary is-inline-flex is-align-center has-font-bold has-radius-field",
        CTA_SIZES[size],
      )}
    >
      <VoiceText k="cta" />
    </Link>
  );
}
