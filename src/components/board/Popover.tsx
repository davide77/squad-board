"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PHONE_QUERY } from "@/constants/config";
import { MOTION } from "@/constants/motion";
import { useEscapeKey, useFocusTrap, useMediaQuery } from "@/lib/hooks";
import { cx } from "../cx";
import { useSheetDrag } from "./useSheetDrag";

interface PopoverProps {
  /** Names the panel for a screen reader. */
  readonly label: string;
  readonly trigger: ReactNode;
  /** For a trigger that shows only a glyph. */
  readonly triggerLabel?: string;
  readonly triggerClassName?: string;
  /** Which edge of the trigger the panel lines up with. */
  readonly align?: "start" | "end";
  readonly children: (close: () => void) => ReactNode;
}

interface Anchor {
  readonly top: number;
  readonly left: number;
  readonly right: number;
}

// On a wider screen the panel grows quickly out of its button, and shrinks back into it.
const GROW = {
  initial: { opacity: 0, scale: MOTION.popScale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: MOTION.popScale },
  transition: MOTION.pop,
} as const;

/**
 * A small panel under a toolbar button. It is fixed to the trigger's place on screen, so a scrolling column
 * never clips it, and closes on Escape, a tap outside, or a scroll. On a phone it rises as a sheet from the
 * bottom edge instead, which can be pulled back down.
 */
export function Popover({ label, trigger, triggerLabel, triggerClassName, align = "start", children }: PopoverProps) {
  // Where the panel sits is kept after it closes, so it shrinks back into its button rather than jumping.
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  const phone = useMediaQuery(PHONE_QUERY);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheet = useSheetDrag("bottom", close, panelRef);

  useEscapeKey(open, close);
  useFocusTrap(open, panelRef);

  // A panel left behind by a scroll or a resize would point at nothing, so it closes.
  useEffect(() => {
    if (!open) return;
    function onScroll(e: Event) {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      close();
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  function toggle() {
    if (open) return close();
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setAnchor({ top: r.bottom, left: r.left, right: window.innerWidth - r.right });
    setOpen(true);
  }

  const place = anchor
    ? ({ "--pop-top": `${anchor.top}px`, [align === "end" ? "--pop-right" : "--pop-left"]: `${align === "end" ? anchor.right : anchor.left}px` } as CSSProperties)
    : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggle}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="popover__backdrop"
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION.fade}
          />
        )}
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            className={cx("popover__panel is-flex is-flex-column has-gap-4 has-p-4", `popover__panel--${align}`)}
            style={place}
            {...(phone ? sheet.motion : GROW)}
          >
            {phone && (
              <div className="sheet-grabber is-flex is-align-center is-justify-center is-shrink-0" aria-hidden="true" onPointerDown={sheet.grab} />
            )}
            {children(close)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
