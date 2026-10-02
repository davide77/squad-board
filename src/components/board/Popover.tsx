"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useEscapeKey, useFocusTrap } from "@/lib/hooks";
import { cx } from "../cx";

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

/**
 * A small panel under a toolbar button. It is fixed to the trigger's place on screen, so a scrolling column
 * never clips it, and closes on Escape, a tap outside, or a scroll. On a phone it rises as a sheet from the
 * bottom edge instead.
 */
export function Popover({ label, trigger, triggerLabel, triggerClassName, align = "start", children }: PopoverProps) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const open = anchor !== null;
  const close = useCallback(() => setAnchor(null), []);

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
    if (r) setAnchor({ top: r.bottom, left: r.left, right: window.innerWidth - r.right });
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
      {open && (
        <>
          <div className="popover__backdrop" aria-hidden="true" onClick={close} />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            className={cx("popover__panel is-flex is-flex-column has-gap-4 has-p-4", `popover__panel--${align}`)}
            style={place}
          >
            {children(close)}
          </div>
        </>
      )}
    </>
  );
}
