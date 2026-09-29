"use client";

import type { CSSProperties } from "react";
import { NO_NUMBER, SHAPE } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { firstName, shirtName } from "@/lib/board/names";
import { byId, coverFor, fitLevel, slots } from "@/lib/board/queries";
import type { Slot } from "@/lib/board/types";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { PitchMarkings } from "./PitchMarkings";

interface PitchSlotProps {
  readonly slot: Slot;
}

function PitchSlot({ slot }: PitchSlotProps) {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const p = byId(data, data.xi[slot.id]);
  const cover =
    p && data.showCover
      ? coverFor(data, slot.id)
          .slice(0, BOARD_CONFIG.coverNamesShown)
          .map((c) => firstName(c.name))
          .join(" / ")
      : "";
  const position = { "--x": `${slot.x}%`, "--y": `${100 - slot.y}%` } as CSSProperties;
  const isDrop = ui.dropTarget?.kind === "slot" && ui.dropTarget.id === slot.id;

  return (
    <button
      type="button"
      className={cx("pitch-slot is-flex is-flex-column is-align-center has-gap-1", {
        "pitch-slot--filled": !!p,
        "pitch-slot--keeper": !!p && slot.role === "GK",
        // No positions set yet is unknown, not wrong, so only a known misfit is marked.
        "pitch-slot--misfit": !!p && p.pos.length > 0 && fitLevel(p, slot.role) === 0,
        "pitch-slot--selected": !!p && ui.selected === p.id,
        "pitch-slot--wide": data.nameStyle === "full",
        "pitch-slot--movable": ui.posMode,
        "pitch-slot--drop": isDrop,
      })}
      style={position}
      data-slot={slot.id}
      data-player={p?.id}
      aria-label={p ? SHAPE.slotFilled(p.num || NO_NUMBER, shirtName(p, data.nameStyle, data.players), slot.role) : SHAPE.slotEmpty(slot.role)}
      onClick={() => act({ type: "tapSlot", slotId: slot.id })}
    >
      <span className="pitch-slot__disc is-flex is-align-center is-justify-center has-radius-pill has-font-headline has-font-bold text-xl leading-tight is-tabular">
        {p ? p.num || NO_NUMBER : ""}
      </span>
      {p ? (
        <span className="pitch-slot__name text-2xs leading-snug text-center has-radius-sm">
          {shirtName(p, data.nameStyle, data.players)}
        </span>
      ) : (
        <span className="has-font-headline text-2xs tracking-group is-dim">{slot.role}</span>
      )}
      {cover && <span className="pitch-slot__cover text-2xs is-dim is-truncate">({cover})</span>}
    </button>
  );
}

export function Pitch() {
  const { state } = useBoard();
  return (
    <div className="pitch is-w-full has-radius-panel" data-pitch>
      <PitchMarkings />
      {/* Keyed by the player, so a player's marker glides to their spot in a new shape rather than being redrawn. */}
      {slots(state.data).map((s) => (
        <PitchSlot key={state.data.xi[s.id] ?? s.id} slot={s} />
      ))}
    </div>
  );
}
