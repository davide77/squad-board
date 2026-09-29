"use client";

import { useId, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { VISOR_MARK } from "@/constants/brand";
import { BOARD_CONFIG } from "@/constants/config";
import { START } from "@/constants/content/board";
import { AGE_GROUPS, FORMATS, type AgeKey } from "@/constants/football";
import { GAFFER, PHASE_GAFFER } from "@/constants/content/gaffer";
import { DEFAULT_VOICE } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { buildBoard, exampleBoard, parseSquad, startingCount } from "@/lib/board/start";
import { readVoicePref } from "@/lib/voice";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ImportSquadButton } from "./ImportSquadButton";

const newId = () => crypto.randomUUID();

/** The first screen on an empty board: a team name and a pasted squad, then straight onto the pitch. */
export function StartScreen() {
  const { act } = useBoard();
  const teamId = useId();
  const squadId = useId();
  const countId = useId();
  const [squadText, setSquadText] = useState("");
  const ageId = useId();
  const [age, setAge] = useState<AgeKey | "">("");
  const group = AGE_GROUPS.find((a) => a.key === age) ?? null;
  // The gaffer picked on the landing page comes along. Without one, the age group decides.
  const [picked] = useState(readVoicePref);
  const voice = picked ?? (group ? PHASE_GAFFER[group.phase] : DEFAULT_VOICE);
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
    const team = String(new FormData(e.currentTarget).get("team") ?? "");
    act({ type: "load", data: { ...buildBoard(team, squad, newId, group.key), voice }, notice: say.teamPicked });
    window.scrollTo({ top: 0 });
  }

  function tryExample() {
    act({ type: "load", data: { ...exampleBoard(newId), voice }, notice: say.exampleLoaded });
    window.scrollTo({ top: 0 });
  }

  return (
    <section className="measure-62ch has-py-5" aria-labelledby={`${teamId}-heading`}>
      <Link
        href={ROUTES.home}
        aria-label={START.homeLabel}
        className="is-inline-flex is-align-center has-gap-2 is-chalk has-font-headline has-font-bold text-2xl tracking-number has-mb-6"
      >
        <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.headerSize} height={VISOR_MARK.headerSize} priority />
        <span>{SITE.name}</span>
      </Link>

      <h1 id={`${teamId}-heading`} className="text-4xl leading-tight tracking-heading has-mb-2">
        {START.heading}
      </h1>
      <p className="text-lg has-font-semibold leading-snug has-mb-2">{say.welcome}</p>
      <p className="text-md leading-relaxed is-dim has-mb-5">{START.intro}</p>

      <form onSubmit={pickTeam}>
        <label htmlFor={teamId} className="is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1">
          {START.teamLabel}
        </label>
        <input
          id={teamId}
          name="team"
          className="field is-w-full has-radius-field has-py-2 has-px-3 has-mb-4 text-md"
          placeholder={START.teamPlaceholder}
          autoComplete="off"
        />

        <label htmlFor={ageId} className="is-block has-font-headline text-xs tracking-caps uppercase is-dimmer has-mb-1">
          {START.ageLabel}
        </label>
        <select
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
      </form>

      <div className="has-mt-7">
        <h2 className="text-lg tracking-tag has-mb-2">{START.lookHeading}</h2>
        <div className="is-flex is-flex-wrap is-align-center has-gap-2">
          <Button onClick={tryExample}>{START.example}</Button>
        </div>
        <p className="text-sm is-dim has-mt-5 has-mb-2">{START.importHint}</p>
        <ImportSquadButton size="regular" />
      </div>

      <p className="text-sm is-dimmer has-mt-7">{START.privacy}</p>
    </section>
  );
}
