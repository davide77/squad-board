"use client";

import { useState, type ReactNode } from "react";
import { KEEP_CONFIG } from "@/constants/config";
import { CLUB, KEEP } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { exportSquadFile } from "@/lib/board/files";
import { useInstallPrompt, useIsInstalled, useIsTouch, useStoredFlag } from "@/lib/hooks";
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

/**
 * One card at a time at the top of an own board: first the nudge to put Gafferboard
 * on the home screen, where the phone will not clear it, then a reminder to keep a copy.
 */
export function KeepSafe() {
  const { state, act } = useBoard();
  const { data } = state;
  const installed = useIsInstalled();
  const touch = useIsTouch();
  const prompt = useInstallPrompt();
  const [homeClosed, closeHome] = useStoredFlag(KEEP_CONFIG.homeDismissedKey);
  const [hidden, setHidden] = useState<"home" | "backup" | null>(null);
  // Read once when the board opens, so the cards do not appear mid-match.
  const [openedAt] = useState(Date.now);

  if (data.example || !data.players.length) return null;
  const since = data.createdAt ? openedAt - data.createdAt : Infinity;

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
  const showBackup = hidden !== "backup" && (!lastCopy || openedAt - lastCopy > KEEP_CONFIG.backupEveryMs);
  if (showBackup) {
    const save = () => {
      exportSquadFile(data, Date.now());
      act({ type: "backedUp" });
      act({ type: "notify", text: GAFFER[data.voice].exported });
    };
    return (
      <Card title={KEEP.backupTitle} body={data.backedUpAt ? KEEP.backupOld : KEEP.backupNever}>
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
