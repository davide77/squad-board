"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { MATCH, NO_NUMBER, SHAPE } from "@/constants/content/board";
import { BOARD_CONFIG, PHONE_QUERY } from "@/constants/config";
import { CUSTOM_FORMATION } from "@/constants/football";
import { firstName, monogram, shirtName } from "@/lib/board/names";
import { byId, coverFor, dupeNumbers, fitLevel, nudgePoint, playedMinutes, slots } from "@/lib/board/queries";
import { useMediaQuery, useNow } from "@/lib/hooks";
import type { Slot } from "@/lib/board/types";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { PitchMarkings } from "./PitchMarkings";

interface PitchSlotProps {
  readonly slot: Slot;
  /** The time the minutes are read at, shared by every shirt so one timer serves the pitch. */
  readonly now: number;
  /** Shirt numbers on more than one player, marked on the shirt so the clash shows where the coach looks. */
  readonly dupes: ReadonlySet<string>;
  /** Told which custom marker an arrow key moved, so its new role can be said. */
  readonly onNudge: (index: number) => void;
}

/** The pitch's id, for the Skip to pitch link. */
export const PITCH_ID = "pitch";

// What each arrow key does to a custom marker: across, and up the pitch towards goal.
const ARROWS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

function PitchSlot({ slot, now, dupes, onNudge }: PitchSlotProps) {
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
  // Unitless shares of the pitch: _pitch.scss turns them into container units.
  const position = { "--x": slot.x, "--y": 100 - slot.y } as CSSProperties;
  const isDrop = ui.dropTarget?.kind === "slot" && ui.dropTarget.id === slot.id;
  // On Matchday a tap picks the player coming off, and each shirt shows its minutes.
  const matchday = ui.step === "match";

  // Moving positions works from the keyboard as well as by dragging: arrows move the marker, Shift moves it further.
  const index = data.formation === CUSTOM_FORMATION ? Number(slot.id.split("#")[1]) : -1;
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const arrow = ARROWS[e.key];
    const at = data.custom[index];
    if (!ui.posMode || !arrow || !at) return;
    e.preventDefault();
    const step = e.shiftKey ? BOARD_CONFIG.markerBigStep : BOARD_CONFIG.markerStep;
    act({ type: "moveCustom", index, point: nudgePoint(at, arrow[0] * step, arrow[1] * step) });
    onNudge(index);
  }

  return (
    <button
      type="button"
      className={cx("pitch-slot is-flex is-flex-column is-align-center has-gap-1", {
        "pitch-slot--filled": !!p,
        "pitch-slot--keeper": !!p && slot.role === "GK",
        // No positions set yet is unknown, not wrong, so only a known misfit is marked.
        "pitch-slot--misfit": !!p && p.pos.length > 0 && fitLevel(p, slot.role) === 0,
        "pitch-slot--selected": matchday ? ui.offSlot === slot.id : ui.pickerSlot === slot.id || (!!p && ui.selected === p.id),
        "pitch-slot--wide": data.nameStyle === "full",
        "pitch-slot--movable": ui.posMode,
        "pitch-slot--drop": isDrop,
        "pitch-slot--clash": !!p?.num && dupes.has(p.num),
      })}
      style={position}
      data-slot={slot.id}
      data-player={p?.id}
      aria-label={p ? SHAPE.slotFilled(p.num || NO_NUMBER, shirtName(p, data.nameStyle, data.players), slot.role) : SHAPE.slotEmpty(slot.role)}
      aria-pressed={matchday && p ? ui.offSlot === slot.id : undefined}
      onClick={() => act(matchday ? { type: "selectOff", slotId: slot.id } : { type: "tapSlot", slotId: slot.id })}
      onKeyDown={onKeyDown}
    >
      <span className="pitch-slot__disc is-flex is-align-center is-justify-center has-radius-pill has-font-headline has-font-bold text-xl leading-tight is-tabular">
        {/* No shirt number yet: the player's initials, which say who it is, rather than a dash. */}
        {p ? p.num || monogram(p.name) : ""}
      </span>
      {p ? (
        <span className="pitch-slot__name text-2xs leading-snug text-center has-radius-sm">
          {shirtName(p, data.nameStyle, data.players)}
        </span>
      ) : (
        <span className="has-font-headline text-xs tracking-group is-dim">{slot.role}</span>
      )}
      {matchday && p ? (
        <span className="text-xs is-dim is-tabular">{MATCH.played(playedMinutes(data, p.id, now))}</span>
      ) : (
        cover && <span className="pitch-slot__cover text-xs is-dim is-truncate">({cover})</span>
      )}
    </button>
  );
}

/**
 * Keeps keyboard focus with the coach while a position is in play: picking who goes in, or on Matchday
 * who comes off. A position chosen from the keyboard sends focus to the first of the players to choose
 * from (`choices`), which on a wider screen sit in the list beside the pitch, far back in the tab order.
 * Once the position is filled or let go, focus comes back to it: a filled marker is a new button
 * (markers are keyed by player), so without this focus would drop to the top of the page.
 */
function useFocusFollows(picked: string | null, choices: string, onPhone: boolean) {
  const phone = useMediaQuery(PHONE_QUERY);
  const last = useRef<string | null>(null);
  useEffect(() => {
    const was = last.current;
    last.current = picked;
    if (picked && (onPhone || !phone) && document.activeElement?.matches("[data-slot]:focus-visible")) {
      // The first one showing and ready: the phone's bench tray and the wide screen's bench list are both in the page.
      const first = [...document.querySelectorAll<HTMLButtonElement>(choices)].find((b) => b.offsetParent !== null && !b.disabled);
      first?.focus();
      return;
    }
    if (picked || !was) return;
    const frame = requestAnimationFrame(() => {
      // Left alone if the coach has moved on. Otherwise focus is lost, or sits on a choice that no longer applies.
      const at = document.activeElement;
      if (at instanceof HTMLElement && at !== document.body && !at.matches(`${choices}, :disabled`)) return;
      document.querySelector<HTMLElement>(`[data-slot="${CSS.escape(was)}"]`)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [picked, phone, choices, onPhone]);
}

export function Pitch() {
  const { state } = useBoard();
  const now = useNow(state.ui.step === "match" && state.data.clock.running, BOARD_CONFIG.minutesTickMs);
  const dupes = dupeNumbers(state.data);
  const list = slots(state.data);
  const [nudged, setNudged] = useState<number | null>(null);
  const nudgedRole = state.ui.posMode && nudged !== null ? list[nudged]?.role : undefined;
  // A phone picks who goes in from a sheet that takes focus itself, so only a wider screen needs the help.
  useFocusFollows(state.ui.pickerSlot, "[data-place]", false);
  useFocusFollows(state.ui.offSlot, "[data-on]", true);
  return (
    // tabIndex -1: Skip to pitch lands here, and the next Tab goes to the first position.
    <div id={PITCH_ID} tabIndex={-1} className="pitch is-w-full has-radius-panel" data-pitch>
      <PitchMarkings />
      {/* Keyed by the player, so a player's marker glides to their spot in a new shape rather than being redrawn. */}
      {list.map((s) => (
        <PitchSlot key={state.data.xi[s.id] ?? s.id} slot={s} now={now} dupes={dupes} onNudge={setNudged} />
      ))}
      <p className="sr-only" aria-live="polite">
        {nudgedRole ? SHAPE.markerNow(nudgedRole) : ""}
      </p>
    </div>
  );
}
