"use client";

import { useId } from "react";
import { CLUB, SHAPE } from "@/constants/content/board";
import { CUSTOM_FORMATION, FORMAT_KEYS, FORMATS, type FormatKey } from "@/constants/football";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { LineupsMenu, MoreMenu } from "./PickActions";
import { Pitch } from "./Pitch";


/** The pitch for picking the team, with the format, the shape, the line-ups, bench cover and starting over above it. */
export function ShapePanel() {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const formatId = useId();
  const shapeId = useId();
  const isCustom = data.formation === CUSTOM_FORMATION;
  const shapes = [...FORMATS[data.format].shapes, CUSTOM_FORMATION];
  // Bench cover names who can step into each position, so with no positions set it has nothing to show.
  const anyPositions = data.players.some((p) => p.pos.length > 0);

  return (
    // No heading: the toolbar says what this is, and the bar along the foot counts who is on.
    <section aria-label={SHAPE.label} className="has-pt-3">
      <div className="is-flex is-flex-wrap is-align-stretch has-gap-3 has-mb-3">
        <label htmlFor={formatId} className="is-flex">
          {/* The select shows "11-a-side", which says it. The word is for screen readers. */}
          <span className="sr-only">{CLUB.formatLabel}</span>
          <select
            id={formatId}
            className="formation-select has-font-headline has-font-semibold text-lg has-radius-field has-py-2"
            value={data.format}
            onChange={(e) => act({ type: "setFormat", format: e.target.value as FormatKey })}
          >
            {FORMAT_KEYS.map((k) => (
              <option key={k} value={k}>
                {FORMATS[k].label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={shapeId} className="is-flex">
          <span className="sr-only">{SHAPE.formationLabel}</span>
          <select
            id={shapeId}
            className="formation-select has-font-headline has-font-semibold text-xl tracking-tag has-radius-field has-py-2"
            value={data.formation}
            onChange={(e) => act({ type: "setFormation", name: e.target.value })}
          >
            {shapes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {isCustom && (
          <>
            <Button className="has-py-3" on={ui.posMode} aria-pressed={ui.posMode} onClick={() => act({ type: "togglePosMode" })}>
              {ui.posMode ? SHAPE.doneMoving : SHAPE.movePositions}
            </Button>
            <Button variant="quiet" className="has-py-3" onClick={() => act({ type: "resetCustom" })}>
              {SHAPE.resetShape}
            </Button>
          </>
        )}
        <LineupsMenu />
        {anyPositions && (
          <Button variant="quiet" className="has-py-3" aria-pressed={data.showCover} onClick={() => act({ type: "toggleCover" })}>
            {data.showCover ? SHAPE.hideCover : SHAPE.showCover}
          </Button>
        )}
        <div className="shape-toolbar__end is-flex">
          <MoreMenu />
        </div>
      </div>

      <Pitch />
      <p className="text-sm is-dim has-mt-3">{ui.posMode ? SHAPE.moveHint : SHAPE.hint}</p>
    </section>
  );
}
