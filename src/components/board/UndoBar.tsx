"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PHONE_QUERY, UNDO_MS } from "@/constants/config";
import { UNDO } from "@/constants/content/board";
import { MOTION } from "@/constants/motion";
import { useMediaQuery } from "@/lib/hooks";
import { useBoard } from "./BoardProvider";
import { Icon } from "../Icon";

// The line along the foot drains over the same time the bar stays (_board.scss reads it).
const TIMER = { "--undo-ms": `${UNDO_MS}ms` } as CSSProperties;

/**
 * After a change to the team, what changed and a way to take it back, for a few seconds.
 * Not a live region: the toast has already said it, so a screen reader hears it once.
 */
export function UndoBar() {
  const { state, act } = useBoard();
  const undo = state.ui.undo;
  const undoId = undo?.id ?? null;
  const [goneId, setGoneId] = useState<number | null>(null);
  // It sits at the top of a phone and the foot of a bigger screen, and slides in from that edge.
  const phone = useMediaQuery(PHONE_QUERY);
  const from = phone ? -MOTION.toastY : MOTION.toastY;

  useEffect(() => {
    if (undoId === null) return;
    const timer = setTimeout(() => setGoneId(undoId), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undoId]);

  return (
    <AnimatePresence>
      {undo && undo.id !== goneId && (
        <motion.div
          key={undo.id}
          className="undo-bar is-flex is-align-center has-gap-4 has-py-2 has-pl-4 has-pr-2 has-radius-field"
          style={TIMER}
          initial={{ opacity: 0, y: from }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: from }}
          transition={MOTION.toast}
        >
          <span className="text-md has-font-semibold is-truncate">{undo.text}</span>
          <button type="button" className="undo-bar__button is-inline-flex is-align-center has-gap-2 has-radius-field has-px-4 has-font-bold text-md"
            onClick={() => act({ type: "undo" })}
          >
            <Icon name="undo" size="button" />
            {UNDO.button}
          </button>
          <span className="undo-bar__timer" aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
