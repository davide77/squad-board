"use client";

import { useEffect, useState } from "react";
import { UNDO_MS } from "@/constants/config";
import { UNDO } from "@/constants/content/board";
import { useBoard } from "./BoardProvider";
import { Icon } from "../Icon";

/**
 * After a change to the team, what changed and a way to take it back, for a few seconds.
 * Not a live region: the toast has already said it, so a screen reader hears it once.
 */
export function UndoBar() {
  const { state, act } = useBoard();
  const undo = state.ui.undo;
  const undoId = undo?.id ?? null;
  const [goneId, setGoneId] = useState<number | null>(null);

  useEffect(() => {
    if (undoId === null) return;
    const timer = setTimeout(() => setGoneId(undoId), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undoId]);

  if (!undo || undo.id === goneId) return null;
  return (
    <div className="undo-bar is-flex is-align-center has-gap-4 has-py-2 has-pl-4 has-pr-2 has-radius-field">
      <span className="text-md has-font-semibold is-truncate">{undo.text}</span>
      <button type="button" className="undo-bar__button is-inline-flex is-align-center has-gap-2 has-radius-field has-px-4 has-font-bold text-md"
        onClick={() => act({ type: "undo" })}
      >
        <Icon name="undo" size="button" />
        {UNDO.button}
      </button>
    </div>
  );
}
