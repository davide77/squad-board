"use client";

import { useState, type Ref } from "react";
import { BOARD_CONFIG } from "@/constants/config";
import { PICK, PICK_BAR, SAVED, STEPS } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { matchIsToday } from "@/lib/board/message";
import { changedFromStrongest, matchUnderway, planName, squadChecks, started, teamSize, where } from "@/lib/board/queries";
import { useNow } from "@/lib/hooks";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ConfirmBox } from "./ConfirmBox";
import { GafferAvatar, GafferBubble, useGafferReaction } from "./GafferLine";
import { useClockToggle } from "./MatchClock";
import { Popover } from "./Popover";
import { SavedLineups } from "./SavedLineups";
import { Icon } from "../Icon";

const MENU_HEADING = "has-font-headline text-xs tracking-caps uppercase is-dim has-mb-2";
const TOOLBAR_BUTTON = "button button--default is-inline-flex is-align-center has-gap-2 has-py-3 has-px-3 text-base has-radius-field";

/** The strongest side to save or go back to, and the saved plans under it, in a menu above the pitch. */
export function LineupsMenu() {
  const { state, act } = useBoard();
  const { data } = state;
  const [confirming, setConfirming] = useState(false);
  const plan = planName(data);
  const changed = changedFromStrongest(data);

  // During a match, going back to the strongest side undoes the changes made on the day, so it asks first.
  function backToStrongest(close: () => void) {
    if (data.preset && matchUnderway(data)) setConfirming(true);
    else {
      act({ type: "backToStrongest" });
      close();
    }
  }

  return (
    <Popover
      label={SAVED.button}
      triggerClassName={TOOLBAR_BUTTON}
      trigger={
        <>
          <Icon name="saveLineup" size="button" />
          {SAVED.button}
          <Icon name="chevronDown" size="small" className="is-dim" />
        </>
      }
    >
      {(close) => (
        <>
          <section>
            <h3 className={MENU_HEADING}>{PICK.strongestHeading(plan)}</h3>
            <p className="text-sm is-dim has-mb-3">
              {!data.preset ? PICK.planNone(plan) : changed ? PICK.planChanged(plan) : PICK.planSame(plan, data.preset.formation)}
            </p>
            <div className="is-flex has-gap-2">
              <Button className="is-flex-1" icon="saveLineup" onClick={() => act({ type: "setStrongest" })}>
                {PICK.saveStrongest}
              </Button>
              <Button className="is-flex-1" disabled={!data.preset || !changed} onClick={() => backToStrongest(close)}>
                {PICK.backToStrongest}
              </Button>
            </div>
            {confirming && (
              <ConfirmBox
                className="has-mt-3"
                text={GAFFER[data.voice].matchUnderway(plan)}
                yes={PICK.backConfirm}
                keep={PICK.keep}
                onYes={() => {
                  act({ type: "backToStrongest" });
                  setConfirming(false);
                  close();
                }}
                onKeep={() => setConfirming(false)}
              />
            )}
          </section>
          <section className="drawer__section has-pt-4">
            <h3 className={MENU_HEADING}>{SAVED.heading}</h3>
            <SavedLineups />
          </section>
        </>
      )}
    </Popover>
  );
}

type Confirming = "new" | "clear" | null;

/** New matchday and Clear the pitch, behind the menu at the end of the shape toolbar. Each asks first, in place. */
export function MoreMenu() {
  const { act } = useBoard();
  const [confirming, setConfirming] = useState<Confirming>(null);

  return (
    <Popover
      label={PICK.startOver}
      align="end"
      triggerClassName={`${TOOLBAR_BUTTON} is-justify-center`}
      triggerLabel={PICK.more}
      trigger={<Icon name="more" size="button" />}
    >
      {(close) => (
        <section>
          <h3 className="has-font-headline has-font-bold text-sm tracking-caps uppercase is-out has-mb-3">{PICK.startOver}</h3>
          {confirming ? (
            <ConfirmBox
              text={confirming === "new" ? PICK.newMatchdayText : PICK.clearPitchText}
              yes={confirming === "new" ? PICK.newMatchdayConfirm : PICK.clearPitchConfirm}
              keep={PICK.keep}
              variant="out"
              onYes={() => {
                act(confirming === "new" ? { type: "newMatchday" } : { type: "clearPitch" });
                setConfirming(null);
                close();
              }}
              onKeep={() => setConfirming(null)}
            />
          ) : (
            <div className="is-flex is-flex-column has-gap-2">
              <Button variant="out" className="has-py-3 text-left" onClick={() => setConfirming("new")}>
                {PICK.newMatchday}
              </Button>
              <Button variant="out" className="has-py-3 text-left" onClick={() => setConfirming("clear")}>
                {PICK.clearPitch}
              </Button>
            </div>
          )}
        </section>
      )}
    </Popover>
  );
}

