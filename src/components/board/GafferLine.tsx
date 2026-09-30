"use client";

import Image from "next/image";
import { VISOR_MARK } from "@/constants/brand";
import { GAFFER_LINE } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { useBoard } from "./BoardProvider";

/**
 * The Gaffer at the top of each step: his last word, or the step's own line until there is one.
 * From md up it takes over from the toast. A phone keeps the toast instead, which shows wherever the
 * coach has scrolled to, and keeps the pitch high on a small screen. Not a live region: the toast
 * announces every word at every size, so a screen reader hears it once.
 */
export function GafferLine() {
  const { state } = useBoard();
  const say = GAFFER[state.data.voice];
  const fallback = { pick: say.stepPick, match: say.stepMatch, full: say.stepFull }[state.ui.step];

  return (
    <div className="gaffer-line is-hidden is-md-flex is-align-center has-gap-3 has-mb-4">
      <span className="gaffer-line__mark is-flex is-align-center is-justify-center is-shrink-0 has-radius-field" aria-hidden="true">
        <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.lineSize} height={VISOR_MARK.lineSize} />
      </span>
      <span className="has-font-headline has-font-bold text-sm tracking-caps uppercase is-kit is-shrink-0">{GAFFER_LINE.kicker}</span>
      <p className="text-xl has-font-semibold leading-snug">{state.ui.notice?.text ?? fallback}</p>
    </div>
  );
}
