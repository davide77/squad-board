"use client";

import { STEPS } from "@/constants/content/board";
import { started } from "@/lib/board/queries";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { useClockToggle } from "./MatchClock";

/**
 * The way on from picking the team: kick off and go to the match, or send the call-up before it.
 * Once the clock has started, the first button goes back to the match instead of starting it again.
 */
export function StepActions() {
  const { state, act } = useBoard();
  const kickOff = useClockToggle();
  const underway = started(state.data);

  return (
    <div className="is-flex is-flex-column has-gap-2 has-pt-5">
      <Button
        variant="primary"
        className="has-py-4 text-lg"
        onClick={() => {
          if (!underway) kickOff();
          act({ type: "setStep", step: "match" });
        }}
      >
        {underway ? STEPS.backToMatch : STEPS.startMatch}
      </Button>
      <Button className="has-py-3" onClick={() => act({ type: "setStep", step: "send" })}>
        {STEPS.sendCallUp}
      </Button>
    </div>
  );
}
