"use client";

import { HEADER } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { fmtClock, started } from "@/lib/board/queries";
import { useNow, useWakeLock } from "@/lib/hooks";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

export function MatchClock() {
  const { state, act } = useBoard();
  const { clock } = state.data;
  const now = useNow(clock.running, BOARD_CONFIG.clockTickMs);
  useWakeLock(clock.running);

  const ms = clock.running ? clock.base + Math.max(0, now - clock.since) : clock.base;
  const isOn = started(state.data);

  return (
    <div className="is-flex is-align-center has-gap-2">
      <span
        role="timer"
        aria-label={HEADER.clockLabel}
        className={cx(
          "match-clock has-font-headline has-font-semibold text-3xl leading-tight text-right is-tabular",
          isOn ? "is-chalk" : "is-dimmer",
        )}
      >
        {fmtClock(ms)}
      </span>
      <Button onClick={() => act({ type: "clockToggle" })}>
        {clock.running ? HEADER.pause : isOn ? HEADER.resume : HEADER.start}
      </Button>
      <Button variant="quiet" size="tiny" onClick={() => act({ type: "clockReset" })}>
        {HEADER.reset}
      </Button>
    </div>
  );
}
