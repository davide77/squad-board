"use client";

import { useId, type FormEvent } from "react";
import { GLYPHS, SAVED, SHEET, SUBS, TOASTS } from "@/constants/content/board";
import { sheetText } from "@/lib/board/sheet";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { Panel } from "./Panel";

export function SubsPanel() {
  const { state } = useBoard();
  const { subs } = state.data;
  return (
    <Panel heading={SUBS.heading} count={subs.length}>
      {subs.length ? (
        <ul className="text-base">
          {subs.map((s, i) => (
            <li key={i} className="list-rule is-flex has-gap-3 has-py-2">
              <span className="sub-minute has-font-headline has-font-semibold is-dim is-tabular">{s.min}&apos;</span>
              <span>
                {s.onName} {SUBS.for} <span className="is-dimmer">{s.offName}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base is-dimmer has-py-2">{SUBS.empty}</p>
      )}
    </Panel>
  );
}

export function SavedPanel() {
  const { state, act } = useBoard();
  const { lineups, formation } = state.data;
  const nameId = useId();

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    act({ type: "saveNamed", name: name || SAVED.defaultName(formation) });
    form.reset();
  }

  return (
    <Panel heading={SAVED.heading}>
      <div className="is-flex is-flex-column has-gap-2">
        {lineups.length ? (
          lineups.map((l, i) => (
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
          <p className="text-base is-dimmer has-py-2">{SAVED.empty}</p>
        )}
      </div>
      <form className="is-flex is-flex-wrap has-gap-2 has-mt-3" onSubmit={save}>
        <label htmlFor={nameId} className="sr-only">
          {SAVED.nameLabel}
        </label>
        <input id={nameId} name="name" className="field field--grow has-radius-field has-py-2 has-px-3" placeholder={SAVED.namePlaceholder} />
        <Button type="submit">{SAVED.save}</Button>
      </form>
    </Panel>
  );
}

/** Puts text on the clipboard, with the old textarea route where the API is missing. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.className = "sr-only";
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function SheetPanel() {
  const { state, act } = useBoard();
  async function copy() {
    const ok = await copyText(sheetText(state.data));
    act({ type: "notify", text: ok ? TOASTS.copied : TOASTS.copyFailed });
  }
  return (
    <Panel heading={SHEET.heading}>
      <p className="text-sm is-dimmer">{SHEET.hint}</p>
      <Button variant="primary" className="has-mt-3" onClick={copy}>
        {SHEET.copy}
      </Button>
    </Panel>
  );
}
