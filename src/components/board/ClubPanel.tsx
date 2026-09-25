"use client";

import { useRef, type CSSProperties } from "react";
import { KIT_COLOURS } from "@/constants/brand";
import { CLUB, CONFIRM, TOASTS } from "@/constants/content/board";
import { clearStored, emptyData, readBoard, snapshot } from "@/lib/board/storage";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ControlRow, Panel } from "./Panel";

function fileName(team: string): string {
  const slug = team.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return (slug || CLUB.fileFallback) + CLUB.fileSuffix;
}

export function ClubPanel() {
  const { state, act } = useBoard();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data } = state;

  function exportFile() {
    const blob = new Blob([JSON.stringify(snapshot(data, Date.now()), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName(data.team);
    a.click();
    URL.revokeObjectURL(url);
    act({ type: "notify", text: TOASTS.exported });
  }

  async function importFile(file: File) {
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      act({ type: "notify", text: TOASTS.unreadable });
      return;
    }
    const board = readBoard(raw);
    if (!board) {
      act({ type: "notify", text: TOASTS.notASquad });
      return;
    }
    if (data.players.length && !window.confirm(CONFIRM.replaceSquad)) return;
    act({ type: "load", data: board, notice: TOASTS.imported });
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
        <Button size="tiny" variant="quiet" onClick={() => fileRef.current?.click()}>
          {CLUB.import}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="is-hidden"
          aria-label={CLUB.importLabel}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void importFile(file);
          }}
        />
        <Button size="tiny" variant="quiet" onClick={wipe}>
          {CLUB.wipe}
        </Button>
      </ControlRow>
      <p className="text-sm is-dimmer has-mt-3">{CLUB.hint}</p>
    </Panel>
  );
}
