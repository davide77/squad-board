"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ANALYTICS_EVENTS, BOARD_CONFIG } from "@/constants/config";
import { START } from "@/constants/content/board";
import { AGE_GROUPS, FORMATS, type AgeKey, type FormatKey } from "@/constants/football";
import { GAFFER, PHASE_GAFFER } from "@/constants/content/gaffer";
import { DEFAULT_VOICE } from "@/constants/content/landing";
import { trackBoard, trackBoardOpened } from "@/lib/analytics";
import { buildBoard, parseSquad, startingCount } from "@/lib/board/start";
import { readAgePref, readVoicePref } from "@/lib/voice";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ExampleSheet } from "./ExampleSheet";
import { ImportSquadButton } from "./ImportSquadButton";

const newId = () => crypto.randomUUID();

/**
 * The first screen on an empty board: the age group and a pasted squad, then straight onto the pitch.
 * The team name and badge wait for the board itself, so nothing stands between a coach and a first line-up.
 */
interface StartScreenProps {
  /** A format asked for by a format page: the board opens on an age group that plays it. */
  readonly format?: FormatKey | null;
}

/** The age to open on: the homepage's, unless a format page asked for a format that age does not play. */
function startingAge(format: FormatKey | null | undefined): AgeKey | null {
  const pref = readAgePref();
  const prefGroup = AGE_GROUPS.find((a) => a.key === pref);
  if (!format || prefGroup?.format === format) return pref;
  return AGE_GROUPS.find((a) => a.format === format)?.key ?? pref;
}

export function StartScreen({ format }: StartScreenProps) {
  const { act } = useBoard();
  const headingId = useId();
  const squadId = useId();
  const countId = useId();
  const [squadText, setSquadText] = useState("");
  const ageId = useId();
  // Opens on the age group picked on the homepage, or one that plays the format a format page asked for.
  const [age, setAge] = useState<AgeKey | "">(() => startingAge(format) ?? "");
  // An age answered on the homepage shows as one line, not a list to confirm. Change opens the list.
  const [ageOpen, setAgeOpen] = useState(() => !startingAge(format));
  const ageSelect = useRef<HTMLSelectElement>(null);
  const [showExample, setShowExample] = useState(false);
  const group = AGE_GROUPS.find((a) => a.key === age) ?? null;
  // The age group sets the Gaffer's tone: very soft up to under 11s, rough from under 12s.
  // Before an age is picked, the last gaffer this device used, or the default.
  const [picked] = useState(readVoicePref);
  const voice = group ? PHASE_GAFFER[group.phase] : (picked ?? DEFAULT_VOICE);
  const say = GAFFER[voice];
  const size = group ? FORMATS[group.format].size : 0;

  const squad = parseSquad(squadText);
  const capped = squadText.split(/\r?\n/).filter((l) => l.trim()).length > BOARD_CONFIG.pasteMaxPlayers;
  const count = !squad.length
    ? START.countNone
    : !group
      ? START.countNeedsAge
      : START.count(squad.length, startingCount(squad.length, size)) + (capped ? ` ${START.countCapped(BOARD_CONFIG.pasteMaxPlayers)}` : "");

  function pickTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!squad.length || !group) return;
    // Named on the board afterwards, in the header, where "Name your team" is waiting.
    act({ type: "load", data: { ...buildBoard("", squad, newId, group.key), voice }, notice: say.teamPicked });
    trackBoard(ANALYTICS_EVENTS.boardStarted, { age: group.key, example: false });
    // Notes today as the first visit, so coming back next week counts as a return.
    trackBoardOpened(group.key);
    window.scrollTo({ top: 0 });
  }

  return (
    <section className="measure-62ch has-py-5" aria-labelledby={headingId}>
      <h1 id={headingId} className="text-4xl leading-tight tracking-heading has-mb-2">
        {START.heading}
      </h1>
      <p className="text-lg has-font-semibold leading-snug has-mb-2">{say.welcome}</p>
      <p className="text-md leading-relaxed is-dim has-mb-5">{START.intro}</p>

      <form onSubmit={pickTeam}>
        {group && !ageOpen ? (
          <div className="has-mb-4">
            <p className="has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1">{START.ageLabel}</p>
            <p className="is-flex is-align-center is-flex-wrap has-gap-3 text-md">
              <span className="has-font-semibold">{START.ageOption(group.label, FORMATS[group.format].label)}</span>
              <button
                type="button"
                className="button button--text"
                aria-label={START.ageChangeLabel}
                onClick={() => {
                  setAgeOpen(true);
                  // The list is there on the next paint.
                  requestAnimationFrame(() => ageSelect.current?.focus());
                }}
              >
                {START.ageChange}
              </button>
            </p>
          </div>
        ) : (
          <>
            <label htmlFor={ageId} className="is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1">
              {START.ageLabel}
            </label>
            <select
              ref={ageSelect}
              id={ageId}
              name="age"
              className="formation-select is-w-full has-radius-field has-py-2 text-md"
              value={age}
              required
              onChange={(e) => setAge(e.target.value as AgeKey)}
            >
              <option value="" disabled>
                {START.agePrompt}
              </option>
              {AGE_GROUPS.map((a) => (
                <option key={a.key} value={a.key}>
                  {START.ageOption(a.label, FORMATS[a.format].label)}
                </option>
              ))}
            </select>
            <p className="text-sm is-dimmer has-mt-1 has-mb-4">{START.ageHint}</p>
          </>
        )}

        <label htmlFor={squadId} className="is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1">
          {START.squadLabel}
        </label>
        <textarea
          id={squadId}
          name="squad"
          className="field field--area is-block is-w-full has-radius-field has-py-2 has-px-3 text-md leading-normal"
          rows={BOARD_CONFIG.pasteRows}
          placeholder={START.squadPlaceholder}
          autoComplete="off"
          spellCheck={false}
          aria-describedby={countId}
          value={squadText}
          onChange={(e) => setSquadText(e.target.value)}
        />
        <p className="text-sm is-dimmer has-mt-1">{START.squadHint}</p>
        <p id={countId} className="text-base is-tabular has-mt-3 has-mb-3" aria-live="polite">
          {count}
        </p>

        <Button type="submit" variant="primary" disabled={!squad.length || !group}>
          {START.submit}
        </Button>
        <p className="text-sm is-dimmer has-mt-2">{START.afterSubmit}</p>
      </form>

      <div className="has-mt-7">
        <h2 className="text-lg tracking-tag has-mb-2">{START.lookHeading}</h2>
        <div className="is-flex is-flex-wrap is-align-center has-gap-2">
          <Button aria-haspopup="dialog" onClick={() => setShowExample(true)}>
            {START.example}
          </Button>
        </div>
        <p className="text-sm is-dim has-mt-5 has-mb-2">{START.importHint}</p>
        <ImportSquadButton size="regular" />
      </div>

      <p className="text-sm is-dimmer has-mt-7">{START.privacy}</p>
      <ExampleSheet open={showExample} onClose={() => setShowExample(false)} voice={voice} />
    </section>
  );
}
