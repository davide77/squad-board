"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { VISOR_MARK } from "@/constants/brand";
import { BOARD_CONFIG } from "@/constants/config";
import { GAFFER_LINE } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

/**
 * The Gaffer's round avatar. The ring says which gaffer the coach picked under Customise your club:
 * the logo's yellow for Hairdryer, chalk for Pat on the back.
 */
export function GafferAvatar() {
  const { state } = useBoard();
  return (
    <span
      className={cx("gaffer-avatar is-flex is-align-center is-justify-center is-shrink-0 has-radius-pill", `gaffer-avatar--${state.data.voice}`)}
      role="img"
      aria-label={GAFFER_LINE.label}
    >
      <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.lineSize} height={VISOR_MARK.lineSize} />
    </span>
  );
}

interface GafferBubbleProps {
  readonly text: string;
  /** In the bar, his line stays on one row from bp(md). On a phone, and above the pitch, it wraps. */
  readonly oneLine?: boolean;
}

/** What he says, in a bubble whose tail touches the avatar, so the two read as one person speaking. */
export function GafferBubble({ text, oneLine = false }: GafferBubbleProps) {
  return (
    <p className={cx("gaffer-bubble is-min-w-0 text-md has-font-semibold leading-snug has-py-2 has-px-3", oneLine && "gaffer-bubble--one-line")}>{text}</p>
  );
}

/**
 * His reaction to what the coach just did, for a few seconds, then nothing: once said, a line is not
 * repeated for the coach to stop reading. Each new notice brings him back.
 */
export function useGafferReaction(): { readonly id: number; readonly text: string } | null {
  const { state } = useBoard();
  const notice = state.ui.notice;
  const [quietId, setQuietId] = useState<number | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setQuietId(notice.id), BOARD_CONFIG.gafferQuietMs);
    return () => clearTimeout(timer);
  }, [notice]);

  return notice && notice.id !== quietId ? notice : null;
}

/**
 * The Gaffer above the pitch on Matchday and Full time: his last word, or the step's own line until there
 * is one. On Pick the team he speaks from the bar along the foot instead. Not a live region: the toast,
 * kept out of sight, announces every word, so a screen reader hears it once.
 */
export function GafferLine() {
  const { state } = useBoard();
  const say = GAFFER[state.data.voice];
  const fallback = { pick: say.stepPick, match: say.stepMatch, full: say.stepFull }[state.ui.step];

  return (
    <div className="is-flex is-align-end has-mb-4">
      <GafferAvatar />
      <GafferBubble key={state.ui.notice?.id} text={state.ui.notice?.text ?? fallback} />
    </div>
  );
}
