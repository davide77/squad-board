"use client";

import { HEADER } from "@/constants/content/board";
import { ANALYTICS_EVENTS, BOARD_CONFIG } from "@/constants/config";
import { trackBoard } from "@/lib/analytics";
import { fmtClock, started } from "@/lib/board/queries";
import { useNow, useWakeLock } from "@/lib/hooks";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

/**
 * Starts or stops the match clock. A kick-off, from a clock at zero, is counted: a restart after
 * half-time is not, and neither is the example team.
 */
export function useClockToggle() {
  const { state, act } = useBoard();
  return () => {
    if (!started(state.data)) trackBoard(ANALYTICS_EVENTS.clockStarted, state.data);
    act({ type: "clockToggle" });
  };
}

export function MatchClock() {
  const { state, act } = useBoard();
  const { clock } = state.data;
  const now = useNow(clock.running, BOARD_CONFIG.clockTickMs);
  useWakeLock(clock.running);

  const ms = clock.running ? clock.base + Math.max(0, now - clock.since) : clock.base;
  const isOn = started(state.data);
  const toggle = useClockToggle();

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
      <Button onClick={toggle}>
        {clock.running ? HEADER.pause : isOn ? HEADER.resume : HEADER.start}
      </Button>
      <Button variant="quiet" size="tiny" onClick={() => act({ type: "clockReset" })}>
        {HEADER.reset}
      </Button>
    </div>
  );
}
