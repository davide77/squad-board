"use client";

import Image from "next/image";
import { VISOR_MARK } from "@/constants/brand";
import { GAFFER_LINE } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { useBoard } from "./BoardProvider";

/**
 * The Gaffer at the top of each step, as a speech bubble: his last word, or the step's own line
 * until there is one. It takes over from the toast at every size. Not a live region: the toast,
 * kept out of sight, announces every word, so a screen reader hears it once.
 */
export function GafferLine() {
  const { state } = useBoard();
  const say = GAFFER[state.data.voice];
  const fallback = { pick: say.stepPick, match: say.stepMatch, full: say.stepFull }[state.ui.step];

  return (
    <div className="gaffer-line is-flex is-align-end has-gap-3 has-mb-4">
      <span className="gaffer-line__mark is-flex is-align-center is-justify-center is-shrink-0 has-radius-field" aria-hidden="true">
        <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.lineSize} height={VISOR_MARK.lineSize} />
      </span>
      <div className="gaffer-line__bubble is-flex is-flex-column has-gap-1 has-py-2 has-px-4">
        <span className="has-font-headline has-font-bold text-xs tracking-caps uppercase is-dim">{GAFFER_LINE.kicker}</span>
        <p className="text-lg has-font-semibold leading-snug">{state.ui.notice?.text ?? fallback}</p>
      </div>
    </div>
  );
}
