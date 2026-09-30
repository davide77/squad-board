"use client";

import { ANALYTICS_EVENTS, MESSAGE_CONFIG, SENT_HOW } from "@/constants/config";
import { FULL, PARENTS, SHEET } from "@/constants/content/board";
import { trackSend } from "@/lib/analytics";
import { squadMessage } from "@/lib/board/message";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { NameFirst, useNameFirst } from "./NameFirst";
import { NameStyles } from "./NameStyles";
import { Panel } from "./Panel";
import { useCopySheet } from "./useCopySheet";

/**
 * The call-up, under Pick the team: who's in, when, where and what to wear, previewed as the parents
 * will read it. Never the shape, the bench or who is injured.
 */
export function ParentsMessage() {
  const { state, act } = useBoard();
  const { data } = state;
  const message = squadMessage(data);
  const whatsapp = MESSAGE_CONFIG.whatsappUrl + encodeURIComponent(message);
  const copy = useCopySheet(squadMessage, ANALYTICS_EVENTS.callUpSent);
  const nameFirst = useNameFirst();

  return (
    <Panel heading={PARENTS.heading}>
      <p className="text-base is-dim has-mb-3">{PARENTS.hint}</p>
      <p className="send-chat__bubble parents-preview has-p-4 text-base leading-normal has-mb-4" aria-label={PARENTS.previewLabel}>
        {message}
      </p>
      <NameStyles label={FULL.namesLabel} hint={PARENTS.namesHint} />
      <label className="is-flex is-align-center has-gap-3 text-md has-mt-3 hit-area">
        <input type="checkbox" checked={data.sheetCredit} onChange={() => act({ type: "toggleSheetCredit" })} />
        {SHEET.creditLabel}
      </label>
      <div className="is-flex has-gap-2 has-mt-4">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          onClick={nameFirst.guardLink("whatsapp", whatsapp, () =>
            trackSend(ANALYTICS_EVENTS.callUpSent, data, SENT_HOW.whatsapp),
          )}
          className="button button--chalk is-flex is-flex-1 is-align-center is-justify-center has-py-3 text-md has-radius-field has-font-bold"
        >
          {PARENTS.whatsapp}
        </a>
        <Button className="has-py-3 has-px-5" onClick={nameFirst.guard("copy", copy)}>
          {PARENTS.copy}
        </Button>
      </div>
      <NameFirst {...nameFirst} />
    </Panel>
  );
}
