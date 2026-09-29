"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXAMPLE } from "@/constants/content/board";
import type { VoiceKey } from "@/constants/content/landing";
import { GAFFER } from "@/constants/content/gaffer";
import { MOTION } from "@/constants/motion";
import { useEscapeKey, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { exampleBoard } from "@/lib/board/start";
import { Button } from "../Button";
import { BoardProvider, useBoard } from "./BoardProvider";
import { BoardView } from "./BoardView";

const newId = () => crypto.randomUUID();

interface ExampleBarProps {
  readonly titleId: string;
  readonly onClose: () => void;
}

/** Stays at the top of the sheet while the coach scrolls the example, with the way back out. */
function ExampleBar({ titleId, onClose }: ExampleBarProps) {
  const { state } = useBoard();
  // Escape closes the picker first, when it is open over the example.
  useEscapeKey(!state.ui.pickerSlot, onClose);

  return (
    <div className="example-sheet__bar is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 has-py-3 has-mb-4">
      <div className="is-flex-1 is-min-w-0">
        <p id={titleId} className="has-font-headline has-font-bold text-base tracking-caps uppercase is-kit">
          {EXAMPLE.sheetTag}
        </p>
        <p className="text-base is-dim measure-62ch">{EXAMPLE.sheetNote}</p>
      </div>
      <Button variant="primary" onClick={onClose}>
        {EXAMPLE.close}
      </Button>
    </div>
  );
}

interface ExampleSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly voice: VoiceKey;
}

/**
 * The example team, in a sheet over the start screen. It plays in memory only, so
 * closing it leaves the coach exactly where they were, half-typed squad and all.
 */
export function ExampleSheet({ open, onClose, voice }: ExampleSheetProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useScrollLock(open);
  useFocusTrap(open, cardRef);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="example-sheet is-flex is-justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.fade}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-scroller=""
            className="example-sheet__card is-w-full bg-board"
            initial={{ y: MOTION.sheetY }}
            animate={{ y: 0 }}
            exit={{ y: MOTION.sheetY }}
            transition={MOTION.sheet}
          >
            <ExampleBoard voice={voice} titleId={titleId} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ExampleBoardProps {
  readonly voice: VoiceKey;
  readonly titleId: string;
  readonly onClose: () => void;
}

/** A fresh copy of the example each time the sheet opens. */
function ExampleBoard({ voice, titleId, onClose }: ExampleBoardProps) {
  const [sandbox] = useState(() => ({ data: { ...exampleBoard(newId), voice }, notice: GAFFER[voice].exampleLoaded }));
  return (
    <BoardProvider sandbox={sandbox}>
      <BoardView top={<ExampleBar titleId={titleId} onClose={onClose} />} />
    </BoardProvider>
  );
}
