"use client";

import { useId } from "react";
import { HEADER } from "@/constants/content/board";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { MatchClock } from "./MatchClock";

/** Up to two initials from the team name, for the crest. */
function monogram(team: string): string {
  return team
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function BoardHeader() {
  const { state, act } = useBoard();
  const teamId = useId();
  const fixtureId = useId();
  const mono = monogram(state.data.team);

  return (
    <header className="board-header is-flex is-flex-wrap is-align-end is-justify-between has-gap-3 has-mb-4 has-pb-3">
      <div className="board-header__ident is-min-w-0">
        <div className="is-flex is-align-center has-gap-3">
          <div
            className={cx(
              "crest is-flex is-align-center is-justify-center is-shrink-0 has-radius-pill has-font-headline has-font-bold text-lg tracking-number",
              !mono && "crest--empty",
            )}
            aria-hidden="true"
          >
            {mono}
          </div>
          <div className="is-flex-1 is-min-w-0">
            <label htmlFor={teamId} className="sr-only">
              {HEADER.teamLabel}
            </label>
            <input
              id={teamId}
              className="board-header__team is-w-full has-font-headline has-font-bold leading-tight tracking-number is-kit"
              placeholder={HEADER.teamPlaceholder}
              autoComplete="off"
              value={state.data.team}
              onChange={(e) => act({ type: "setTeam", value: e.target.value })}
            />
          </div>
        </div>
        <label htmlFor={fixtureId} className="sr-only">
          {HEADER.fixtureLabel}
        </label>
        <input
          id={fixtureId}
          className="board-header__fixture is-w-full has-py-1 text-base is-dim"
          placeholder={HEADER.fixturePlaceholder}
          autoComplete="off"
          value={state.data.fixture}
          onChange={(e) => act({ type: "setFixture", value: e.target.value })}
        />
      </div>
      <MatchClock />
    </header>
  );
}
