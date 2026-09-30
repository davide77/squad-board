"use client";

import { useEffect, useId, useState } from "react";
import { ANALYTICS_EVENTS, MESSAGE_CONFIG, PICTURE_CONFIG, SENT_HOW, SENT_WHAT } from "@/constants/config";
import { CLUB, NAME_STYLES, SEND, SHEET } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { trackEvent } from "@/lib/analytics";
import { squadMessage } from "@/lib/board/message";
import { teamSlug } from "@/lib/board/names";
import { lineupPicture, sharePicture } from "@/lib/board/picture";
import { sheetText } from "@/lib/board/sheet";
import type { BoardData, SendKind } from "@/lib/board/types";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { NameFirst, useNameFirst } from "./NameFirst";
import { Panel } from "./Panel";
import { useCopySheet } from "./useCopySheet";

/** The text a kind sends. The picture has none. */
const TEXT: Readonly<Record<Exclude<SendKind, "picture">, (d: BoardData) => string>> = {
  callup: squadMessage,
  sheet: sheetText,
};

/** How the analytics name what went out. */
const WHAT = { callup: SENT_WHAT.message, sheet: SENT_WHAT.sheet, picture: SENT_WHAT.sheet } as const;

/** Left: the call-up, the team sheet or the picture. Radio buttons, so the arrow keys move between them. */
export function SendKinds() {
  const { state, act } = useBoard();
  const name = useId();
  return (
    <Panel heading={SEND.kindsHeading}>
      <div role="radiogroup" aria-label={SEND.kindsHeading} className="is-flex is-flex-column has-gap-2">
        {SEND.kinds.map((k) => {
          const on = state.ui.sendKind === k.key;
          return (
            <label key={k.key} className={cx("send-kind is-flex is-flex-column has-gap-1 has-p-4 has-radius-panel", on && "send-kind--on")}>
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={on}
                onChange={() => act({ type: "setSendKind", kind: k.key })}
              />
              <span className={cx("has-font-headline has-font-bold text-sm tracking-caps uppercase", on ? "is-kit" : "is-dimmer")}>
                {k.when}
              </span>
              <span className="text-lg has-font-bold">{k.title}</span>
              <span className="text-base is-dim leading-snug">{k.body}</span>
            </label>
          );
        })}
      </div>
    </Panel>
  );
}

