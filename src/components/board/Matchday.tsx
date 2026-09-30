"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { BOARD_CONFIG, PHONE_QUERY } from "@/constants/config";
import { MATCH, NO_NUMBER, SUBS } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { firstName } from "@/lib/board/names";
import { blocked, byId, elapsed, fmtClock, playedMinutes, playedMs, positionCodes, started, where } from "@/lib/board/queries";
import type { BoardData, Player } from "@/lib/board/types";
import { useNow, usePrefersReducedMotion } from "@/lib/hooks";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { useClockToggle } from "./MatchClock";
import { Panel } from "./Panel";

/** The player coming off, when one is picked on the pitch. */
function comingOff(d: BoardData, offSlot: string | null): Player | null {
  return offSlot ? byId(d, d.xi[offSlot]) : null;
}

/** The clock at the size a touchline needs: kick off, pause, resume, and the final whistle. */
export function MatchClockCard() {
  const { state, act } = useBoard();
  const { data } = state;
  const now = useNow(data.clock.running, BOARD_CONFIG.clockTickMs);
  const toggle = useClockToggle();
  const on = started(data);
  const status = data.clock.running ? MATCH.running : on ? MATCH.stopped : MATCH.notStarted;

  return (
    <div className="match-card is-flex is-flex-wrap is-align-center is-justify-between has-gap-4 has-py-3 has-px-4 has-radius-panel has-mb-4">
      <div className="is-flex is-align-baseline has-gap-3">
        <span
          role="timer"
          aria-label={MATCH.clockLabel}
          className={cx("match-card__time has-font-headline has-font-bold is-tabular", on ? "is-chalk" : "is-dimmer")}
        >
          {fmtClock(elapsed(data, now))}
        </span>
        <span className="text-base is-dim">{status}</span>
      </div>
      <div className="is-flex has-gap-2">
        <Button variant="primary" className="has-py-3 has-px-5 text-lg" onClick={toggle}>
          {data.clock.running ? MATCH.pause : on ? MATCH.resume : MATCH.kickOff}
        </Button>
        {on && (
          <Button className="has-py-3 has-px-4 text-lg" onClick={() => act({ type: "fullTime" })}>
            {MATCH.fullTime}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Under the pitch: the change in progress, or how to start one. */
export function ChangeBar() {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const now = useNow(data.clock.running, BOARD_CONFIG.minutesTickMs);
  const off = comingOff(data, ui.offSlot);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // On a phone the bench is below the pitch. Picking the player coming off brings this bar and the
  // bench under it up the screen, so "On for" is in reach without hunting for it.
  useEffect(() => {
    if (!ui.offSlot || !window.matchMedia(PHONE_QUERY).matches) return;
    barRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [ui.offSlot, reduced]);

  return (
    <div
      ref={barRef}
      className={cx(
        "change-bar is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 has-py-3 has-px-4 has-radius-panel has-mt-4",
        off && "change-bar--on",
      )}
    >
      <div aria-live="polite">
        <p className="text-lg has-font-bold">{off ? MATCH.offTitle(off.name, playedMinutes(data, off.id, now)) : MATCH.changeTitle}</p>
        <p className="text-sm is-dim">{off ? (ui.offInjured ? MATCH.offInjuredHint : MATCH.offHint) : MATCH.changeHint}</p>
      </div>
      {off && (
        <div className="is-flex has-gap-2">
          <Button
            variant={ui.offInjured ? "out" : "quiet"}
            aria-pressed={ui.offInjured}
            className="has-py-3 has-px-4"
            onClick={() => act({ type: "toggleOffInjured" })}
          >
            {MATCH.injured}
          </Button>
          <Button className="has-py-3 has-px-4" onClick={() => act({ type: "selectOff", slotId: ui.offSlot ?? "" })}>
            {MATCH.cancel}
          </Button>
        </div>
      )}
    </div>
  );
}

interface BenchRowProps {
  readonly p: Player;
  readonly off: Player | null;
  readonly now: number;
  readonly pool?: boolean;
}

function BenchRow({ p, off, now, pool = false }: BenchRowProps) {
  const { state, act } = useBoard();
  const mins = playedMinutes(state.data, p.id, now);
  const meta = [pool ? MATCH.calledUp : "", positionCodes(p).join(" "), mins ? MATCH.played(mins) : ""].filter(Boolean).join(" · ");
  return (
    <li className="bench-row is-grid is-align-center has-gap-3 has-py-2 has-pl-3 has-pr-2 has-radius-panel">
      <span className={cx("bench-row__disc is-flex is-align-center is-justify-center has-radius-pill has-font-headline has-font-bold text-lg", pool && "bench-row__disc--pool")}>
        {p.num || NO_NUMBER}
      </span>
      <span className="is-flex is-flex-column is-min-w-0">
        <span className="text-md has-font-semibold is-truncate">{firstName(p.name)}</span>
        {meta && <span className="text-sm is-dim is-truncate">{meta}</span>}
      </span>
      <Button
        variant={off ? "primary" : "default"}
        className="has-py-3 has-px-4"
        disabled={!off}
        onClick={() => act({ type: "bringOn", pid: p.id })}
      >
        {off ? MATCH.onFor(firstName(off.name)) : MATCH.on}
      </Button>
    </li>
  );
}

/** Who can come on: the bench first, then anyone else called up. The injured are listed apart. */
export function MatchBench() {
  const { state } = useBoard();
  const { data, ui } = state;
  const now = useNow(data.clock.running, BOARD_CONFIG.minutesTickMs);
  const off = comingOff(data, ui.offSlot);
  const bench = data.bench.map((id) => byId(data, id)).filter((p): p is Player => !!p);
  const pool = data.players.filter((p) => !p.out && !blocked(p) && where(data, p.id) === "pool");
  const injured = data.players.filter((p) => p.inj);

  return (
    <Panel heading={MATCH.benchHeading} count={bench.length}>
      <p className="text-base is-dim has-mb-3" aria-live="polite">
        {off ? MATCH.benchFor(firstName(off.name)) : MATCH.benchHint}
      </p>
      <ul className="is-flex is-flex-column has-gap-2">
        {bench.map((p) => (
          <BenchRow key={p.id} p={p} off={off} now={now} />
        ))}
        {pool.map((p) => (
          <BenchRow key={p.id} p={p} off={off} now={now} pool />
        ))}
      </ul>
      {injured.length > 0 && (
        <div className="has-mt-5">
          <h3 className="has-font-headline text-sm tracking-caps uppercase is-dim has-mb-2">{MATCH.injuredHeading}</h3>
          <ul>
            {injured.map((p) => (
              <li key={p.id} className="is-flex is-align-center is-justify-between has-gap-3 has-py-2">
                <span className="text-md">{p.name}</span>
                <span className="status-pill status-pill--inj has-font-headline text-2xs tracking-heading has-radius-pill has-px-2">
                  {MATCH.injured}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

/** The changes so far, newest first, and everyone's minutes against the time played. */
export function MatchLog() {
  const { state } = useBoard();
  const { data } = state;
  const now = useNow(data.clock.running, BOARD_CONFIG.minutesTickMs);
  const total = Math.max(elapsed(data, now), 1);
  const onPitch = new Set(Object.values(data.xi));
  const played = data.players
    .filter((p) => onPitch.has(p.id) || playedMs(data, p.id, now) > 0)
    .sort((a, b) => playedMs(data, b.id, now) - playedMs(data, a.id, now));

  return (
    <>
      <Panel heading={SUBS.heading} count={data.subs.length}>
        {data.subs.length ? (
          <ol className="is-flex is-flex-column has-gap-2">
            {[...data.subs].reverse().map((s, i) => (
              <li key={data.subs.length - i} className="sub-row is-grid is-align-center has-gap-3 has-py-2 has-px-3 has-radius-field bg-board-2">
                <span className="has-font-headline has-font-bold text-2xl is-kit is-tabular">{MATCH.minute(s.min)}</span>
                <span className="is-flex is-flex-column text-base">
                  <span>
                    <strong>{s.onName}</strong> {MATCH.subOn}
                  </span>
                  <span className="is-dim">
                    {s.offName} {MATCH.subOff}
                    {s.inj && ` · ${MATCH.subInjured}`}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          // Before kick-off the Gaffer says why there is nothing here yet.
          <p className="text-base is-dim">{started(data) ? MATCH.noChanges : GAFFER[data.voice].subsEmpty}</p>
        )}
      </Panel>
      <Panel heading={MATCH.minutesHeading}>
        <ul className="is-flex is-flex-column has-gap-2">
          {played.map((p) => {
            const ms = playedMs(data, p.id, now);
            const here = onPitch.has(p.id);
            return (
              <li key={p.id} className="minutes-row is-grid is-align-center has-gap-3">
                <span className="is-flex is-flex-column has-gap-1 is-min-w-0">
                  <span className={cx("text-sm is-truncate", here ? "is-chalk" : "is-dim")}>{p.name}</span>
                  <span className="minutes-row__track is-block has-radius-pill" aria-hidden="true">
                    <span
                      className={cx("minutes-row__fill is-block has-radius-pill", here && "minutes-row__fill--on")}
                      style={{ "--pct": `${Math.min(100, (ms / total) * 100)}%` } as CSSProperties}
                    />
                  </span>
                </span>
                <span className={cx("has-font-headline has-font-bold text-md text-right is-tabular", here ? "is-chalk" : "is-dim")}>
                  {MATCH.minute(playedMinutes(data, p.id, now))}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
