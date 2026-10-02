"use client";

import { useId } from "react";
import { CLUB, SHAPE } from "@/constants/content/board";
import { CUSTOM_FORMATION, FORMAT_KEYS, FORMATS, type FormatKey } from "@/constants/football";
import { teamSize } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { Panel } from "./Panel";
import { LineupsMenu, MoreMenu } from "./PickActions";
import { Pitch } from "./Pitch";

const LABEL = "is-flex is-align-center has-gap-2 has-font-headline has-font-bold text-xs tracking-caps uppercase is-dimmer";

/** The pitch for picking the team, with the format, the shape, the line-ups, bench cover and starting over above it. */
export function ShapePanel() {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const formatId = useId();
  const shapeId = useId();
  const isCustom = data.formation === CUSTOM_FORMATION;
  const shapes = [...FORMATS[data.format].shapes, CUSTOM_FORMATION];

  return (
    <Panel heading={SHAPE.heading} count={SHAPE.xiCount(Object.keys(data.xi).length, teamSize(data))}>
      <div className="is-flex is-flex-wrap is-align-center has-gap-3 has-mb-3">
        <label htmlFor={formatId} className={LABEL}>
          <span className="shape-toolbar__label">{CLUB.formatLabel}</span>
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
        <label htmlFor={shapeId} className={LABEL}>
          <span className="shape-toolbar__label">{SHAPE.formationLabel}</span>
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
        <Button variant="quiet" className="has-py-3" aria-pressed={data.showCover} onClick={() => act({ type: "toggleCover" })}>
          {data.showCover ? SHAPE.hideCover : SHAPE.showCover}
        </Button>
        <div className="shape-toolbar__end">
          <MoreMenu />
        </div>
      </div>

      <Pitch />
      <p className="text-sm is-dimmer has-mt-3">{ui.posMode ? SHAPE.moveHint : SHAPE.hint}</p>
    </Panel>
  );
}
