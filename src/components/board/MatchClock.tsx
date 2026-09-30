"use client";

import { HEADER } from "@/constants/content/board";
import { AGE_NOT_SET, ANALYTICS_EVENTS, BOARD_CONFIG } from "@/constants/config";
import { trackEvent } from "@/lib/analytics";
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
      <Button
        onClick={() => {
          // Kick-off only: stopped with nothing on the clock. A restart after half-time, or the example team, is not counted.
          if (!isOn && !state.data.example) {
            trackEvent(ANALYTICS_EVENTS.clockStarted, { age: state.data.age ?? AGE_NOT_SET });
          }
          act({ type: "clockToggle" });
        }}
      >
        {clock.running ? HEADER.pause : isOn ? HEADER.resume : HEADER.start}
      </Button>
      <Button variant="quiet" size="tiny" onClick={() => act({ type: "clockReset" })}>
        {HEADER.reset}
      </Button>
    </div>
  );
}
