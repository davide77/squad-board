"use client";

import { useId } from "react";
import { NAME_STYLES } from "@/constants/content/board";
import { useBoard } from "./BoardProvider";

interface NameStylesProps {
  readonly label: string;
  readonly hint?: string;
}

/** How names go out, and show on the shirts: first names, initials, full names or surnames. */
export function NameStyles({ label, hint }: NameStylesProps) {
  const { state, act } = useBoard();
  const id = useId();
  return (
    <div>
      <p id={id} className="has-font-headline text-xs tracking-caps uppercase is-dim has-mb-2">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="name-styles is-grid has-gap-2">
        {NAME_STYLES.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={state.data.nameStyle === o.key}
            className="choice has-radius-field has-font-semibold text-base"
            onClick={() => act({ type: "setNameStyle", style: o.key })}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="text-sm is-dim has-mt-2">{hint}</p>}
    </div>
  );
}
