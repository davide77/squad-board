"use client";

import { useCallback, useId, useState, type CSSProperties } from "react";
import { KIT_COLOURS } from "@/constants/brand";
import { MORE_TEAMS } from "@/constants/content/account";
import { CLUB, CONFIRM, KIT } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { VOICES, type VoiceKey } from "@/constants/content/landing";
import { AGE_GROUPS, FORMAT_KEYS, FORMATS, type AgeKey, type FormatKey } from "@/constants/football";
import { exportSquadFile } from "@/lib/board/files";
import { clearStored, emptyData } from "@/lib/board/storage";
import type { KitSide } from "@/lib/board/types";
import { writeVoicePref } from "@/lib/voice";
import { ClubWaitlist } from "@/components/landing/ClubWaitlist";
import { Button } from "../Button";
import { BadgePicker } from "./BadgePicker";
import { ConfirmBox } from "./ConfirmBox";
import { useBoard } from "./BoardProvider";
import { ImportSquadButton } from "./ImportSquadButton";
import { KitEditor } from "./KitEditor";
import { SendSquad } from "./SendSquad";
import { ControlRow } from "./Panel";
import { SideSheet } from "./SideSheet";

/** What is set once a season: age group, gaffer, colours, kits, badge, more teams and the backup. */
function ClubSettings() {
  const { state, act, sandbox } = useBoard();
  const { data } = state;
  const ageId = useId();
  const formatId = useId();

  function exportFile() {
    exportSquadFile(data, Date.now());
    act({ type: "backedUp" });
    act({ type: "notify", text: GAFFER[data.voice].exported });
  }

  // One strip open at a time, so the panel never runs to ten rows of swatches.
  const [editingKit, setEditingKit] = useState<KitSide | null>(null);

  // One team is free. A second is the club waitlist for now, opened in place under the button.
  const [askingMoreTeams, setAskingMoreTeams] = useState(false);
  const moreTeamsId = useId();

  // Asked in place, under the button, before anything is deleted.
  const [confirmingWipe, setConfirmingWipe] = useState(false);

  function wipe() {
    setConfirmingWipe(false);
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
    <section>
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
      <p className="text-sm is-dimmer has-mt-1">{CLUB.colourHint}</p>
      {KIT.sides.map((k) => (
        <KitEditor
          key={k.key}
          side={k.key}
          label={k.label}
          open={editingKit === k.key}
          onToggle={() => setEditingKit(editingKit === k.key ? null : k.key)}
        />
      ))}
      <ControlRow label={CLUB.badgeLabel}>
        <BadgePicker team={data.team} badge={data.badge} onChange={(value) => act({ type: "setBadge", value })} />
      </ControlRow>
      {/* A made-up team has nothing worth keeping, and wiping it would reach the coach's own board. */}
      {!sandbox && (
        <>
          <ControlRow label={MORE_TEAMS.label}>
            <Button
              size="tiny"
              aria-expanded={askingMoreTeams}
              aria-controls={moreTeamsId}
              onClick={() => setAskingMoreTeams(!askingMoreTeams)}
            >
              {askingMoreTeams ? MORE_TEAMS.close : MORE_TEAMS.button}
            </Button>
          </ControlRow>
          {askingMoreTeams && (
            <div id={moreTeamsId} className="is-flex is-flex-column has-gap-3 has-mt-2 has-mb-3">
              <p className="text-md is-chalk has-font-semibold">{MORE_TEAMS.line}</p>
              <ClubWaitlist prompt={MORE_TEAMS.prompt} cta={MORE_TEAMS.cta} />
            </div>
          )}
          <SendSquad />
          <ControlRow label={CLUB.backupLabel}>
            <Button size="tiny" onClick={exportFile}>
              {CLUB.export}
            </Button>
            <ImportSquadButton />
            <Button size="tiny" variant="quiet" aria-expanded={confirmingWipe} onClick={() => setConfirmingWipe(true)}>
              {CLUB.wipe}
            </Button>
          </ControlRow>
          {confirmingWipe && (
            <ConfirmBox
              className="has-mt-3"
              text={CONFIRM.wipe}
              yes={CLUB.wipe}
              keep={CONFIRM.keep}
              onYes={wipe}
              onKeep={() => setConfirmingWipe(false)}
            />
          )}
          <p className="text-sm is-dimmer has-mt-3">{CLUB.hint}</p>
        </>
      )}
    </section>
  );
}

/** The club sheet, opened from the board header and from the kit hint in Send call-up: the once-a-season settings. */
export function ClubSheet() {
  const { state, act } = useBoard();
  const close = useCallback(() => act({ type: "closeClub" }), [act]);

  return (
    <SideSheet open={state.ui.clubOpen} onClose={close} title={CLUB.heading} closeLabel={CLUB.close}>
      <ClubSettings />
    </SideSheet>
  );
}
