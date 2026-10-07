"use client";

import { useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "@/constants/motion";
import { useEscapeKey, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { Icon } from "../Icon";
import { useSheetDrag } from "./useSheetDrag";

interface SideSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  /** A line under the title. */
  readonly hint?: string;
  readonly closeLabel: string;
  /** Pinned to the foot of the sheet while the body scrolls: the buttons the sheet is for. */
  readonly foot?: ReactNode;
  readonly children: ReactNode;
}

/**
 * A sheet that slides in from the right edge over a dimmed board, full width on a phone. It traps focus,
 * closes on Escape, a tap outside or a swipe back off to the right, and locks the page behind it.
 */
export function SideSheet({ open, onClose, title, hint, closeLabel, foot, children }: SideSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const sheet = useSheetDrag("right", onClose, panelRef);

  useEscapeKey(open, onClose);
  useScrollLock(open);
  useFocusTrap(open, panelRef);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="drawer is-flex is-justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.fade}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="drawer__panel is-flex is-flex-column has-gap-6 is-w-full has-p-5"
            {...sheet.motion}
            onPointerDown={sheet.swipe}
          >
            <div className="is-flex is-align-start is-justify-between has-gap-3">
              <div className="is-min-w-0">
                <h2 id={titleId} className="text-3xl is-truncate">
                  {title}
                </h2>
                {hint && <p className="text-base is-dim has-mt-1">{hint}</p>}
              </div>
              <button
                type="button"
                className="drawer__close is-flex is-align-center is-justify-center has-radius-field"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <Icon name="close" />
              </button>
            </div>
            {children}
            {foot && <div className="drawer__dock has-pt-4">{foot}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