/** New matchday on its own, at the foot of Full time: once the result is sent, next week starts here. */
export function NewMatchday() {
  const { act } = useBoard();
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="start-over has-mt-6 has-pt-5">
      {confirming ? (
        <ConfirmBox
          text={PICK.newMatchdayText}
          yes={PICK.newMatchdayConfirm}
          keep={PICK.keep}
          variant="out"
          onYes={() => {
            act({ type: "newMatchday" });
            setConfirming(false);
          }}
          onKeep={() => setConfirming(false)}
        />
      ) : (
        <Button variant="out" className="is-w-full has-py-3" onClick={() => setConfirming(true)}>
          {PICK.newMatchday}
        </Button>
      )}
    </section>
  );
}

/**
 * The foot of Pick the team: where the team stands, what is worth checking, and the two ways on. Send call-up
 * leads in the week; on the day, or with the match started, Start the match does.
 */
interface PickBarProps {
  /** The board measures the bar, so the pinned pitch above it keeps clear. */
  readonly ref?: Ref<HTMLDivElement>;
}

export function PickBar({ ref }: PickBarProps) {
  const { state, act } = useBoard();
  const { data } = state;
  const kickOff = useClockToggle();
  const now = useNow(true, BOARD_CONFIG.minutesTickMs);
  const underway = started(data);
  const matchFirst = underway || matchIsToday(data, now);
  const called = data.players.filter((p) => !p.out).length;
  const onPitch = Object.keys(data.xi).length;
  const bench = data.players.filter((p) => !p.out && where(data, p.id) === "bench").length;
  const { flagged } = squadChecks(data);
  const reaction = useGafferReaction();

  return (
    <div
      ref={ref}
      className="pick-bar is-flex is-flex-wrap is-align-center is-justify-between has-gap-2 has-py-2 has-py-md-3"
      role="region"
      aria-label={PICK_BAR.label}
    >
      {/* The Gaffer, reacting to what the coach just did, right beside the buttons. Once he goes quiet he
          steps out and the status line takes his place: the full counts, or on a phone who is starting. */}
      <div className="pick-bar__gaffer is-flex is-align-center is-min-w-0">
        {reaction ? (
          <>
            <GafferAvatar />
            <GafferBubble key={reaction.id} text={reaction.text} oneLine />
          </>
        ) : (
          <p className="is-flex is-flex-wrap is-align-center has-gap-3 text-base is-min-w-0">
            <span className="is-hidden is-md-inline">{PICK_BAR.ready(called, onPitch, teamSize(data), bench)}</span>
            <span className="is-md-hidden">{PICK_BAR.short(onPitch, teamSize(data))}</span>
            {flagged > 0 && <span className="pick-bar__check text-sm">{PICK_BAR.checks(flagged)}</span>}
          </p>
        )}
      </div>
      <div className="pick-bar__actions is-flex has-gap-2">
        <Button
          variant={matchFirst ? "primary" : "quiet"}
          icon="clock"
          className="is-flex-1 has-py-3 has-px-5 text-md"
          onClick={() => {
            if (!underway) kickOff();
            act({ type: "setStep", step: "match" });
          }}
        >
          {underway ? STEPS.backToMatch : STEPS.startMatch}
        </Button>
        <Button
          variant={matchFirst ? "outline" : "primary"}
          icon="send"
          className="is-flex-1 has-py-3 has-px-5 text-md"
          aria-haspopup="dialog"
          onClick={() => act({ type: "openCallUp" })}
        >
          {PICK_BAR.sendCallUp}
        </Button>
      </div>
    </div>
  );
}
