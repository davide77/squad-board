"use client";

import type { ReactNode } from "react";
import { ZONES } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { BOARD_CONFIG } from "@/constants/config";
import { byId, phaseOf, started, where, yetToPlay } from "@/lib/board/queries";
import { firstName } from "@/lib/board/names";
import { useNow } from "@/lib/hooks";
import type { Player, Zone } from "@/lib/board/types";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { Panel } from "./Panel";
import { PlayerChip } from "./PlayerChip";

interface DropZoneProps {
  readonly zone: Zone;
  readonly children: ReactNode;
}

function DropZone({ zone, children }: DropZoneProps) {
  const { state, act } = useBoard();
  const isDrop = state.ui.dropTarget?.kind === zone;
  return (
    // Tapping the empty part of a zone drops the selected player there. The same move is
    // on a key through each chip and through the position picker.
    <div
      className={cx("chips is-flex is-flex-wrap is-align-start has-gap-2 has-radius-panel has-p-1", isDrop && "chips--drop")}
      data-zone={zone}
      onClick={() => act({ type: "tapZone", zone })}
    >
      {children}
    </div>
  );
}

export function BenchPanel() {
  const { state } = useBoard();
  const { data } = state;
  const bench = data.bench.map((id) => byId(data, id)).filter((p): p is Player => !!p);
  return (
    <Panel heading={ZONES.bench} count={bench.length}>
      {phaseOf(data) === "development" && started(data) && <FairTime />}
      <DropZone zone="bench">
        {bench.length ? (
          bench.map((p) => <PlayerChip key={p.id} player={p} onBench />)
        ) : (
          <span className="text-base is-dimmer has-py-2">{GAFFER[state.data.voice].benchEmpty}</span>
        )}
      </DropZone>
    </Panel>
  );
}

/**
 * Development football is about everyone getting a go, so once the clock is running
 * the Gaffer keeps an eye on who is still waiting, and says so when nobody is.
 */
function FairTime() {
  const { state } = useBoard();
  const { data } = state;
  const now = useNow(data.clock.running, BOARD_CONFIG.minutesTickMs);
  const say = GAFFER[data.voice];
  const waiting = yetToPlay(data, now);
  const line = waiting.length ? say.waiting(firstName(waiting[0].name), waiting.length - 1) : say.everyonePlayed;
  return (
    <p className={cx("text-base has-font-semibold has-mb-2", waiting.length ? "is-chalk" : "is-kit")} role="status">
      {line}
    </p>
  );
}

export function PoolPanel() {
  const { state } = useBoard();
  const { data } = state;
  const pool = data.players.filter((p) => !p.out && where(data, p.id) === "pool");

  return (
    <Panel heading={ZONES.pool} count={pool.length}>
      <DropZone zone="pool">
        {pool.length ? (
          pool.map((p) => <PlayerChip key={p.id} player={p} />)
        ) : (
          <span className="text-base is-dimmer has-py-2">{GAFFER[data.voice].poolEmpty}</span>
        )}
      </DropZone>
    </Panel>
  );
}
