"use client";

import type { CSSProperties } from "react";
import { KIT_COLOURS } from "@/constants/brand";
import { CLUB, CONFIRM, TOASTS } from "@/constants/content/board";
import { exportSquadFile } from "@/lib/board/files";
import { clearStored, emptyData } from "@/lib/board/storage";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ImportSquadButton } from "./ImportSquadButton";
import { ControlRow, Panel } from "./Panel";

export function ClubPanel() {
  const { state, act } = useBoard();
  const { data } = state;

  function exportFile() {
    exportSquadFile(data, Date.now());
    act({ type: "backedUp" });
    act({ type: "notify", text: TOASTS.exported });
  }

  function wipe() {
    if (!window.confirm(CONFIRM.wipe)) return;
    clearStored();
    act({ type: "load", data: emptyData() });
  }

  return (
    <Panel heading={CLUB.heading} className="has-mt-6">
      <ControlRow label={CLUB.colourLabel}>
        <div className="is-flex is-flex-wrap has-gap-2">
          {KIT_COLOURS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              className="swatch has-radius-pill"
              style={{ "--swatch": c.kit } as CSSProperties}
              title={c.name}
              aria-label={c.name}
              aria-pressed={i === data.colour}
              onClick={() => act({ type: "setColour", index: i })}
            />
          ))}
        </div>
      </ControlRow>
      <ControlRow label={CLUB.backupLabel}>
        <Button size="tiny" onClick={exportFile}>
          {CLUB.export}
        </Button>
        <ImportSquadButton />
        <Button size="tiny" variant="quiet" onClick={wipe}>
          {CLUB.wipe}
        </Button>
      </ControlRow>
      <p className="text-sm is-dimmer has-mt-3">{CLUB.hint}</p>
    </Panel>
  );
}
