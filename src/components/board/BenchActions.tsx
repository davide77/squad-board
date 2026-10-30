"use client";

import { PICKER } from "@/constants/content/board";
import { firstName } from "@/lib/board/names";
import type { Player } from "@/lib/board/types";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";

interface BenchActionsProps {
  /** Who is in the tapped position. */
  readonly player: Player;
}

/** The first thing a tapped player offers, before any list: "Bench Toby", or out of the squad list. */
export function BenchActions({ player }: BenchActionsProps) {
  const { act } = useBoard();
  return (
    <div className="is-flex is-flex-wrap has-gap-2">
      <Button variant="primary" icon="bench" className="is-flex-1 has-py-3 text-md" onClick={() => act({ type: "pickerOff", to: "bench" })}>
        {PICKER.toBench(firstName(player.name))}
      </Button>
      <Button variant="quiet" className="has-py-3" onClick={() => act({ type: "pickerOff", to: "pool" })}>
        {PICKER.toPool}
      </Button>
    </div>
  );
}
