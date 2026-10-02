"use client";

import { useId } from "react";
import { MESSAGE_CONFIG } from "@/constants/config";
import { COMPETITIONS, MESSAGE } from "@/constants/content/board";
import { kitWords } from "@/lib/board/kit";
import { mapLink } from "@/lib/board/message";
import type { Competition, MatchTextField } from "@/lib/board/types";
import { useBoard } from "./BoardProvider";
import { KitIcon } from "./KitIcon";

const LABEL = "is-block has-font-headline text-xs tracking-caps uppercase is-dim has-mb-1";
// py-3 keeps every field at least 44px tall for a thumb.
const FIELD = "field is-w-full has-radius-field has-py-3 has-px-3 text-base";

/** This week's opponent, date, times, home or away, and ground, in the call-up sheet. They head the call-up and the result. */
export function MatchDetailsFields() {
  const { state, act } = useBoard();
  const { fixture, match, kits } = state.data;
  const id = useId();
  const set = (field: MatchTextField) => (e: { target: { value: string } }) =>
    act({ type: "setMatch", field, value: e.target.value });
  const address = match.address.trim();

  return (
    <div>
      <p className="text-sm is-dim has-mb-4">{MESSAGE.hint}</p>
      <div className="is-grid has-gap-3">
        <div>
          <label htmlFor={`${id}-opp`} className={LABEL}>
            {MESSAGE.opponentLabel}
          </label>
          <input
            id={`${id}-opp`}
            className={FIELD}
            placeholder={MESSAGE.opponentPlaceholder}
            autoComplete="off"
            value={fixture}
            onChange={(e) => act({ type: "setFixture", value: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor={`${id}-comp`} className={LABEL}>
            {MESSAGE.competitionLabel}
          </label>
          <select
            id={`${id}-comp`}
            className={`${FIELD} formation-select`}
            value={match.competition}
            onChange={(e) => act({ type: "setCompetition", competition: e.target.value as Competition })}
          >
            <option value="">{MESSAGE.competitionNone}</option>
            {COMPETITIONS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-date`} className={LABEL}>
            {MESSAGE.dateLabel}
          </label>
          <input id={`${id}-date`} type="date" className={FIELD} value={match.date} onChange={set("date")} />
        </div>
        {/* The two times side by side, in the order the message reads them. */}
        <div className="is-flex has-gap-3">
          <div className="is-flex-1 is-min-w-0">
            <label htmlFor={`${id}-ko`} className={LABEL}>
              {MESSAGE.kickoffLabel}
            </label>
            <input id={`${id}-ko`} type="time" className={FIELD} value={match.kickoff} onChange={set("kickoff")} />
          </div>
          <div className="is-flex-1 is-min-w-0">
            <label htmlFor={`${id}-meet`} className={LABEL}>
              {MESSAGE.meetLabel}
            </label>
            <input id={`${id}-meet`} type="time" className={FIELD} value={match.meet} onChange={set("meet")} />
          </div>
        </div>
        <div>
          <p id={`${id}-venue`} className={LABEL}>
            {MESSAGE.venueLabel}
          </p>
          {/* Which strip, drawn on the button. The message says it in full: "Home kit: red shirts, white shorts, red socks." */}
          <div role="group" aria-labelledby={`${id}-venue`} className="is-flex has-gap-2">
            {MESSAGE.venues.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={match.venue === v.key}
                className="choice is-flex is-flex-1 is-align-center is-justify-center has-gap-2 has-radius-field has-font-semibold text-md"
                onClick={() => act({ type: "setVenue", venue: v.key })}
              >
                <KitIcon kit={kits[v.key]} className="kit-icon--sm" />
                {v.label}
              </button>
            ))}
          </div>
          {match.venue && <p className="kit-editor__words text-sm is-dim has-mt-2">{kitWords(kits[match.venue])}</p>}
          <p className="text-sm is-dim has-mt-1">
            {MESSAGE.venueHint}{" "}
            <button
              type="button"
              className="landing-link-button hit-area is-kit"
              onClick={() => {
                act({ type: "closeCallUp" });
                act({ type: "openClub" });
              }}
            >
              {MESSAGE.venueHintLink}
            </button>
          </p>
        </div>
        <div>
          <p id={`${id}-surface`} className={LABEL}>
            {MESSAGE.surfaceLabel}
          </p>
          {/* Grass or astro decides the boots, so the message says which to bring. */}
          <div role="group" aria-labelledby={`${id}-surface`} className="is-flex has-gap-2">
            {MESSAGE.surfaces.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={match.surface === v.key}
                className="choice is-flex is-flex-1 is-align-center is-justify-center has-radius-field has-font-semibold text-md"
                onClick={() => act({ type: "setSurface", surface: v.key })}
              >
                {v.label}
              </button>
            ))}
          </div>
          {match.surface && <p className="text-sm is-dim has-mt-2">{MESSAGE.surfaceLine[match.surface]}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-address`} className={LABEL}>
            {MESSAGE.addressLabel}
          </label>
          {/* Autofill off: the browser would offer the coach's own home address. */}
          <textarea
            id={`${id}-address`}
            className={`${FIELD} field--area is-block leading-normal`}
            rows={MESSAGE_CONFIG.addressRows}
            placeholder={MESSAGE.addressPlaceholder}
            autoComplete="off"
            aria-describedby={`${id}-address-hint`}
            value={match.address}
            onChange={set("address")}
          />
          <p id={`${id}-address-hint`} className="is-flex is-flex-wrap is-align-center has-gap-3 has-mt-1 text-sm is-dim">
            <span>{MESSAGE.addressHint}</span>
            {address && (
              <a href={mapLink(address)} target="_blank" rel="noopener" className="hit-area is-kit">
                {MESSAGE.mapCheck}
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
