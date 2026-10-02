"use client";

import { useId, type FormEvent } from "react";
import { GLYPHS, SAVED } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { fitsFormat } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";

/** The saved plans, under the strongest side in the Line-ups menu. */
export function SavedLineups() {
  const { state, act } = useBoard();
  const { lineups, formation } = state.data;
  // Plans made for another format stay saved, and come back if the format does.
  const mine = lineups.map((l, i) => ({ l, i })).filter(({ l }) => fitsFormat(l, state.data));
  const nameId = useId();

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    act({ type: "saveNamed", name: name || SAVED.defaultName(formation) });
    form.reset();
  }

  return (
    <>
      <div className="is-flex is-flex-column has-gap-2">
        {mine.length ? (
          mine.map(({ l, i }) => (
            <div key={`${l.name}-${i}`} className="is-flex is-align-center has-gap-2">
              <span className="is-flex-1 is-min-w-0 is-truncate">{l.name}</span>
              <span className="has-font-headline text-sm is-dimmer">{l.formation}</span>
              <Button size="tiny" onClick={() => act({ type: "loadNamed", index: i })}>
                {SAVED.load}
              </Button>
              <Button size="tiny" variant="quiet" aria-label={SAVED.delete(l.name)} onClick={() => act({ type: "deleteNamed", index: i })}>
                {GLYPHS.close}
              </Button>
            </div>
          ))
        ) : (
          <p className="text-base is-dimmer has-py-2">{GAFFER[state.data.voice].savedEmpty}</p>
        )}
      </div>
      <form className="is-flex is-flex-wrap has-gap-2 has-mt-3" onSubmit={save}>
        <label htmlFor={nameId} className="sr-only">
          {SAVED.nameLabel}
        </label>
        <input
          id={nameId}
          name="name"
          className="field field--grow has-radius-field has-py-2 has-px-3"
          placeholder={SAVED.namePlaceholder}
        />
        <Button type="submit">{SAVED.save}</Button>
      </form>
    </>
  );
}
