"use client";

import { EXAMPLE } from "@/constants/content/board";
import { clearStored, emptyData } from "@/lib/board/storage";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";

/** Sits above the board while the made-up team is loaded, with the way out to the coach's own. */
export function ExampleBanner() {
  const { act } = useBoard();

  function startOwn() {
    clearStored();
    act({ type: "load", data: emptyData() });
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 bg-board-2 has-radius-panel has-py-3 has-px-4 has-mb-4">
      <p className="text-base is-dim">{EXAMPLE.note}</p>
      <Button variant="primary" onClick={startOwn}>
        {EXAMPLE.ownTeam}
      </Button>
    </div>
  );
}
