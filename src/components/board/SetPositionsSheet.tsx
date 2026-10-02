"use client";

import { useState } from "react";
import { DRAWER, SET_POSITIONS } from "@/constants/content/board";
import { POSITIONS } from "@/constants/football";
import { byId } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { SideSheet } from "./SideSheet";

interface SetPositionsProps {
  /** The players to work through, fixed as the sheet opens, so one does not vanish at their first chip. */
  readonly ids: readonly string[];
  readonly close: () => void;
}

/** One player at a time: their name, the position chips, and on to the next. */
function Steps({ ids, close }: SetPositionsProps) {
  const { state, act } = useBoard();
  const [at, setAt] = useState(0);
  const p = byId(state.data, ids[at]);
  if (!p) return null;
  const last = at === ids.length - 1;

  return (
    <>
      <section className="is-flex is-flex-column has-gap-3">
        <p className="has-font-headline text-sm tracking-caps uppercase is-dim">{SET_POSITIONS.progress(at + 1, ids.length)}</p>
        <h3 className="is-flex is-align-baseline has-gap-3 text-2xl is-chalk">
          {p.num && <span className="is-tabular is-dim">{p.num}</span>}
          <span className="is-min-w-0 is-truncate">{p.name}</span>
        </h3>
        <p className="text-base is-dim">{DRAWER.positionsHint}</p>
        <div className="drawer__positions is-grid has-gap-2">
          {POSITIONS.map((o) => {
            const on = p.pos.includes(o.key);
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={on}
                className="drawer-option drawer-option--position is-grid is-align-center has-gap-2 has-px-3 has-radius-field text-left"
                onClick={() => act({ type: "togglePlayerPos", id: p.id, pos: o.key })}
              >
                <span className="has-font-headline has-font-bold text-xl">{o.key}</span>
                <span className="text-sm leading-snug">{o.label}</span>
                {p.pos[0] === o.key && <span className="has-font-headline has-font-bold text-xs tracking-caps uppercase">{DRAWER.main}</span>}
              </button>
            );
          })}
        </div>
      </section>
      <div className="drawer__foot is-flex has-gap-2">
        {at > 0 && (
          <Button className="has-py-3 has-px-5" onClick={() => setAt(at - 1)}>
            {SET_POSITIONS.back}
          </Button>
        )}
        <Button variant="primary" className="is-flex-1 has-py-3" onClick={() => (last ? close() : setAt(at + 1))}>
          {last ? SET_POSITIONS.done : SET_POSITIONS.next}
        </Button>
      </div>
    </>
  );
}

/**
 * Set positions, opened from the note above the squad. A pasted squad has no positions, and until it does
 * the board cannot say who fits where, so this works through them in one go rather than one drawer each.
 */
export function SetPositionsSheet({ ids, close, open }: SetPositionsProps & { readonly open: boolean }) {
  return (
    <SideSheet open={open} onClose={close} title={SET_POSITIONS.heading} closeLabel={SET_POSITIONS.close}>
      <Steps ids={ids} close={close} />
    </SideSheet>
  );
}
