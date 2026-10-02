"use client";

import { useCallback, useId, useState } from "react";
import { ANALYTICS_EVENTS, MESSAGE_CONFIG, SENT_HOW } from "@/constants/config";
import { CALL_UP, FULL, HEADER, MESSAGE, PARENTS, SHEET } from "@/constants/content/board";
import { trackSend } from "@/lib/analytics";
import { squadMessage } from "@/lib/board/message";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { MatchDetailsFields } from "./MatchDetailsFields";
import { NameFirst, TEAM_NAME_MARK, useNameFirst } from "./NameFirst";
import { NameStyles } from "./NameStyles";
import { SideSheet } from "./SideSheet";
import { useCopySheet } from "./useCopySheet";

const SECTION_HEADING = "has-font-headline text-xs tracking-caps uppercase is-dim has-mb-3";

/** The team name, asked for here when the board has none, so the call-up never goes out headed "Matchday". */
function TeamNameField() {
  const { state, act } = useBoard();
  const id = useId();
  // Asked once, as the sheet opens. It stays while the name is typed, rather than vanishing at the first letter.
  const [unnamed] = useState(() => !state.data.team.trim());
  if (!unnamed) return null;
  return (
    <div className="has-mb-3">
      <label htmlFor={id} className="is-block has-font-headline text-xs tracking-caps uppercase is-dim has-mb-1">
        {HEADER.teamLabel}
      </label>
      <input
        id={id}
        {...TEAM_NAME_MARK}
        className="field is-w-full has-radius-field has-py-3 has-px-3 text-base"
        placeholder={HEADER.teamPlaceholder}
        autoComplete="off"
        value={state.data.team}
        onChange={(e) => act({ type: "setTeam", value: e.target.value })}
      />
    </div>
  );
}

/** What the parents will read: who's in, when, where and what to wear. Never the shape, the bench or who is injured. */
function Preview() {
  const { state, act } = useBoard();
  return (
    <section className="drawer__section has-pt-5">
      <h3 className={SECTION_HEADING}>{CALL_UP.previewHeading}</h3>
      <p className="send-chat__bubble parents-preview has-p-4 text-base leading-normal has-mb-4" aria-label={PARENTS.previewLabel}>
        {squadMessage(state.data)}
      </p>
      <NameStyles label={FULL.namesLabel} hint={PARENTS.namesHint} />
      <label className="is-flex is-align-center has-gap-3 text-md has-mt-3 hit-area">
        <input type="checkbox" checked={state.data.sheetCredit} onChange={() => act({ type: "toggleSheetCredit" })} />
        {SHEET.creditLabel}
      </label>
    </section>
  );
}

/** WhatsApp and Copy, pinned to the foot of the sheet, with the team-name check above them when it holds a send. */
function SendButtons() {
  const { state } = useBoard();
  const { data } = state;
  const message = squadMessage(data);
  const whatsapp = MESSAGE_CONFIG.whatsappUrl + encodeURIComponent(message);
  const copy = useCopySheet(squadMessage, ANALYTICS_EVENTS.callUpSent);
  const nameFirst = useNameFirst();

  return (
    <>
      <NameFirst {...nameFirst} />
      <div className="is-flex has-gap-2 has-mt-3">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          onClick={nameFirst.guardLink("whatsapp", whatsapp, () => trackSend(ANALYTICS_EVENTS.callUpSent, data, SENT_HOW.whatsapp))}
          className="button button--primary is-flex is-flex-1 is-align-center is-justify-center has-py-3 text-md has-radius-field has-font-bold"
        >
          {PARENTS.whatsapp}
        </a>
        <Button className="has-py-3 has-px-5" onClick={nameFirst.guard("copy", copy)}>
          {PARENTS.copy}
        </Button>
      </div>
    </>
  );
}

/**
 * Send call-up, opened from the bar under Pick the team and from the match line in the header. This week's
 * match sits beside the message it feeds, so the coach fills it in and sees the result in one place.
 */
export function CallUpSheet() {
  const { state, act } = useBoard();
  const close = useCallback(() => act({ type: "closeCallUp" }), [act]);

  return (
    <SideSheet open={state.ui.callUpOpen} onClose={close} title={CALL_UP.heading} hint={PARENTS.hint} closeLabel={CALL_UP.close} foot={<SendButtons />}>
      <section>
        <h3 className={SECTION_HEADING}>{MESSAGE.heading}</h3>
        <TeamNameField />
        <MatchDetailsFields />
      </section>
      <Preview />
    </SideSheet>
  );
}
