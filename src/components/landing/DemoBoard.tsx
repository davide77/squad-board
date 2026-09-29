"use client";

import type { CSSProperties } from "react";
import { DEMO, DEMO_SHAPES } from "@/constants/content/landing";
import { FORMATIONS } from "@/constants/football";
import { Button } from "../Button";
import { PitchMarkings } from "../board/Pitch";
import { cx } from "../cx";
import { useLanding } from "./LandingProvider";

const MINUTE_DIGITS = 2;

interface DemoBoardProps {
  /** What the Gaffer just said, shown on the band across the top. */
  readonly line: string;
}

/** A small working board with a made-up team: tap a player, sub them off, change the shape. */
export function DemoBoard({ line }: DemoBoardProps) {
  const { demo, act } = useLanding();
  const specs = FORMATIONS[demo.shape];
  const selected = demo.sel === null ? null : demo.xi[demo.sel];
  const benchEmpty = demo.bench.length === 0;

  return (
    <div className="landing-demo is-flex is-flex-column has-gap-2 is-w-full is-min-w-0">
      <div className="landing-demo__card bg-board-2 has-radius-sheet is-flex is-flex-column">
        <p
          aria-hidden="true"
          className="bg-kit is-kit-ink has-py-3 has-px-4 has-font-headline has-font-bold text-lg leading-compact uppercase"
        >
          &ldquo;{line}&rdquo;
        </p>

        <div className="landing-demo__rule is-flex is-align-center is-justify-between has-gap-3 has-py-3 has-px-4">
          <div className="is-flex is-align-center has-gap-3 is-min-w-0">
            <span
              aria-hidden="true"
              className="crest is-flex is-align-center is-justify-center is-shrink-0 has-radius-pill has-font-headline has-font-bold text-base"
            >
              {DEMO.crest}
            </span>
            <span className="is-flex is-flex-column is-min-w-0">
              <span className="has-font-headline has-font-bold text-xl leading-compact is-truncate">{DEMO.fixture}</span>
              <span className="text-xs is-dim">{DEMO.detail}</span>
            </span>
          </div>
          <span
            aria-label={DEMO.minuteLabel}
            className="bg-board has-py-1 has-px-3 has-radius-sm has-font-headline has-font-bold text-2xl is-tabular"
          >
            {DEMO.minute(String(demo.minute).padStart(MINUTE_DIGITS, "0"))}
          </span>
        </div>

        <div role="group" aria-label={DEMO.shapesLabel} className="is-flex has-gap-1 has-pt-3 has-px-4">
          {DEMO_SHAPES.map((s) => (
            <Button
              key={s}
              size="tiny"
              on={s === demo.shape}
              aria-pressed={s === demo.shape}
              className="has-font-headline tracking-tag"
              onClick={() => act({ type: "shape", shape: s })}
            >
              {s}
            </Button>
          ))}
        </div>

        <div className="has-pt-3 has-pb-4 has-px-4">
          <div className="pitch is-w-full has-radius-panel">
            <PitchMarkings />
            {demo.xi.map((p, i) => {
              const spec = specs[i];
              const position = { "--x": `${spec.x}%`, "--y": `${100 - spec.y}%` } as CSSProperties;
              return (
                <button
                  key={spec.role + i}
                  type="button"
                  className={cx("pitch-slot pitch-slot--filled is-flex is-flex-column is-align-center has-gap-1", {
                    "pitch-slot--keeper": spec.role === "GK",
                    "pitch-slot--selected": demo.sel === i,
                  })}
                  style={position}
                  aria-pressed={demo.sel === i}
                  aria-label={DEMO.playerLabel(p.num, p.name)}
                  onClick={() => act({ type: "tap", index: i })}
                >
                  <span className="pitch-slot__disc is-flex is-align-center is-justify-center has-radius-pill has-font-headline has-font-bold text-xl leading-tight is-tabular">
                    {p.num}
                  </span>
                  <span className="pitch-slot__name text-2xs leading-snug text-center has-radius-sm">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="landing-demo__actions landing-demo__rule-top is-flex is-flex-column has-gap-3 has-pt-3 has-pb-4 has-px-4">
          {selected && (
            <div className="is-flex is-flex-wrap is-align-center has-gap-2">
              <span className="text-base is-dim has-mr-1">{selected.name}:</span>
              <Button variant="primary" disabled={benchEmpty} onClick={() => act({ type: "change", kind: "sub" })}>
                {DEMO.subOff}
              </Button>
              <Button variant="out" disabled={benchEmpty} onClick={() => act({ type: "change", kind: "injury" })}>
                {DEMO.injured}
              </Button>
              <Button variant="quiet" onClick={() => act({ type: "clear" })}>
                {DEMO.cancel}
              </Button>
            </div>
          )}
          <p className="is-flex is-flex-wrap has-gap-3 text-sm is-dim">
            <span className="has-font-semibold is-chalk">{DEMO.bench}</span>
            {demo.bench.map((b) => (
              <span key={b.num}>{DEMO.playerLabel(b.num, b.name)}</span>
            ))}
            {benchEmpty && <span>{DEMO.benchEmpty}</span>}
          </p>
        </div>
      </div>

      <div className="is-flex is-justify-between has-gap-3 text-xs is-dimmer">
        <span>{DEMO.hint}</span>
        <button type="button" className="landing-link-button is-dim text-xs" onClick={() => act({ type: "reset" })}>
          {DEMO.reset}
        </button>
      </div>
      <p className="text-xs is-dimmer">{DEMO.disclaimer}</p>
    </div>
  );
}