/** The line-up picture, drawn from the board, as an image the page can show. Redrawn when the board changes. */
function usePictureUrl(d: BoardData, on: boolean): string | null {
  // Kept with the board it was drawn from, so an old picture never shows for a changed board.
  const [pic, setPic] = useState<{ readonly d: BoardData; readonly url: string } | null>(null);
  useEffect(() => {
    if (!on) return;
    let live = true;
    let made: string | null = null;
    lineupPicture(d)
      .then((blob) => {
        if (!live) return;
        made = URL.createObjectURL(blob);
        setPic({ d, url: made });
      })
      .catch(() => {});
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [d, on]);
  return on && pic?.d === d ? pic.url : null;
}

/** Centre: what the parents will get. Text as a chat bubble, the picture as itself. */
export function SendPreview() {
  const { state } = useBoard();
  const { data, ui } = state;
  const kind = ui.sendKind;
  const picture = usePictureUrl(data, kind === "picture");

  if (kind === "picture") {
    return (
      <div className="send-preview is-flex is-justify-center">
        {picture ? (
          // A blob URL from the canvas: next/image cannot optimise it, and there is nothing to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picture} alt={SEND.pictureAlt} className="send-preview__picture is-block is-w-full has-radius-sheet" />
        ) : (
          <p className="send-preview__picture send-preview__picture--making is-flex is-align-center is-justify-center has-radius-sheet text-base is-dim">
            {SEND.pictureMaking}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="send-preview is-flex is-justify-center">
      <div className="send-chat is-w-full has-p-4 has-radius-sheet bg-board-2">
        <div className="send-chat__head is-flex is-align-center has-gap-3 has-pb-3 has-mb-3">
          <span className="send-chat__avatar is-flex is-align-center is-justify-center has-radius-pill has-font-bold text-sm is-dim" aria-hidden="true">
            {SEND.groupInitial(data.team)}
          </span>
          <span className="is-flex is-flex-column">
            <span className="text-md has-font-bold">{SEND.group(data.team)}</span>
            <span className="text-sm is-dimmer">{SEND.previewLabel}</span>
          </span>
        </div>
        <p className="send-chat__bubble has-p-4 text-md leading-normal">{TEXT[kind](data)}</p>
      </div>
    </div>
  );
}

/** Right: names, the credit line, and the buttons that send it. */
export function SendActions() {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const kind = ui.sendKind;
  const nameFirst = useNameFirst();
  const [making, setMaking] = useState(false);
  const build = kind === "picture" ? TEXT.sheet : TEXT[kind];
  const copy = useCopySheet(build, WHAT[kind]);
  const whatsapp = MESSAGE_CONFIG.whatsappUrl + encodeURIComponent(build(data));
  const namesId = useId();

  async function share() {
    setMaking(true);
    try {
      const blob = await lineupPicture(data);
      const file = teamSlug(data.team, CLUB.fileFallback) + PICTURE_CONFIG.fileSuffix;
      const result = await sharePicture(blob, file, data.team || SHEET.fallbackTitle);
      if (result !== "cancelled") trackEvent(ANALYTICS_EVENTS.sheetSent, { what: WHAT.picture, how: SENT_HOW.picture });
      if (result === "downloaded") act({ type: "notify", text: GAFFER[data.voice].pictureSaved });
    } catch {
      act({ type: "notify", text: GAFFER[data.voice].pictureFailed });
    } finally {
      setMaking(false);
    }
  }

  return (
    <Panel heading={SEND.heading}>
      <p id={namesId} className="has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-2">
        {SEND.namesLabel}
      </p>
      <div role="group" aria-labelledby={namesId} className="send-names is-grid has-gap-2">
        {NAME_STYLES.map((o) => (
          <Button
            key={o.key}
            variant={data.nameStyle === o.key ? "primary" : "default"}
            aria-pressed={data.nameStyle === o.key}
            className="has-py-3"
            onClick={() => act({ type: "setNameStyle", style: o.key })}
          >
            {o.label}
          </Button>
        ))}
      </div>
      <p className="text-sm is-dimmer has-mt-2">{SEND.namesHint}</p>

      {kind !== "picture" && (
        <label className="is-flex is-align-center has-gap-3 text-md has-mt-4 hit-area">
          <input type="checkbox" checked={data.sheetCredit} onChange={() => act({ type: "toggleSheetCredit" })} />
          {SHEET.creditLabel}
        </label>
      )}

      <div className="is-flex is-flex-column has-gap-2 has-mt-5 has-pt-5 send-actions">
        {kind === "picture" ? (
          <>
            <Button variant="primary" className="has-py-4 text-lg" onClick={nameFirst.guard("picture", share)} disabled={making} aria-busy={making}>
              {SEND.share}
            </Button>
            <p className="text-sm is-dimmer">{SEND.shareHint}</p>
          </>
        ) : (
          <>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener"
              onClick={nameFirst.guardLink("whatsapp", whatsapp, () =>
                trackEvent(ANALYTICS_EVENTS.sheetSent, { what: WHAT[kind], how: SENT_HOW.whatsapp }),
              )}
              className="button button--primary is-flex is-align-center is-justify-center has-py-4 text-lg has-radius-field has-font-bold"
            >
              {SEND.whatsapp}
            </a>
            <Button className="has-py-3" onClick={nameFirst.guard("copy", copy)}>
              {SEND.copy}
            </Button>
          </>
        )}
      </div>
      <NameFirst {...nameFirst} />
    </Panel>
  );
}
