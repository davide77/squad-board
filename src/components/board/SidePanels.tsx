"use client";

import { useId, useState, type FormEvent } from "react";
import { ANALYTICS_EVENTS, MESSAGE_CONFIG, PICTURE_CONFIG, SENT_HOW, SENT_WHAT } from "@/constants/config";
import { CLUB, GLYPHS, SAVED, SHEET, SUBS } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { trackEvent } from "@/lib/analytics";
import { teamSlug } from "@/lib/board/names";
import { fitsFormat } from "@/lib/board/queries";
import { lineupPicture, sharePicture } from "@/lib/board/picture";
import { sheetText } from "@/lib/board/sheet";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { Panel } from "./Panel";
import { NameFirst, useNameFirst } from "./NameFirst";
import { useCopySheet } from "./useCopySheet";

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
        <p className="text-base is-dimmer has-py-2">{GAFFER[state.data.voice].subsEmpty}</p>
      )}
    </Panel>
  );
}

export function SavedPanel() {
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
    <Panel heading={SAVED.heading}>
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
        <input id={nameId} name="name" className="field field--grow has-radius-field has-py-2 has-px-3" placeholder={SAVED.namePlaceholder} />
        <Button type="submit">{SAVED.save}</Button>
      </form>
    </Panel>
  );
}

export function SheetPanel() {
  const { state, act } = useBoard();
  const [making, setMaking] = useState(false);
  const copy = useCopySheet();
  const nameFirst = useNameFirst();
  const whatsapp = MESSAGE_CONFIG.whatsappUrl + encodeURIComponent(sheetText(state.data));
  async function share() {
    setMaking(true);
    try {
      const { data } = state;
      const blob = await lineupPicture(data);
      const name = teamSlug(data.team, CLUB.fileFallback) + PICTURE_CONFIG.fileSuffix;
      const result = await sharePicture(blob, name, data.team || SHEET.fallbackTitle);
      if (result !== "cancelled") trackEvent(ANALYTICS_EVENTS.sheetSent, { what: SENT_WHAT.sheet, how: SENT_HOW.picture });
      if (result === "downloaded") act({ type: "notify", text: GAFFER[state.data.voice].pictureSaved });
    } catch {
      act({ type: "notify", text: GAFFER[state.data.voice].pictureFailed });
    } finally {
      setMaking(false);
    }
  }
  return (
    <Panel heading={SHEET.heading}>
      <p className="text-sm is-dimmer">{SHEET.hint}</p>
      <div className="is-flex is-flex-wrap has-gap-2 has-mt-3">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          onClick={nameFirst.guardLink(whatsapp, () => trackEvent(ANALYTICS_EVENTS.sheetSent, { what: SENT_WHAT.sheet, how: SENT_HOW.whatsapp }))}
          className="button button--primary is-inline-flex is-align-center has-py-3 has-px-3 text-base has-radius-field has-font-bold"
        >
          {SHEET.whatsapp}
        </a>
        <Button className="has-py-3" onClick={nameFirst.guard(copy)}>
          {SHEET.copy}
        </Button>
      </div>
      <NameFirst {...nameFirst} />
      <label className="is-flex is-align-center has-gap-2 text-sm is-dim has-mt-3">
        <input type="checkbox" checked={state.data.sheetCredit} onChange={() => act({ type: "toggleSheetCredit" })} />
        {SHEET.creditLabel}
      </label>
      <p className="text-sm is-dimmer has-mt-4">{SHEET.pictureHint}</p>
      <Button className="has-mt-3" onClick={nameFirst.guard(share)} disabled={making} aria-busy={making}>
        {SHEET.sharePicture}
      </Button>
    </Panel>
  );
}
