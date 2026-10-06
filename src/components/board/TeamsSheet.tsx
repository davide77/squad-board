"use client";

import { useCallback } from "react";
import { ANALYTICS_EVENTS, TEAMS_FROM } from "@/constants/config";
import { MORE_TEAMS } from "@/constants/content/account";
import { trackBoard } from "@/lib/analytics";
import { ClubWaitlist } from "@/components/landing/ClubWaitlist";
import { Icon } from "../Icon";
import { useBoard } from "./BoardProvider";
import { SideSheet } from "./SideSheet";

/** Opens Add a team and counts where from, so demand for a second team shows before it is built. */
export function useOpenTeams(from: keyof typeof TEAMS_FROM) {
  const { state, act } = useBoard();
  return () => {
    trackBoard(ANALYTICS_EVENTS.teamsOpened, state.data, { from: TEAMS_FROM[from] });
    act({ type: "openTeams" });
  };
}

/**
 * Add a team: what a second team gets, the promise that the first stays free, and the waitlist until the
 * club plan is ready. Opened from the button beside Customise your club and from the club sheet.
 */
export function TeamsSheet() {
  const { state, act } = useBoard();
  const close = useCallback(() => act({ type: "closeTeams" }), [act]);

  return (
    <SideSheet open={state.ui.teamsOpen} onClose={close} title={MORE_TEAMS.heading} hint={MORE_TEAMS.hint} closeLabel={MORE_TEAMS.close}>
      <section>
        <h3 className="has-font-headline text-xs tracking-caps uppercase is-dim has-mb-3">{MORE_TEAMS.benefitsHeading}</h3>
        <ul className="is-flex is-flex-column has-gap-3">
          {MORE_TEAMS.benefits.map((b) => (
            <li key={b.text} className="is-flex is-align-start has-gap-3 text-md leading-snug">
              <Icon name={b.icon} className="is-kit" />
              <span className="is-chalk">{b.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="teams-sheet__offer has-radius-panel has-p-4 is-flex is-flex-column has-gap-2">
        <p className="has-font-headline has-font-bold text-lg is-chalk">{MORE_TEAMS.free}</p>
        <p className="text-base is-dim">{MORE_TEAMS.when}</p>
      </section>
      <ClubWaitlist prompt={MORE_TEAMS.prompt} cta={MORE_TEAMS.cta} />
    </SideSheet>
  );
}
