"use client";

import { useId } from "react";
import { MESSAGE_CONFIG } from "@/constants/config";
import { MESSAGE } from "@/constants/content/board";
import { mapLink } from "@/lib/board/message";
import type { MatchDetails } from "@/lib/board/types";
import { useBoard } from "./BoardProvider";
import { Panel } from "./Panel";

const LABEL = "is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1";
// py-3 keeps every field at least 44px tall for a thumb.
const FIELD = "field is-w-full has-radius-field has-py-3 has-px-3 text-base";

/** This week's opponent, date, times, kit and ground. They head the call-up and the team sheet, sent from Send. */
export function MatchDetailsPanel() {
  const { state, act } = useBoard();
  const { fixture, match } = state.data;
  const id = useId();
  const set = (field: keyof MatchDetails) => (e: { target: { value: string } }) =>
    act({ type: "setMatch", field, value: e.target.value });
  const address = match.address.trim();

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
    </Panel>
  );
}
