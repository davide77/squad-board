"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CONFIRM, GLYPHS, SQUAD, ZONES } from "@/constants/content/board";
import { BOARD_CONFIG, PHONE_QUERY } from "@/constants/config";
import { blocked, dupeNumbers, freeAt, slotById } from "@/lib/board/queries";
import { useMediaQuery } from "@/lib/hooks";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ControlRow, Panel } from "./Panel";
import { RosterRow } from "./RosterRow";

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
      <h3 className="has-font-headline text-sm tracking-caps uppercase is-dimmer has-mb-2">{ZONES.removed}</h3>
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
              className="removed-chip__delete is-flex is-align-center is-justify-center is-dimmer"
              aria-label={ZONES.deleteForGood(p.name)}
              aria-expanded={asking === p.id}
              onClick={() => setAsking(p.id)}
            >
              {GLYPHS.close}
            </button>
          </li>
        ))}
      </ul>
      {doomed && (
        <div role="alert" className="drawer__confirm is-flex is-flex-column has-gap-3 has-p-4 has-radius-field has-mt-3">
          <p className="text-base leading-snug">{CONFIRM.deleteForGood(doomed.name)}</p>
          <div className="is-flex has-gap-2">
            <Button
              variant="out"
              className="is-flex-1 has-py-3"
              onClick={() => {
                act({ type: "deletePlayer", id: doomed.id });
                setAsking(null);
              }}
            >
              {ZONES.deleteConfirm}
            </Button>
            <Button className="is-flex-1 has-py-3" onClick={() => setAsking(null)}>
              {ZONES.keep}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const numRef = useRef<HTMLInputElement>(null);
  const numId = useId();
  const nameId = useId();

  const dupes = dupeNumbers(state.data);
  const noPosition = players.filter((p) => !p.pos.length).map((p) => p.name);
  // A freshly pasted squad often has no positions at all. That is a next step, not a
  // fault, so past a few names it becomes a quiet hint rather than a list in red.
  const manyNoPosition = noPosition.length > BOARD_CONFIG.noPositionNamesMax;
  const warnings = [
    dupes.size ? SQUAD.warnDupes([...dupes].sort((a, b) => Number(a) - Number(b))) : "",
    noPosition.length && !manyNoPosition ? SQUAD.warnNoPosition(noPosition) : "",
  ]
    .filter(Boolean)
    .join(" ");

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
    <Panel heading={SQUAD.heading} count={SQUAD.count(players.length)}>
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

      <ControlRow className="has-mt-0 has-mb-3">
        <span className="has-font-headline text-xs tracking-caps uppercase is-dimmer">
          {SQUAD.pickedCount(picked, players.length, injured, away)}
        </span>
        <Button size="tiny" variant="quiet" onClick={() => act({ type: "toggleCallUps" })}>
          {anyOut ? SQUAD.callUpEveryone : SQUAD.clearCallUps}
        </Button>
        <Button size="tiny" variant="quiet" onClick={() => act({ type: "sortByNumber" })}>
          {SQUAD.sortByNumber}
        </Button>
      </ControlRow>
      <p className="text-sm is-dimmer has-mb-3" aria-live="polite">
        {slot ? SQUAD.placeHint(slot.role) : SQUAD.hint}
      </p>
      {manyNoPosition && <p className="text-sm is-dim has-mb-3">{SQUAD.noPositionCount(noPosition.length)}</p>}
      {warnings && <p className="warning text-sm is-out has-radius-field has-py-2 has-px-3 has-mb-3">{warnings}</p>}

      <ul className="roster" data-roster>
        {players.length ? (
          shown.map((p) => (
            <RosterRow
              key={p.id}
              player={p}
              index={players.indexOf(p)}
              dupe={!!p.num && dupes.has(p.num)}
              place={slot && fits.has(p.id) ? { role: slot.role, fit: fits.get(p.id) ?? 0 } : undefined}
            />
          ))
        ) : (
          <li className="text-base is-dimmer has-py-2">{SQUAD.empty}</li>
        )}
      </ul>

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
    </Panel>
  );
}
