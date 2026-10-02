"use client";

import { useId } from "react";
import { HEADER, SHEET } from "@/constants/content/board";
import { AGE_GROUPS, FORMATS } from "@/constants/football";
import { matchSummary } from "@/lib/board/message";
import { started } from "@/lib/board/queries";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { ClubButton } from "./ClubButton";
import { Crest } from "./Crest";
import { MatchClock } from "./MatchClock";
import { TEAM_NAME_MARK } from "./NameFirst";
import { StepTabs } from "./StepTabs";

export function BoardHeader() {
  const { state, act, sandbox } = useBoard();
  const teamId = useId();
  // This week's match on one line. A tap opens Send call-up, where it is filled in beside the message it heads.
  const summary = matchSummary(state.data);
  // "Under 15s · 11-a-side": who this board is for, under the name.
  const group = AGE_GROUPS.find((a) => a.key === state.data.age);
  const squadLine = [group?.label, FORMATS[state.data.format].label].filter(Boolean).join(SHEET.pictureJoin);

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
              className="board-header__team is-w-full has-font-headline has-font-bold leading-tight tracking-number is-chalk"
              placeholder={HEADER.teamPlaceholder}
              autoComplete="off"
              value={state.data.team}
              onChange={(e) => act({ type: "setTeam", value: e.target.value })}
            />
          </div>
        </div>
        {/* The age group and format are set in the club sheet, so the way in sits beside them. */}
        <div className="is-flex is-align-center has-gap-3 has-mt-1">
          <p className="is-min-w-0 text-base is-dim is-truncate">{squadLine}</p>
          {/* On the real board, Customise your club is at the far end of the site header. The example team's sheet covers that, so it keeps the button here. */}
          {sandbox && <ClubButton inline />}
        </div>
        <button
          type="button"
          className="board-header__match is-flex is-align-baseline has-gap-2 text-left text-md hit-area"
          aria-haspopup="dialog"
          onClick={() => act({ type: "openCallUp" })}
        >
          <span className={cx("is-min-w-0 is-truncate", summary ? "is-chalk" : "is-dim")}>{summary || HEADER.addMatch}</span>
          <span className="board-header__edit text-sm is-dim is-shrink-0">{HEADER.editMatch}</span>
        </button>
      </div>
      <div className="board-header__steps">
        <StepTabs />
      </div>
      {/* On Matchday the big clock takes over. Before kick-off, Start the match is the one way to start it. */}
      {state.ui.step !== "match" && (state.ui.step !== "pick" || started(state.data)) && <MatchClock />}
    </header>
  );
}
