"use client";

import { useEffect, useState } from "react";
import { ANALYTICS_EVENTS } from "@/constants/config";
import { CONFIRM, HANDOFF, SHEET } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { trackBoard } from "@/lib/analytics";
import { readLink, readSquadCode, type HandoffLink } from "@/lib/board/handoff";
import type { BoardData } from "@/lib/board/types";
import { Button } from "../Button";
import { BadgePicker } from "./BadgePicker";
import { useBoard } from "./BoardProvider";
import { ConfirmBox } from "./ConfirmBox";

/** A squad read from a link, with the badge that came with it and whether one stayed behind. */
interface Arriving {
  readonly board: BoardData;
  readonly badge: string;
  readonly badgeBehind: boolean;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Opens a squad sent from another device: /board#squad=... An empty board takes it straight away.
 * A board with a squad on it asks first, and says so when its own squad is the newer one.
 * A badge comes in the shared link, or on its own from the badge code: /board#badge=...&team=...
 */
export function IncomingSquad() {
  const { state, act } = useBoard();
  const { data } = state;
  // The address is tidied once it is read, so a reload does not bring the squad in twice.
  const [link, setLink] = useState<HandoffLink | null>(() => readLink(window.location.hash));
  const [pending, setPending] = useState<Arriving | null>(null);
  // The squad came in by QR code and the badge stayed on the other device.
  const [askBadge, setAskBadge] = useState(false);
  const hasOwnSquad = data.players.length > 0 && !data.example;
  const say = GAFFER[data.voice];

  // A link opened in a tab already on the board changes only the #, which does not reload the page.
  useEffect(() => {
    const onHash = () => {
      const next = readLink(window.location.hash);
      if (next) setLink(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!link) return;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url);
    if (!link.squad) {
      takeBadge(link.badge, link.team ?? "");
      return;
    }
    let cancelled = false;
    void readSquadCode(link.squad).then((board) => {
      if (cancelled) return;
      if (!board) act({ type: "notify", text: say.linkBroken });
      else {
        const arriving = { board, badge: link.badge, badgeBehind: link.badgeBehind };
        if (hasOwnSquad) setPending(arriving);
        else take(arriving);
      }
    });
    return () => {
      cancelled = true;
    };
    // Runs once for the link in the address. The board it lands on is the one open at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]);

  function take({ board, badge, badgeBehind }: Arriving) {
    setPending(null);
    // A badge that came in the link wins. Without one, a squad coming back to the device it was set
    // up on keeps the badge here.
    const kept = badge || board.badge || (sameName(board.team, data.team) ? data.badge : "");
    act({ type: "load", data: { ...board, badge: kept }, notice: GAFFER[board.voice].arrived });
    setAskBadge(badgeBehind && !kept);
    trackBoard(ANALYTICS_EVENTS.squadReceived, board);
  }

  /** The badge code: onto this board when it is the team the badge is for, never onto another. */
  function takeBadge(badge: string, team: string) {
    if (!badge) {
      act({ type: "notify", text: say.linkBroken });
      return;
    }
    if (!data.players.length || (team && !sameName(team, data.team))) {
      act({ type: "notify", text: say.badgeWrongTeam(team || SHEET.fallbackTitle) });
      return;
    }
    act({ type: "setBadge", value: badge });
    act({ type: "notify", text: say.badgeArrived });
    setAskBadge(false);
  }

  if (pending) {
    const older = pending.board.updatedAt > 0 && data.updatedAt > pending.board.updatedAt;
    return (
      <div className="container has-pt-4">
        <ConfirmBox
          text={older ? CONFIRM.replaceFromOlderLink : CONFIRM.replaceFromLink}
          yes={CONFIRM.replaceSquadYes}
          keep={CONFIRM.keep}
          onYes={() => take(pending)}
          onKeep={() => setPending(null)}
        />
      </div>
    );
  }

  if (!askBadge || data.badge) return null;
  return (
    <div className="container has-pt-4">
      <div role="status" className="bg-board-2 is-flex is-flex-column has-gap-3 has-p-4 has-radius-field">
        <p className="text-base leading-snug">{HANDOFF.badgeBehind}</p>
        <div className="is-flex is-flex-wrap is-align-center is-justify-between has-gap-3">
          <BadgePicker team={data.team} badge={data.badge} onChange={(value) => act({ type: "setBadge", value })} />
          <Button size="tiny" variant="quiet" onClick={() => setAskBadge(false)}>
            {HANDOFF.badgeBehindDismiss}
          </Button>
        </div>
      </div>
    </div>
  );
}
