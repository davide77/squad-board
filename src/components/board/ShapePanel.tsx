"use client";

import { useId } from "react";
import { CONFIRM, NAME_STYLES, SHAPE } from "@/constants/content/board";
import { CUSTOM_FORMATION, FORMATION_NAMES } from "@/constants/football";
import { matchUnderway, unsaved } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ControlRow, Panel } from "./Panel";
import { Pitch } from "./Pitch";

export function ShapePanel() {
  const { state, act } = useBoard();
  const { data, ui } = state;
  const selectId = useId();
  const isCustom = data.formation === CUSTOM_FORMATION;
  const dirty = unsaved(data);
  const styleLabel = (NAME_STYLES.find((o) => o.key === data.nameStyle) ?? NAME_STYLES[0]).label;

  function backToStrongest() {
    if (data.preset && matchUnderway(data) && !window.confirm(CONFIRM.matchUnderway)) return;
    act({ type: "backToStrongest" });
  }

  function newMatchday() {
    if (window.confirm(CONFIRM.newMatchday)) act({ type: "newMatchday" });
  }

  return (
    <Panel heading={SHAPE.heading} count={SHAPE.xiCount(Object.keys(data.xi).length)}>
      <div className="is-flex is-flex-wrap is-align-center has-gap-2 has-mb-3">
        <label htmlFor={selectId} className="sr-only">
          {SHAPE.formationLabel}
        </label>
        <select
          id={selectId}
          className="formation-select has-font-headline has-font-semibold text-xl tracking-tag has-radius-field has-py-2"
          value={data.formation}
          onChange={(e) => act({ type: "setFormation", name: e.target.value })}
        >
          {FORMATION_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {isCustom && (
          <>
            <Button size="tiny" on={ui.posMode} aria-pressed={ui.posMode} onClick={() => act({ type: "togglePosMode" })}>
              {ui.posMode ? SHAPE.doneMoving : SHAPE.movePositions}
            </Button>
            <Button size="tiny" variant="quiet" onClick={() => act({ type: "resetCustom" })}>
              {SHAPE.resetShape}
            </Button>
          </>
        )}
      </div>

      <Pitch />
      <p className="text-sm is-dimmer has-mt-3">{ui.posMode ? SHAPE.moveHint : SHAPE.hint}</p>

      <ControlRow label={SHAPE.teamLabel}>
        <Button size="tiny" variant={dirty ? "primary" : "quiet"} onClick={() => act({ type: "saveLineup" })}>
          {dirty ? SHAPE.saveLineup : SHAPE.lineupSaved}
        </Button>
        <Button size="tiny" onClick={() => act({ type: "setStrongest" })}>
          {SHAPE.setStrongest}
        </Button>
        <Button size="tiny" onClick={backToStrongest}>
          {SHAPE.backToStrongest}
        </Button>
        <Button size="tiny" onClick={newMatchday}>
          {SHAPE.newMatchday}
        </Button>
        <Button size="tiny" variant="quiet" onClick={() => act({ type: "clearPitch" })}>
          {SHAPE.clearPitch}
        </Button>
      </ControlRow>
      <ControlRow label={SHAPE.shirtsLabel}>
        <Button size="tiny" variant="quiet" onClick={() => act({ type: "cycleNameStyle" })}>
          {styleLabel}
        </Button>
        <Button size="tiny" variant="quiet" onClick={() => act({ type: "toggleCover" })}>
          {data.showCover ? SHAPE.hideCover : SHAPE.showCover}
        </Button>
      </ControlRow>
    </Panel>
  );
}
