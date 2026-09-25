"use client";

import { NO_NUMBER } from "@/constants/content/board";
import type { Player } from "@/lib/board/types";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

interface PlayerChipProps {
  readonly player: Player;
  readonly onBench?: boolean;
}

/** A player off the pitch. Tap to select, tap another player or a position to move them. */
export function PlayerChip({ player, onBench = false }: PlayerChipProps) {
  const { state, act } = useBoard();
  return (
    <button
      type="button"
      className={cx("chip is-flex is-align-center has-gap-2 has-radius-field", {
        "chip--bench": onBench,
        "chip--selected": state.ui.selected === player.id,
      })}
      data-player={player.id}
      data-chip={player.id}
      aria-pressed={state.ui.selected === player.id}
      onClick={(e) => {
        // A tap on a chip is not a tap on the zone behind it.
        e.stopPropagation();
        act({ type: "tapPlayer", pid: player.id });
      }}
    >
      <span className="chip__num has-font-headline has-font-bold text-lg leading-tight text-center is-tabular">
        {player.num || NO_NUMBER}
      </span>
      <span className="chip__name text-base is-truncate">{player.name}</span>
    </button>
  );
}
