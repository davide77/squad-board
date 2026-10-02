"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { HEADER } from "@/constants/content/board";
import { SITE } from "@/constants/site";
import { kitColours } from "@/lib/board/kit";
import { useBoard } from "./BoardProvider";
import { Crest } from "./Crest";
import { SendToPhone } from "./SendSquad";

const noSubscribe = () => () => {};

/**
 * Customise your club: the club's crest and the words, as a pill. On the real board it sits at the far end of
 * the site header, which is drawn outside the board, so it is portalled there. The example team, in its own
 * sheet, keeps it in the board header with `inline`.
 */
export function ClubButton({ inline = false }: { readonly inline?: boolean }) {
  const { state, act } = useBoard();
  const slot = useSyncExternalStore(
    noSubscribe,
    () => document.getElementById(SITE.headerSlotId),
    () => null,
  );

  const button = (
    <button
      type="button"
      className="club-pill is-inline-flex is-align-center has-gap-2 has-radius-pill text-base has-font-semibold"
      // The header sits outside the board, so the pill carries the club colour itself.
      style={kitColours(state.data.colour)}
      aria-label={HEADER.club}
      aria-haspopup="dialog"
      onClick={() => act({ type: "openClub" })}
    >
      <Crest className="crest--sm" team={state.data.team} badge={state.data.badge} />
      <span className="is-hidden is-sm-inline">{HEADER.club}</span>
      <span className="is-sm-hidden">{HEADER.clubShort}</span>
    </button>
  );

  if (inline) return button;
  // Open on your phone sits beside it, on a laptop or tablet: on a phone the board is already there.
  return slot
    ? createPortal(
        <>
          <SendToPhone className="is-hidden is-md-flex" />
          {button}
        </>,
        slot,
      )
    : null;
}
