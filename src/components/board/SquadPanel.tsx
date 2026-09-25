"use client";

import { useId, useRef, type FormEvent } from "react";
import { SQUAD } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { blocked, dupeNumbers } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ControlRow, Panel } from "./Panel";
import { RosterRow } from "./RosterRow";

export function SquadPanel() {
  const { state, act } = useBoard();
  const { players } = state.data;
  const numRef = useRef<HTMLInputElement>(null);
  const numId = useId();
  const nameId = useId();

  const dupes = dupeNumbers(state.data);
  const noPosition = players.filter((p) => !p.pos.length).map((p) => p.name);
  const warnings = [
    dupes.size ? SQUAD.warnDupes([...dupes].sort((a, b) => Number(a) - Number(b))) : "",
    noPosition.length ? SQUAD.warnNoPosition(noPosition) : "",
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
      <p className="text-sm is-dimmer has-mb-3">{SQUAD.hint}</p>
      {warnings && <p className="warning text-sm is-out has-radius-field has-py-2 has-px-3 has-mb-3">{warnings}</p>}

      <ul className="roster" data-roster>
        {players.length ? (
          players.map((p, i) => <RosterRow key={p.id} player={p} index={i} dupe={!!p.num && dupes.has(p.num)} />)
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
    </Panel>
  );
}
