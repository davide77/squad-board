"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CONFIRM, SET_POSITIONS, SQUAD, ZONES } from "@/constants/content/board";
import { BOARD_CONFIG, PHONE_QUERY } from "@/constants/config";
import { GAFFER } from "@/constants/content/gaffer";
import { blocked, freeAt, slotById, squadChecks, where } from "@/lib/board/queries";
import type { Player } from "@/lib/board/types";
import { useMediaQuery } from "@/lib/hooks";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { cx } from "../cx";
import { ConfirmBox } from "./ConfirmBox";
import { SetPositionsSheet } from "./SetPositionsSheet";
import { RosterRow } from "./RosterRow";
import { Icon } from "../Icon";

/**
 * Players taken out of the squad, under the list: a tap brings each one back, and the cross deletes
 * them for good, after a check, for a name that should not stay on this device.
 */
function RemovedList() {
  const { state, act } = useBoard();
  const { removed } = state.data;
  // The one player being asked about, in place, before they are deleted for good.
  const [asking, setAsking] = useState<string | null>(null);
  if (!removed.length) return null;
  const doomed = removed.find((p) => p.id === asking);
  return (
    <div className="has-mt-5">
      <h3 className="has-font-headline text-sm tracking-caps uppercase is-dim has-mb-2">{ZONES.removed}</h3>
      <ul className="is-flex is-flex-wrap has-gap-2">
        {removed.map((p) => (
          <li key={p.id} className="removed-chip is-flex is-align-center has-radius-field">
            <button
              type="button"
              className="removed-chip__back is-flex is-align-center has-gap-2 has-px-3 text-base"
              aria-label={ZONES.restore(p.name)}
              onClick={() => act({ type: "restorePlayer", id: p.id })}
            >
              <span className="is-dim">{p.name}</span>
              <span className="has-font-semibold is-kit">{ZONES.bringBack}</span>
            </button>
            <button
              type="button"
              className="removed-chip__delete is-flex is-align-center is-justify-center is-dim"
              aria-label={ZONES.deleteForGood(p.name)}
              aria-expanded={asking === p.id}
              onClick={() => setAsking(p.id)}
            >
              <Icon name="close" size="small" />
            </button>
          </li>
        ))}
      </ul>
      {doomed && (
        <ConfirmBox
          className="has-mt-3"
          text={CONFIRM.deleteForGood(doomed.name)}
          yes={ZONES.deleteConfirm}
          keep={ZONES.keep}
          onYes={() => {
            act({ type: "deletePlayer", id: doomed.id });
            setAsking(null);
          }}
          onKeep={() => setAsking(null)}
        />
      )}
    </div>
  );
}

// A player dragged off the pitch onto the Bench group goes to the bench; onto Rest of squad, off the team.
const DROP_ZONE: Readonly<Record<string, "bench" | "pool" | undefined>> = { bench: "bench", rest: "pool" };

