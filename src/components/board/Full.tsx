"use client";

import { useEffect, useId, useState } from "react";
import { ANALYTICS_EVENTS, MESSAGE_CONFIG, PICTURE_CONFIG, SENT_HOW } from "@/constants/config";
import { CLUB, FULL, SHEET } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { trackSend } from "@/lib/analytics";
import { matchDate } from "@/lib/board/message";
import { sentName, teamSlug } from "@/lib/board/names";
import { lineupPicture, sharePicture } from "@/lib/board/picture";
import { byId, playedMs } from "@/lib/board/queries";
import { opponentName, resultText } from "@/lib/board/result";
import type { BoardData } from "@/lib/board/types";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { Crest } from "./Crest";
import { NameFirst, useNameFirst } from "./NameFirst";
import { NameStyles } from "./NameStyles";
import { Panel } from "./Panel";
import { useCopySheet } from "./useCopySheet";

/** Left: the result for the parents, or the picture for the coaches. Radio buttons, so the arrow keys move between them. */
export function FullKinds() {
  const { state, act } = useBoard();
  const name = useId();
  return (
    <Panel heading={FULL.kindsHeading}>
      <div role="radiogroup" aria-label={FULL.kindsHeading} className="is-flex is-flex-column has-gap-2">
        {FULL.kinds.map((k) => {
          const on = state.ui.sendKind === k.key;
          return (
            <label key={k.key} className={cx("send-kind is-flex is-flex-column has-gap-1 has-p-4 has-radius-panel", on && "send-kind--on")}>
              <input type="radio" name={name} className="sr-only" checked={on} onChange={() => act({ type: "setSendKind", kind: k.key })} />
              <span className={cx("has-font-headline has-font-bold text-sm tracking-caps uppercase", on ? "is-kit" : "is-dimmer")}>{k.when}</span>
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

/** Centre: the result as a card, the way it reads out, or the picture itself. */
export function FullPreview() {
  const { state } = useBoard();
  const { data, ui } = state;
  const picture = usePictureUrl(data, ui.sendKind === "picture");

  if (ui.sendKind === "picture") {
    return (
      <div className="send-preview is-flex is-justify-center">
        {picture ? (
          // A blob URL from the canvas: next/image cannot optimise it, and there is nothing to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picture} alt={FULL.pictureAlt} className="send-preview__picture is-block is-w-full has-radius-sheet" />
        ) : (
          <p className="send-preview__picture send-preview__picture--making is-flex is-align-center is-justify-center has-radius-sheet text-base is-dim">
            {FULL.pictureMaking}
          </p>
        )}
      </div>
    );
  }

  const star = byId(data, data.match.potm);
  const date = matchDate(data.match.date);
  return (
    <div className="send-preview is-flex is-justify-center">
      <div className="result-card is-flex is-flex-column is-justify-between has-gap-4 is-w-full has-p-6 has-radius-sheet">
        <div className="is-flex is-align-center has-gap-3">
          <Crest team={data.team} badge={data.badge} />
          <div className="is-flex is-flex-column">
            <span className="has-font-headline has-font-bold text-sm tracking-caps uppercase is-kit">{FULL.fullTime}</span>
            {date && <span className="text-base is-dim">{date}</span>}
          </div>
        </div>
        <div className="result-card__score is-grid is-align-center has-gap-3">
          <span className="has-font-headline has-font-bold text-3xl leading-tight is-truncate">{FULL.us(data.team)}</span>
          <span className="result-card__goals has-font-headline has-font-bold is-kit is-tabular">{data.match.us}</span>
          <span className="has-font-headline has-font-bold text-3xl leading-tight is-dim is-truncate">{FULL.them(opponentName(data.fixture))}</span>
          <span className="result-card__goals has-font-headline has-font-bold is-dim is-tabular">{data.match.them}</span>
        </div>
        {star ? (
          <div className="is-flex is-flex-column has-gap-1 has-p-4 has-radius-panel bg-board-2">
            <span className="has-font-headline has-font-bold text-sm tracking-caps uppercase is-dim">{FULL.potmLabel}</span>
            <span className="has-font-headline has-font-bold text-3xl leading-tight">{sentName(data, star.name)}</span>
          </div>
        ) : (
          <span />
        )}
        {data.sheetCredit && <span className="text-sm is-dimmer">{SHEET.pictureFooter}</span>}
      </div>
    </div>
  );
}

/** Right: the score, the player of the match and the send buttons; or, for the picture, who it is for. */
export function FullActions() {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const nameFirst = useNameFirst();
  const copy = useCopySheet(resultText, ANALYTICS_EVENTS.resultSent);
  const [making, setMaking] = useState(false);
  const potmId = useId();
  const text = resultText(data);
  const whatsapp = MESSAGE_CONFIG.whatsappUrl + encodeURIComponent(text);
  // Anyone who has had minutes can be player of the match.
  const played = data.players.filter((p) => playedMs(data, p.id, 0) > 0 || Object.values(data.xi).includes(p.id));

  async function share() {
    setMaking(true);
    try {
      const blob = await lineupPicture(data);
      const file = teamSlug(data.team, CLUB.fileFallback) + PICTURE_CONFIG.fileSuffix;
      const result = await sharePicture(blob, file, data.team || SHEET.fallbackTitle);
      if (result !== "cancelled") {
        trackSend(ANALYTICS_EVENTS.pictureShared, data, result === "downloaded" ? SENT_HOW.downloaded : SENT_HOW.shared);
      }
      if (result === "downloaded") act({ type: "notify", text: GAFFER[data.voice].pictureSaved });
    } catch {
      act({ type: "notify", text: GAFFER[data.voice].pictureFailed });
    } finally {
      setMaking(false);
    }
  }

  if (ui.sendKind === "picture") {
    return (
      <Panel heading={FULL.pictureHeading}>
        <p className="text-base is-dim leading-relaxed has-mb-4">{FULL.pictureBody}</p>
        <Button variant="chalk" className="is-w-full has-py-4 text-lg" onClick={nameFirst.guard("picture", share)} disabled={making} aria-busy={making}>
          {FULL.share}
        </Button>
        <p className="text-sm is-dimmer has-mt-2">{FULL.shareHint}</p>
        <NameFirst {...nameFirst} />
      </Panel>
    );
  }

  const sides = [
    { key: "us", label: FULL.us(data.team), value: data.match.us },
    { key: "them", label: FULL.them(opponentName(data.fixture)), value: data.match.them },
  ] as const;

  return (
    <Panel heading={FULL.resultHeading}>
      <div className="is-flex is-flex-column has-gap-3 has-mb-4">
        {sides.map((s) => (
          <div key={s.key} className="score-row is-grid is-align-center has-gap-2">
            <span className="text-md has-font-semibold is-truncate">{s.label}</span>
            <button type="button" className="score-row__step has-radius-field text-2xl has-font-bold" aria-label={FULL.minus(s.label)} onClick={() => act({ type: "changeScore", side: s.key, by: -1 })}>
              -
            </button>
            <span className="has-font-headline has-font-bold text-4xl text-center is-tabular" aria-live="polite">
              {s.value}
            </span>
            <button type="button" className="score-row__step has-radius-field text-2xl has-font-bold" aria-label={FULL.plus(s.label)} onClick={() => act({ type: "changeScore", side: s.key, by: 1 })}>
              +
            </button>
          </div>
        ))}
      </div>
      <label htmlFor={potmId} className="is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1">
        {FULL.potmLabel}
      </label>
      <select id={potmId} className="formation-select is-w-full has-radius-field has-py-3 text-md has-mb-4" value={data.match.potm} onChange={(e) => act({ type: "setPotm", pid: e.target.value })}>
        <option value="">{FULL.potmNobody}</option>
        {played.map((p) => (
          <option key={p.id} value={p.id}>
            {p.num ? `${p.num} ${p.name}` : p.name}
          </option>
        ))}
      </select>
      <NameStyles label={FULL.namesLabel} />
      <label className="is-flex is-align-center has-gap-3 text-md has-mt-3 hit-area">
        <input type="checkbox" checked={data.sheetCredit} onChange={() => act({ type: "toggleSheetCredit" })} />
        {SHEET.creditLabel}
      </label>
      <div className="send-actions is-flex is-flex-column has-gap-2 has-mt-5 has-pt-5">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          onClick={nameFirst.guardLink("whatsapp", whatsapp, () =>
            trackSend(ANALYTICS_EVENTS.resultSent, data, SENT_HOW.whatsapp),
          )}
          className="button button--primary is-flex is-align-center is-justify-center has-py-4 text-lg has-radius-field has-font-bold"
        >
          {FULL.send}
        </a>
        <Button className="has-py-3" onClick={nameFirst.guard("copy", copy)}>
          {FULL.copy}
        </Button>
      </div>
      <NameFirst {...nameFirst} />
    </Panel>
  );
}
