"use client";

import type { ReactNode } from "react";
import { CONFIRM, GLYPHS, NO_NUMBER, ZONES } from "@/constants/content/board";
import { byId, where } from "@/lib/board/queries";
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
  const bench = state.data.bench.map((id) => byId(state.data, id)).filter((p): p is Player => !!p);
  return (
    <Panel heading={ZONES.bench} count={bench.length}>
      <DropZone zone="bench">
        {bench.length ? (
          bench.map((p) => <PlayerChip key={p.id} player={p} onBench />)
        ) : (
          <span className="text-base is-dimmer has-py-2">{ZONES.benchEmpty}</span>
        )}
      </DropZone>
    </Panel>
  );
}

interface RemovedChipProps {
  readonly player: Player;
}

function RemovedChip({ player }: RemovedChipProps) {
  const { act } = useBoard();
  const restore = () => act({ type: "restorePlayer", id: player.id });
  return (
    <span className="chip chip--gone is-flex is-align-center has-gap-2 has-radius-field" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="chip__num chip__bare has-font-headline has-font-bold text-lg is-tabular" onClick={restore} aria-label={ZONES.restore(player.name)}>
        {player.num || NO_NUMBER}
      </button>
      <button type="button" className="chip__name chip__bare text-base text-left is-truncate" onClick={restore} title={ZONES.restore(player.name)}>
        {player.name}
      </button>
      <button
        type="button"
        className="chip__delete"
        aria-label={ZONES.deleteForGood(player.name)}
        onClick={() => {
          if (window.confirm(CONFIRM.deleteForGood(player.name))) act({ type: "deletePlayer", id: player.id });
        }}
      >
        {GLYPHS.close}
      </button>
    </span>
  );
}

export function PoolPanel() {
  const { state } = useBoard();
  const { data } = state;
  const pool = data.players.filter((p) => !p.out && where(data, p.id) === "pool");

  return (
    <Panel heading={ZONES.pool} count={ZONES.poolCount(pool.length, data.removed.length)}>
      <DropZone zone="pool">
        {pool.length ? (
          pool.map((p) => <PlayerChip key={p.id} player={p} />)
        ) : (
          <span className="text-base is-dimmer has-py-2">{ZONES.poolEmpty}</span>
        )}
        {data.removed.length > 0 && (
          <>
            <span className="chips__divider has-font-headline text-xs tracking-caps uppercase is-dimmer has-mt-2">
              {ZONES.removed}
            </span>
            {data.removed.map((p) => (
              <RemovedChip key={p.id} player={p} />
            ))}
          </>
        )}
      </DropZone>
    </Panel>
  );
}
