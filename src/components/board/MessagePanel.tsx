"use client";

import { useId } from "react";
import { ANALYTICS_EVENTS, MESSAGE_CONFIG, SENT_HOW, SENT_WHAT } from "@/constants/config";
import { MESSAGE } from "@/constants/content/board";
import { trackEvent } from "@/lib/analytics";
import { mapLink, squadMessage } from "@/lib/board/message";
import type { MatchDetails } from "@/lib/board/types";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { Panel } from "./Panel";
import { NameFirst, useNameFirst } from "./NameFirst";
import { useCopySheet } from "./useCopySheet";

const LABEL = "is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1";
// py-3 keeps every field at least 44px tall for a thumb.
const FIELD = "field is-w-full has-radius-field has-py-3 has-px-3 text-base";

/** This week's opponent, date, times, kit and ground, and the call-up for the parents' group. */
export function MessagePanel() {
  const { state, act } = useBoard();
  const { fixture, match } = state.data;
  const copy = useCopySheet(squadMessage, SENT_WHAT.message);
  const id = useId();
  const set = (field: keyof MatchDetails) => (e: { target: { value: string } }) =>
    act({ type: "setMatch", field, value: e.target.value });
  const address = match.address.trim();
  const message = squadMessage(state.data);
  const whatsapp = MESSAGE_CONFIG.whatsappUrl + encodeURIComponent(message);
  const nameFirst = useNameFirst();

  return (
    <Panel heading={MESSAGE.heading}>
      <p className="text-sm is-dimmer has-mb-4">{MESSAGE.hint}</p>
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
          <label htmlFor={`${id}-kit`} className={LABEL}>
            {MESSAGE.kitLabel}
          </label>
          <input
            id={`${id}-kit`}
            className={FIELD}
            placeholder={MESSAGE.kitPlaceholder}
            autoComplete="off"
            value={match.kit}
            onChange={set("kit")}
          />
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
          <p id={`${id}-address-hint`} className="is-flex is-flex-wrap is-align-center has-gap-3 has-mt-1 text-sm is-dimmer">
            <span>{MESSAGE.addressHint}</span>
            {address && (
              <a href={mapLink(address)} target="_blank" rel="noopener" className="hit-area is-kit">
                {MESSAGE.mapCheck}
              </a>
            )}
          </p>
        </div>
      </div>

      <p className="text-sm is-dimmer has-mt-5">{MESSAGE.squadHint}</p>
      <details className="has-mt-2">
        <summary className="hit-area is-inline-block text-sm is-kit">{MESSAGE.preview}</summary>
        <p className="message-preview bg-board-2 has-radius-field has-p-3 has-mt-2 text-sm leading-normal">{message}</p>
      </details>
      <div className="is-flex is-flex-wrap has-gap-2 has-mt-3">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          onClick={nameFirst.guardLink("whatsapp", whatsapp, () => trackEvent(ANALYTICS_EVENTS.sheetSent, { what: SENT_WHAT.message, how: SENT_HOW.whatsapp }))}
          className="button button--primary is-inline-flex is-align-center has-py-3 has-px-3 text-base has-radius-field has-font-bold"
        >
          {MESSAGE.whatsapp}
        </a>
        <Button className="has-py-3" onClick={nameFirst.guard("copy", copy)}>
          {MESSAGE.copy}
        </Button>
      </div>
      <NameFirst {...nameFirst} />
    </Panel>
  );
}
