"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ANALYTICS_EVENTS, FOUNDING_CONFIG, FOUNDING_DID, KEEP_CONFIG } from "@/constants/config";
import { CLUB, FOUNDING, KEEP } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { trackBoard } from "@/lib/analytics";
import type { BoardData } from "@/lib/board/types";
import { exportSquadFile } from "@/lib/board/files";
import { useInstallPrompt, useIsInstalled, useIsTouch, useStoredFlag } from "@/lib/hooks";
import { ClubWaitlist } from "@/components/landing/ClubWaitlist";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";

function isIos(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

interface CardProps {
  readonly title: string;
  readonly body: string;
  readonly children: ReactNode;
}

function Card({ title, body, children }: CardProps) {
  return (
    <section className="bg-board-2 has-radius-panel has-py-3 has-px-4 has-mb-4" aria-label={title}>
      <h2 className="text-lg tracking-tag has-mb-1">{title}</h2>
      <p className="text-base leading-relaxed is-dim has-mb-3">{body}</p>
      <div className="is-flex is-flex-wrap is-align-center has-gap-2">{children}</div>
    </section>
  );
}

// Once per page load, however often the card remounts (and React runs effects twice in development).
let foundingCounted = false;

interface FoundingProps {
  readonly data: BoardData;
  /** The coach left an email, so the card keeps its thanks up until they close it. */
  readonly onJoined: () => void;
  readonly onClose: () => void;
}

/** The thank-you to an early coach, with the one offer: leave an email and be a founding coach. */
function FoundingCard({ data, onJoined, onClose }: FoundingProps) {
  const lines = FOUNDING[data.voice];
  useEffect(() => {
    if (foundingCounted) return;
    foundingCounted = true;
    trackBoard(ANALYTICS_EVENTS.founding, data, { did: FOUNDING_DID.shown });
    // Counted once, on the board as it opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joined = () => {
    trackBoard(ANALYTICS_EVENTS.founding, data, { did: FOUNDING_DID.joined });
    onJoined();
  };
  const close = () => {
    trackBoard(ANALYTICS_EVENTS.founding, data, { did: FOUNDING_DID.closed });
    onClose();
  };

  return (
    <Card title={lines.title} body={lines.body}>
      <div className="is-w-full">
        <ClubWaitlist list="founding" prompt={FOUNDING.prompt} cta={FOUNDING.cta} label={FOUNDING.label} joined={lines.joined} onJoined={joined} />
      </div>
      <Button variant="quiet" onClick={close}>
        {FOUNDING.close}
      </Button>
    </Card>
  );
}

/**
 * One card at a time at the top of an own board: first the thanks to a coach who found Gafferboard
 * early, then the nudge to put Gafferboard
 * on the home screen, where the phone will not clear it, then a reminder to keep a copy.
 */
export function KeepSafe() {
  const { state, act } = useBoard();
  const { data } = state;
  const installed = useIsInstalled();
  const touch = useIsTouch();
  const prompt = useInstallPrompt();
  const [homeClosed, closeHome] = useStoredFlag(KEEP_CONFIG.homeDismissedKey);
  const [foundingClosed, closeFounding] = useStoredFlag(FOUNDING_CONFIG.closedKey);
  // Joining closes the card for good, but it stays up this visit so the thanks can be read.
  const [thanked, setThanked] = useState(false);
  const [hidden, setHidden] = useState<"founding" | "home" | "backup" | null>(null);
  // Read once when the board opens, so the cards do not appear mid-match.
  const [openedAt] = useState(Date.now);
  // Also read once: a clock stopped at half-time mid-session must not bring the card up.
  const [matchPlayed] = useState(() => !data.clock.running && data.clock.base >= KEEP_CONFIG.matchPlayedMs);

  if (data.example || !data.players.length) return null;
  const since = data.createdAt ? openedAt - data.createdAt : Infinity;

  // Never during a match: the clock is running, or the coach is on the match step.
  const early = data.createdAt < FOUNDING_CONFIG.before;
  const showFounding =
    early && hidden !== "founding" && (thanked || (!foundingClosed && !data.clock.running && state.ui.step !== "match"));
  if (showFounding) {
    return (
      <FoundingCard
        data={data}
        onJoined={() => {
          setThanked(true);
          closeFounding();
        }}
        onClose={() => {
          setHidden("founding");
          closeFounding();
        }}
      />
    );
  }

  const showHome = touch && !installed && !homeClosed && hidden !== "home" && since > KEEP_CONFIG.homeAfterMs;
  if (showHome) {
    const hideHome = () => {
      setHidden("home");
      closeHome();
    };
    return (
      <Card title={KEEP.homeTitle} body={`${KEEP.homeBody} ${prompt ? "" : isIos() ? KEEP.homeIos : KEEP.homeOther}`.trim()}>
        {prompt && (
          <Button variant="primary" onClick={() => void prompt.prompt().then(hideHome)}>
            {KEEP.homeInstall}
          </Button>
        )}
        <Button variant="quiet" onClick={hideHome}>
          {KEEP.later}
        </Button>
      </Card>
    );
  }

  const lastCopy = data.backedUpAt || data.createdAt;
  // Never saved and a match already played: that is four matchdays sooner than waiting for the date.
  const firstAfterMatch = !data.backedUpAt && matchPlayed;
  const showBackup =
    hidden !== "backup" && (!lastCopy || firstAfterMatch || openedAt - lastCopy > KEEP_CONFIG.backupEveryMs);
  if (showBackup) {
    const save = () => {
      exportSquadFile(data, Date.now());
      act({ type: "backedUp" });
      act({ type: "notify", text: GAFFER[data.voice].exported });
    };
    return (
      <Card title={firstAfterMatch ? KEEP.backupAfterMatchTitle : KEEP.backupTitle} body={data.backedUpAt ? KEEP.backupOld : KEEP.backupNever}>
        <Button variant="primary" onClick={save}>
          {CLUB.export}
        </Button>
        <Button variant="quiet" onClick={() => setHidden("backup")}>
          {KEEP.later}
        </Button>
      </Card>
    );
  }

  return null;
}
