"use client";

import { useState } from "react";
import { PICK, STEPS } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { changedFromStrongest, matchUnderway, planName, started } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { useClockToggle } from "./MatchClock";
import { Panel } from "./Panel";

type Confirming = "new" | "clear" | null;

/**
 * The end of Pick the team: the strongest side to save or go back to, kick-off, and starting over.
 * Starting over asks first, in place, rather than with a browser dialog.
 */
export function PickActions() {
  const { state, act } = useBoard();
  const { data } = state;
  const kickOff = useClockToggle();
  const [confirming, setConfirming] = useState<Confirming>(null);
  const plan = planName(data);
  const underway = started(data);
  const changed = changedFromStrongest(data);

  function backToStrongest() {
    if (data.preset && matchUnderway(data) && !window.confirm(GAFFER[data.voice].matchUnderway(plan))) return;
    act({ type: "backToStrongest" });
  }

  function confirm() {
    act(confirming === "new" ? { type: "newMatchday" } : { type: "clearPitch" });
    setConfirming(null);
  }

  return (
    <>
      <Panel heading={PICK.strongestHeading(plan)}>
        <p className="text-base is-dim has-mb-3">
          {!data.preset ? PICK.planNone(plan) : changed ? PICK.planChanged(plan) : PICK.planSame(plan, data.preset.formation)}
        </p>
        <div className="is-flex has-gap-2">
          <Button className="is-flex-1 has-py-3" onClick={() => act({ type: "setStrongest" })}>
            {PICK.saveStrongest}
          </Button>
          <Button className="is-flex-1 has-py-3" disabled={!data.preset || !changed} onClick={backToStrongest}>
            {PICK.backToStrongest}
          </Button>
        </div>
      </Panel>

      <Button
        variant="primary"
        className="is-w-full has-py-4 text-lg has-mt-5"
        onClick={() => {
          if (!underway) kickOff();
          act({ type: "setStep", step: "match" });
        }}
      >
        {underway ? STEPS.backToMatch : STEPS.startMatch}
      </Button>

      <section className="start-over has-mt-6 has-pt-5">
        <h3 className="has-font-headline has-font-bold text-sm tracking-caps uppercase is-out has-mb-3">{PICK.startOver}</h3>
        {confirming ? (
          <div role="alert" className="drawer__confirm is-flex is-flex-column has-gap-3 has-p-4 has-radius-field">
            <p className="text-base leading-snug">{confirming === "new" ? PICK.newMatchdayText : PICK.clearPitchText}</p>
            <div className="is-flex has-gap-2">
              <Button variant="out" className="is-flex-1 has-py-3" onClick={confirm}>
                {confirming === "new" ? PICK.newMatchdayConfirm : PICK.clearPitchConfirm}
              </Button>
              <Button className="is-flex-1 has-py-3" onClick={() => setConfirming(null)}>
                {PICK.keep}
              </Button>
            </div>
          </div>
        ) : (
          <div className="is-flex has-gap-2">
            <Button variant="out" className="is-flex-1 has-py-3" onClick={() => setConfirming("new")}>
              {PICK.newMatchday}
            </Button>
            <Button variant="out" className="is-flex-1 has-py-3" onClick={() => setConfirming("clear")}>
              {PICK.clearPitch}
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
