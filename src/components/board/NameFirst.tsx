"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { KEEP_CONFIG } from "@/constants/config";
import { NAME_FIRST } from "@/constants/content/board";
import { useStoredFlag } from "@/lib/hooks";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";

/** Marks the header's team name field, so "Name it" can find it from any panel. */
export const TEAM_NAME_MARK = { "data-team-name": "" } as const;
const TEAM_NAME_SELECTOR = "[data-team-name]";

/** The team name field to fill: the one in an open sheet when there is one, as the header sits behind it. */
function teamNameField() {
  return document.querySelector<HTMLInputElement>(`[role=dialog] ${TEAM_NAME_SELECTOR}`) ?? document.querySelector<HTMLInputElement>(TEAM_NAME_SELECTOR);
}

type Send = () => void | Promise<void>;

/** Asking; off naming the team with the send held; named, with the send waiting under Send. */
type Stage = "asking" | "naming" | "named";

/**
 * Holds a sheet back, once, when the team has no name: the parents would get one headed "Team sheet".
 * "Name it" keeps the send: once the name is in, Send sends exactly what was pressed.
 * After the coach answers either way, every send goes straight out.
 */
export function useNameFirst() {
  const { state } = useBoard();
  const [asked, markAsked] = useStoredFlag(KEEP_CONFIG.nameFirstKey);
  // Which send was held, by key. The send itself is looked up fresh when it goes, so a sheet
  // held before the team was named goes out with the name.
  const [pending, setPending] = useState<string | null>(null);
  const latest = useRef<Record<string, Send>>({});
  const [stage, setStage] = useState<Stage>("asking");
  const holds = !asked && !state.data.example && !state.data.team.trim();

  /** Sends now, or holds the send and asks. `key` names the button, such as "copy". */
  const guard = (key: string, send: Send) => {
    latest.current[key] = send;
    return () => {
      if (holds) {
        setPending(key);
        setStage("asking");
      } else void send();
    };
  };

  /** The same for a link that opens in a new tab, such as WhatsApp. `onSend` runs when it really goes. */
  const guardLink = (key: string, href: string, onSend: () => void) => {
    latest.current[key] = () => {
      onSend();
      window.open(href, "_blank", "noopener");
    };
    return (e: MouseEvent<HTMLAnchorElement>) => {
      if (!holds) {
        onSend();
        return;
      }
      e.preventDefault();
      setPending(key);
      setStage("asking");
    };
  };

  const nameIt = () => {
    markAsked();
    setStage("naming");
    const field = teamNameField();
    field?.scrollIntoView({ block: "center" });
    field?.focus();
  };

  // Leaving the name field with a name in it turns the prompt into "Named. Send it."
  useEffect(() => {
    if (stage !== "naming") return;
    const field = teamNameField();
    if (!field) return;
    const left = () => {
      if (field.value.trim()) setStage("named");
    };
    field.addEventListener("blur", left);
    return () => field.removeEventListener("blur", left);
  }, [stage]);

  /** Send anyway, or Send once named: the send that was held goes now. */
  const sendAnyway = () => {
    markAsked();
    const send = pending ? latest.current[pending] : undefined;
    setPending(null);
    if (send) void send();
  };

  return { stage: pending ? stage : null, guard, guardLink, nameIt, sendAnyway } as const;
}

interface NameFirstProps {
  readonly stage: Stage | null;
  readonly nameIt: () => void;
  readonly sendAnyway: () => void;
}

/**
 * Under the button that was pressed: the question, then, once the team is named, the held send.
 * Focus moves to the question so it is heard. The named line is a status, so it is read out
 * without pulling the coach back from wherever they are.
 */
export function NameFirst({ stage, nameIt, sendAnyway }: NameFirstProps) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (stage === "asking") first.current?.focus();
  }, [stage]);
  if (!stage) return null;
  if (stage === "named") {
    return (
      <div className="bg-board-2 has-radius-panel has-py-3 has-px-4 has-mt-3">
        <p role="status" className="text-base has-font-semibold has-mb-2">
          {NAME_FIRST.named}
        </p>
        <Button variant="primary" onClick={sendAnyway}>
          {NAME_FIRST.send}
        </Button>
      </div>
    );
  }
  return (
    <div role="group" aria-label={NAME_FIRST.label} className="bg-board-2 has-radius-panel has-py-3 has-px-4 has-mt-3">
      <p className="text-base has-font-semibold has-mb-2">{NAME_FIRST.line}</p>
      <div className="is-flex is-flex-wrap has-gap-2">
        <Button ref={first} variant="primary" onClick={nameIt}>
          {NAME_FIRST.nameIt}
        </Button>
        <Button variant="quiet" onClick={sendAnyway}>
          {NAME_FIRST.sendAnyway}
        </Button>
      </div>
    </div>
  );
}
