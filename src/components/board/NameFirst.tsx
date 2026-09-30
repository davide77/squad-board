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

type Send = () => void | Promise<void>;

/**
 * Holds a sheet back, once, when the team has no name: the parents would get one headed "Team sheet".
 * After the coach answers either way, every send goes straight out.
 */
export function useNameFirst() {
  const { state } = useBoard();
  const [asked, markAsked] = useStoredFlag(KEEP_CONFIG.nameFirstKey);
  const [pending, setPending] = useState<Send | null>(null);
  const holds = !asked && !state.data.example && !state.data.team.trim();

  /** Sends now, or holds the send and asks. */
  const guard = (send: Send) => () => {
    if (holds) setPending(() => send);
    else void send();
  };

  /** The same for a link that opens in a new tab, such as WhatsApp. `onSend` runs when it really goes. */
  const guardLink = (href: string, onSend: () => void) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!holds) {
      onSend();
      return;
    }
    e.preventDefault();
    setPending(() => () => {
      onSend();
      window.open(href, "_blank", "noopener");
    });
  };

  const nameIt = () => {
    markAsked();
    setPending(null);
    const field = document.querySelector<HTMLInputElement>(TEAM_NAME_SELECTOR);
    field?.scrollIntoView({ block: "center" });
    field?.focus();
  };

  const sendAnyway = () => {
    markAsked();
    const send = pending;
    setPending(null);
    if (send) void send();
  };

  return { asking: pending !== null, guard, guardLink, nameIt, sendAnyway } as const;
}

interface NameFirstProps {
  readonly asking: boolean;
  readonly nameIt: () => void;
  readonly sendAnyway: () => void;
}

/** The one line and two buttons, under the button that was pressed. Focus moves to it, so it is heard. */
export function NameFirst({ asking, nameIt, sendAnyway }: NameFirstProps) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (asking) first.current?.focus();
  }, [asking]);
  if (!asking) return null;
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