export function SquadPanel() {
  const { state, act } = useBoard();
  const { players } = state.data;
  // A position picked on the pitch, on a screen wide enough to pick from this list.
  const phone = useMediaQuery(PHONE_QUERY);
  const slot = !phone && state.ui.pickerSlot ? slotById(state.data, state.ui.pickerSlot) : null;
  const fits = new Map<string, 0 | 1 | 2>();
  if (slot) for (const level of [2, 1, 0] as const) for (const p of freeAt(state.data, slot.role, level)) fits.set(p.id, level);
  // Who can go there comes first, best fit at the top; everyone else keeps their place below.
  const shown = slot ? [...players.filter((p) => fits.has(p.id)).sort((a, b) => (fits.get(b.id) ?? 0) - (fits.get(a.id) ?? 0)), ...players.filter((p) => !fits.has(p.id))] : players;
  // Starting, then the bench, then the rest, each in squad order. While a position is picked the
  // list is one run, sorted by who fits.
  const groups = slot
    ? [{ key: "fit", label: "", rows: shown }]
    : SQUAD.groups.map((g) => ({ ...g, rows: players.filter((p) => groupOf(p) === g.key) }));
  function groupOf(p: Player) {
    const at = where(state.data, p.id);
    return p.out || at === "pool" ? "rest" : at;
  }
  const numRef = useRef<HTMLInputElement>(null);
  const numId = useId();
  const nameId = useId();
  const headingId = useId();

  const { dupes: dupeList, noPosition } = squadChecks(state.data);
  const dupes = new Set(dupeList);
  // Who to work through in Set positions, fixed as it opens.
  const [positioning, setPositioning] = useState<readonly string[] | null>(null);

  const picked = players.filter((p) => !p.out).length;
  const injured = players.filter((p) => p.inj).length;
  const away = players.filter((p) => p.una).length;
  const anyOut = players.some((p) => p.out && !blocked(p));

  function addPlayer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get("name") ?? "").trim();
    if (!name) {
      form.querySelector<HTMLInputElement>("[name=name]")?.focus();
      return;
    }
    act({ type: "addPlayer", id: crypto.randomUUID(), num: String(fields.get("num") ?? ""), name });
    form.reset();
    numRef.current?.focus();
  }

  return (
    <section className="panel has-pt-3" aria-labelledby={headingId}>
      <div className="is-flex is-align-center is-justify-between has-gap-3 has-mb-3">
        <div className="is-min-w-0">
          <h2 id={headingId} className="text-xl tracking-heading">
            {SQUAD.heading}
          </h2>
          <p className="text-sm is-dim">{SQUAD.pickedCount(picked, players.length, injured, away)}</p>
        </div>
        <Button className="is-shrink-0 has-py-3" onClick={() => act({ type: "toggleCallUps" })}>
          {anyOut ? SQUAD.callUpEveryone : SQUAD.clearCallUps}
        </Button>
      </div>
      {players.length <= BOARD_CONFIG.startCardUntil && (
        <div className="start-card has-radius-panel has-p-4 has-mb-3">
          <h3 className="text-lg tracking-tag has-mb-2">{SQUAD.startTitle}</h3>
          <ol className="start-card__steps text-base leading-relaxed is-dim has-pl-5">
            {SQUAD.startSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Only while a position is picked on the pitch: then the list is sorted by who fits it. */}
      <p className="text-sm is-dim" aria-live="polite">
        {slot && <span className="is-block has-mb-3">{SQUAD.placeHint(slot.role)}</span>}
      </p>
      {/* One note for everyone without a position, instead of a "no position" on every row. */}
      {noPosition.length > 0 && (
        <div className="position-note is-flex is-flex-wrap is-align-center is-justify-between has-gap-2 has-radius-field has-py-2 has-px-3 has-mb-3">
          <span className="text-base">{SET_POSITIONS.note(noPosition.length)}</span>
          <Button variant="chalk" onClick={() => setPositioning(noPosition.map((p) => p.id))}>
            {SET_POSITIONS.open}
          </Button>
        </div>
      )}
      {dupeList.length > 0 && (
        <p className="warning text-sm is-out has-radius-field has-py-2 has-px-3 has-mb-3">{SQUAD.warnDupes(dupeList)}</p>
      )}

      {players.length ? (
        groups
          // The bench shows even when empty: it is where a player dragged off the pitch goes.
          .filter((g) => g.rows.length || g.key === "bench")
          .map((g) => (
            <section
              key={g.key}
              aria-label={g.label || undefined}
              data-zone={DROP_ZONE[g.key]}
              className={cx(DROP_ZONE[g.key] && state.ui.dropTarget?.kind === DROP_ZONE[g.key] && "roster-group--drop")}
            >
              {g.label && (
                <h3 className="roster-divider is-flex is-align-center has-gap-2 has-font-headline text-xs tracking-caps uppercase is-dim has-pt-3 has-pb-1">
                  {g.label}
                  <span className="is-tabular">{g.rows.length}</span>
                </h3>
              )}
              {!g.rows.length && <p className="text-base is-dim has-py-2">{GAFFER[state.data.voice].benchEmpty}</p>}
              {/* Each group is its own list, so a dragged row stays in its group. */}
              <ul className="roster" data-roster>
                {g.rows.map((p, i) => (
                  <RosterRow
                    key={p.id}
                    player={p}
                    moves={{
                      up: i > 0 ? players.indexOf(g.rows[i - 1]) : null,
                      down: i < g.rows.length - 1 ? players.indexOf(g.rows[i + 1]) : null,
                    }}
                    dupe={!!p.num && dupes.has(p.num)}
                    place={slot && fits.has(p.id) ? { role: slot.role, fit: fits.get(p.id) ?? 0 } : undefined}
                    grouped={!!g.label}
                  />
                ))}
              </ul>
            </section>
          ))
      ) : (
        <ul className="roster">
          <li className="text-base is-dim has-py-2">{SQUAD.empty}</li>
        </ul>
      )}

      <form className="is-flex is-flex-wrap has-gap-2 has-mt-3" onSubmit={addPlayer}>
        <label htmlFor={numId} className="sr-only">
          {SQUAD.addNumberLabel}
        </label>
        <input
          ref={numRef}
          id={numId}
          name="num"
          className="field field--number text-center is-tabular has-radius-field has-py-2 has-px-3"
          placeholder={SQUAD.addNumberPlaceholder}
          inputMode="numeric"
          maxLength={BOARD_CONFIG.shirtNumberMaxLength}
        />
        <label htmlFor={nameId} className="sr-only">
          {SQUAD.addNameLabel}
        </label>
        <input
          id={nameId}
          name="name"
          className="field field--grow has-radius-field has-py-2 has-px-3"
          placeholder={SQUAD.addNamePlaceholder}
          autoComplete="off"
        />
        <Button type="submit" variant="primary">
          {SQUAD.add}
        </Button>
      </form>
      <RemovedList />
      <SetPositionsSheet open={positioning !== null} ids={positioning ?? []} close={() => setPositioning(null)} />
    </section>
  );
}
