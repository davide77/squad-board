"use client";

import type { KeyboardEvent } from "react";
import { GLYPHS, NO_NUMBER, SQUAD } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { blocked, playedMinutes, positionCodes, reasonOf, started, where } from "@/lib/board/queries";
import { useNow } from "@/lib/hooks";
import type { Player } from "@/lib/board/types";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

interface RosterRowProps {
  readonly player: Player;
  readonly index: number;
  readonly dupe: boolean;
}

export function RosterRow({ player: p, index, dupe }: RosterRowProps) {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const status = reasonOf(p) ?? where(data, p.id);
  const isBlocked = blocked(p);
  const now = useNow(data.clock.running, BOARD_CONFIG.minutesTickMs);
  const minutes = started(data) && !p.out ? SQUAD.minutes(playedMinutes(data, p.id, now)) : "";

  function onGripKey(e: KeyboardEvent) {
    const step = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
    if (!step) return;
    e.preventDefault();
    const to = index + step;
    if (to >= 0 && to < data.players.length) act({ type: "reorder", id: p.id, to });
  }

  return (
    <li
      data-pid={p.id}
      className={cx("roster-row is-flex is-align-center has-gap-2 has-py-2", `roster-row--${isBlocked || p.out ? "out" : status}`, {
        "roster-row--dragging": ui.draggingRow === p.id,
      })}
    >
      <button
        type="button"
        className="roster-row__grip text-md text-center is-dimmer"
        data-grip={p.id}
        aria-label={SQUAD.reorder(p.name)}
        onKeyDown={onGripKey}
      >
        {GLYPHS.grip}
      </button>
      <label className="roster-row__pick-hit is-shrink-0">
        <input
          type="checkbox"
          className="roster-row__pick is-flex is-align-center is-justify-center has-radius-sm"
          checked={!p.out}
          disabled={isBlocked}
          aria-label={SQUAD.calledUp(p.name)}
          onChange={(e) => act({ type: "setCalledUp", id: p.id, called: e.target.checked })}
        />
      </label>
      <input
        className={cx(
          "roster-row__num has-font-headline has-font-bold text-lg text-center is-tabular has-radius-sm is-shrink-0",
          dupe && "roster-row__num--dupe",
        )}
        value={p.num}
        placeholder={NO_NUMBER}
        inputMode="numeric"
        maxLength={BOARD_CONFIG.shirtNumberMaxLength}
        aria-label={SQUAD.shirtFor(p.name)}
        onChange={(e) => act({ type: "setNumber", id: p.id, value: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      <span className="is-flex-1 is-min-w-0">
        <b className="roster-row__name is-block has-font-medium is-truncate">{p.name}</b>
        <span className="has-font-headline text-xs tracking-tag is-dimmer">
          {[p.pos.length ? positionCodes(p).join(" · ") : SQUAD.noPosition, minutes].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span
        className={cx(
          "status-pill has-font-headline text-2xs tracking-heading text-center has-radius-pill has-px-2 is-shrink-0",
          `status-pill--${status}`,
        )}
      >
        {SQUAD.status[status]}
      </span>
      <button
        type="button"
        className="roster-row__edit text-md is-dimmer"
        aria-label={SQUAD.editLabel(p.name)}
        aria-haspopup="dialog"
        onClick={() => act({ type: "toggleEdit", id: p.id })}
      >
        {SQUAD.edit}
      </button>
    </li>
  );
}
