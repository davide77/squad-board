"use client";

import { useRef, type KeyboardEvent } from "react";
import { STEPS } from "@/constants/content/board";
import type { BoardStep } from "@/lib/board/types";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

/** The panel the tabs control, in BoardView. */
export const STEP_PANEL_ID = "board-step-panel";
export const stepTabId = (step: BoardStep) => `board-step-${step}`;

/**
 * Pick the team, Matchday, Send: the three steps of a matchday, as tabs. Arrow keys, Home and End
 * move between them, as in any tab list. The full names show where there is room, the short ones on a phone.
 */
export function StepTabs() {
  const { state, act } = useBoard();
  const listRef = useRef<HTMLDivElement>(null);
  const current = state.ui.step;
  const keys = STEPS.items.map((s) => s.key);

  function go(step: BoardStep) {
    act({ type: "setStep", step });
    listRef.current?.querySelector<HTMLElement>(`#${stepTabId(step)}`)?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = keys.indexOf(current);
    const to = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: keys.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(keys[(to + keys.length) % keys.length]);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={STEPS.label}
      className="step-tabs is-flex has-gap-1 has-p-1 has-radius-field"
      onKeyDown={onKeyDown}
    >
      {STEPS.items.map((s) => {
        const on = s.key === current;
        return (
          <button
            key={s.key}
            id={stepTabId(s.key)}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={STEP_PANEL_ID}
            tabIndex={on ? 0 : -1}
            className={cx(
              "step-tabs__tab is-flex is-flex-1 is-align-center is-justify-center has-gap-2 has-px-4 has-radius-field has-font-bold text-md",
              on && "step-tabs__tab--on",
            )}
            onClick={() => act({ type: "setStep", step: s.key })}
          >
            <span className="has-font-headline is-tabular" aria-hidden="true">
              {s.n}
            </span>
            <span className="is-hidden is-lg-inline">{s.label}</span>
            <span className="is-lg-hidden">{s.short}</span>
          </button>
        );
      })}
    </div>
  );
}
