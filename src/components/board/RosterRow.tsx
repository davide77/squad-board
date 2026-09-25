"use client";

import type { KeyboardEvent } from "react";
import { GLYPHS, NO_NUMBER, SQUAD } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { POSITIONS } from "@/constants/football";
import { blocked, reasonOf, where } from "@/lib/board/queries";
import type { Player } from "@/lib/board/types";
import { Button } from "../Button";
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

  function onGripKey(e: KeyboardEvent) {
    const step = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
    if (!step) return;
    e.preventDefault();
    const to = index + step;
    if (to >= 0 && to < data.players.length) act({ type: "reorder", id: p.id, to });
  }

  return (
    <>
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
        <input
          type="checkbox"
          className="roster-row__pick is-flex is-align-center is-justify-center is-shrink-0 has-radius-sm"
          checked={!p.out}
          disabled={isBlocked}
          aria-label={SQUAD.calledUp(p.name)}
          onChange={(e) => act({ type: "setCalledUp", id: p.id, called: e.target.checked })}
        />
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
            {p.pos.length ? p.pos.join(" · ") : SQUAD.noPosition}
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
          aria-expanded={ui.editing === p.id}
          onClick={() => act({ type: "toggleEdit", id: p.id })}
        >
          {SQUAD.edit}
        </button>
      </li>
      {ui.editing === p.id && <PlayerEditor player={p} />}
    </>
  );
}

interface PlayerEditorProps {
  readonly player: Player;
}

function PlayerEditor({ player: p }: PlayerEditorProps) {
  const { act } = useBoard();
  return (
    <li className="roster-editor has-pt-1 has-pb-4">
      <p className="text-sm is-dim has-mb-2">{SQUAD.positionsLabel}</p>
      <div className="is-flex is-flex-wrap has-gap-2 has-mb-3">
        {POSITIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            className="position-toggle has-font-headline text-base tracking-tag has-radius-pill has-px-3 has-py-1"
            aria-pressed={p.pos.includes(o.key)}
            title={o.label}
            onClick={() => act({ type: "togglePos", pos: o.key })}
          >
            {o.key}
          </button>
        ))}
      </div>
      <p className="text-sm is-dim has-mb-2">{SQUAD.shirtLabelHint}</p>
      <input
        className="field roster-editor__label has-radius-field has-py-2 has-px-3 has-mb-3"
        value={p.init}
        placeholder={SQUAD.shirtLabelPlaceholder}
        maxLength={BOARD_CONFIG.shirtLabelMaxLength}
        aria-label={SQUAD.shirtLabelPlaceholder}
        onChange={(e) => act({ type: "setShirtLabel", id: p.id, value: e.target.value })}
      />
      <div className="is-flex is-flex-wrap has-gap-2">
        <Button size="tiny" onClick={() => act({ type: "toggleInjured", id: p.id })}>
          {p.inj ? SQUAD.markFit : SQUAD.markInjured}
        </Button>
        <Button size="tiny" onClick={() => act({ type: "toggleUnavailable", id: p.id })}>
          {p.una ? SQUAD.markAvailable : SQUAD.markUnavailable}
        </Button>
        <Button size="tiny" variant="quiet" onClick={() => act({ type: "removePlayer", id: p.id })}>
          {SQUAD.remove}
        </Button>
        <Button size="tiny" onClick={() => act({ type: "editDone" })}>
          {SQUAD.done}
        </Button>
      </div>
    </li>
  );
}
