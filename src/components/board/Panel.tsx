import type { ReactNode } from "react";
import { cx } from "../cx";

interface PanelProps {
  readonly heading: string;
  readonly count?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Panel({ heading, count, className, children }: PanelProps) {
  return (
    <section className={cx("panel has-pt-3", className)}>
      <div className="is-flex is-align-baseline is-justify-between has-gap-3 has-mb-3">
        <h2 className="text-xl tracking-heading">{heading}</h2>
        {count != null && <span className="text-sm is-dim is-tabular">{count}</span>}
      </div>
      {children}
    </section>
  );
}

interface ControlRowProps {
  readonly label?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

/** A labelled row of small controls under a panel. */
export function ControlRow({ label, className, children }: ControlRowProps) {
  return (
    <div className={cx("is-flex is-flex-wrap is-align-center has-gap-2 has-mt-2", className)}>
      {label && (
        <span className="control-label has-font-headline text-xs tracking-caps uppercase is-dimmer">{label}</span>
      )}
      {children}
    </div>
  );
}
