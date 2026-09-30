"use client";

import { useId, type CSSProperties } from "react";
import { KIT_COLOURS } from "@/constants/brand";
import { CLUB, CONFIRM } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { VOICES, type VoiceKey } from "@/constants/content/landing";
import { AGE_GROUPS, FORMAT_KEYS, FORMATS, type AgeKey, type FormatKey } from "@/constants/football";
import { exportSquadFile } from "@/lib/board/files";
import { clearStored, emptyData } from "@/lib/board/storage";
import { writeVoicePref } from "@/lib/voice";
import { Button } from "../Button";
import { BadgePicker } from "./BadgePicker";
import { useBoard } from "./BoardProvider";
import { ImportSquadButton } from "./ImportSquadButton";
import { ControlRow, Panel } from "./Panel";

export function ClubPanel() {
  const { state, act, sandbox } = useBoard();
  const { data } = state;
  const ageId = useId();
  const formatId = useId();

  function exportFile() {
    exportSquadFile(data, Date.now());
    act({ type: "backedUp" });
    act({ type: "notify", text: GAFFER[data.voice].exported });
  }

  function wipe() {
    if (!window.confirm(CONFIRM.wipe)) return;
    clearStored();
    // Everything goes but the gaffer: that is the coach's choice, not the squad's.
    act({ type: "load", data: { ...emptyData(), voice: data.voice } });
  }

  function pickVoice(voice: VoiceKey) {
    // Trying a gaffer on the example team is not choosing one.
    if (!sandbox) writeVoicePref(voice);
    act({ type: "setVoice", voice });
  }

  return (
    <Panel heading={CLUB.heading} className="has-mt-6">
      <ControlRow label={CLUB.ageLabel}>
        <label htmlFor={ageId} className="sr-only">
          {CLUB.ageLabel}
        </label>
        <select
          id={ageId}
          className="formation-select has-radius-field has-py-1 text-base"
          value={data.age ?? ""}
          onChange={(e) => act({ type: "setAge", age: e.target.value as AgeKey })}
        >
          {!data.age && (
            <option value="" disabled>
              {CLUB.ageNotSet}
            </option>
          )}
          {AGE_GROUPS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
        <label htmlFor={formatId} className="sr-only">
          {CLUB.formatLabel}
        </label>
        <select
          id={formatId}
          className="formation-select has-radius-field has-py-1 text-base"
          value={data.format}
          onChange={(e) => act({ type: "setFormat", format: e.target.value as FormatKey })}
        >
          {FORMAT_KEYS.map((k) => (
            <option key={k} value={k}>
              {FORMATS[k].label}
            </option>
          ))}
        </select>
      </ControlRow>
      <ControlRow label={CLUB.gaffer}>
        {VOICES.map((v) => (
          <Button key={v.key} size="tiny" on={v.key === data.voice} aria-pressed={v.key === data.voice} onClick={() => pickVoice(v.key)}>
            {v.name}
          </Button>
        ))}
      </ControlRow>
      <ControlRow label={CLUB.colourLabel}>
        <div className="is-flex is-flex-wrap has-gap-2">
          {KIT_COLOURS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              className="swatch has-radius-pill"
              style={{ "--swatch": c.kit } as CSSProperties}
              title={c.name}
              aria-label={CLUB.swatchLabel(CLUB.colourLabel, c.name)}
              aria-pressed={i === data.colour}
              onClick={() => act({ type: "setColour", index: i })}
            />
          ))}
        </div>
      </ControlRow>
      <ControlRow label={CLUB.awayLabel}>
        <div className="is-flex is-flex-wrap has-gap-2">
          {KIT_COLOURS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              className="swatch has-radius-pill"
              style={{ "--swatch": c.kit } as CSSProperties}
              title={c.name}
              aria-label={CLUB.swatchLabel(CLUB.awayLabel, c.name)}
              aria-pressed={i === data.awayColour}
              onClick={() => act({ type: "setAwayColour", index: i })}
            />
          ))}
        </div>
      </ControlRow>
      <ControlRow label={CLUB.badgeLabel}>
        <BadgePicker team={data.team} badge={data.badge} onChange={(value) => act({ type: "setBadge", value })} />
      </ControlRow>
      {/* A made-up team has nothing worth keeping, and wiping it would reach the coach's own board. */}
      {!sandbox && (
        <>
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
        </>
      )}
    </Panel>
  );
}
