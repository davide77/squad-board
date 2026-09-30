"use client";

import { Button } from "../Button";
import { cx } from "../cx";

interface ConfirmBoxProps {
  /** What will happen, said plainly. */
  readonly text: string;
  /** The button that does it. */
  readonly yes: string;
  /** The button that leaves things as they are. */
  readonly keep: string;
  readonly onYes: () => void;
  readonly onKeep: () => void;
  /** Out for anything that loses something; the default for a change of plan. */
  readonly variant?: "out" | "default";
  readonly className?: string;
}

/**
 * A check in place of a browser pop-up: what will happen, the button that does it, and the one that
 * keeps things as they are. It sits where the coach pressed, so nothing jumps and nothing is modal.
 */
export function ConfirmBox({ text, yes, keep, onYes, onKeep, variant = "out", className }: ConfirmBoxProps) {
  return (
    <div role="alert" className={cx("drawer__confirm is-flex is-flex-column has-gap-3 has-p-4 has-radius-field", className)}>
      <p className="text-base leading-snug">{text}</p>
      <div className="is-flex has-gap-2">
        <Button variant={variant} className="is-flex-1 has-py-3" onClick={onYes}>
          {yes}
        </Button>
        <Button className="is-flex-1 has-py-3" onClick={onKeep}>
          {keep}
        </Button>
      </div>
    </div>
  );
}
