"use client";

import { useId } from "react";
import { HEADER, SHEET } from "@/constants/content/board";
import { matchDate } from "@/lib/board/message";
import { useBoard } from "./BoardProvider";
import { Crest } from "./Crest";
import { MatchClock } from "./MatchClock";
import { TEAM_NAME_MARK } from "./NameFirst";

export function BoardHeader() {
  const { state, act } = useBoard();
  const teamId = useId();
  const { fixture, match } = state.data;
  // Filled in under This week's match. Here it is only a reminder on the touchline.
  const summary = [fixture.trim(), matchDate(match.date), match.kickoff].filter(Boolean).join(SHEET.pictureJoin);

  return (
    <header className="board-header is-flex is-flex-wrap is-align-end is-justify-between has-gap-3 has-mb-4 has-pb-3">
      <div className="board-header__ident is-min-w-0">
        <div className="is-flex is-align-center has-gap-3">
          <Crest team={state.data.team} badge={state.data.badge} />
          <div className="is-flex-1 is-min-w-0">
            <label htmlFor={teamId} className="sr-only">
              {HEADER.teamLabel}
            </label>
            <input
              id={teamId}
              {...TEAM_NAME_MARK}
              className="board-header__team is-w-full has-font-headline has-font-bold leading-tight tracking-number is-kit"
              placeholder={HEADER.teamPlaceholder}
              autoComplete="off"
              value={state.data.team}
              onChange={(e) => act({ type: "setTeam", value: e.target.value })}
            />
          </div>
        </div>
        {summary && <p className="has-mt-1 text-base is-dim is-truncate">{summary}</p>}
      </div>
      <MatchClock />
    </header>
  );
}
