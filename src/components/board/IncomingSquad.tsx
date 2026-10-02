"use client";

import { useEffect, useState } from "react";
import { ANALYTICS_EVENTS } from "@/constants/config";
import { CONFIRM } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { trackBoard } from "@/lib/analytics";
import { linkCode, readSquadCode } from "@/lib/board/handoff";
import type { BoardData } from "@/lib/board/types";
import { useBoard } from "./BoardProvider";
import { ConfirmBox } from "./ConfirmBox";

/**
 * Opens a squad sent from another device: /board#squad=... An empty board takes it straight away.
 * A board with a squad on it asks first, and says so when its own squad is the newer one.
 */
export function IncomingSquad() {
  const { state, act } = useBoard();
  const { data } = state;
  // The address is tidied once it is read, so a reload does not bring the squad in twice.
  const [code, setCode] = useState(() => linkCode(window.location.hash));
  const [pending, setPending] = useState<BoardData | null>(null);
  const hasOwnSquad = data.players.length > 0 && !data.example;

  // A link opened in a tab already on the board changes only the #, which does not reload the page.
  useEffect(() => {
    const onHash = () => {
      const next = linkCode(window.location.hash);
      if (next) setCode(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!code) return;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url);
    let cancelled = false;
    void readSquadCode(code).then((board) => {
      if (cancelled) return;
      if (!board) act({ type: "notify", text: GAFFER[data.voice].linkBroken });
      else if (hasOwnSquad) setPending(board);
      else take(board);
    });
    return () => {
      cancelled = true;
    };
    // Runs once for the code in the address. The board it lands on is the one open at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function take(board: BoardData) {
    setPending(null);
    // The badge does not travel. A squad coming back to the device it was set up on keeps the one here.
    const sameTeam = board.team.trim().toLowerCase() === data.team.trim().toLowerCase();
    const badge = board.badge || (sameTeam ? data.badge : "");
    act({ type: "load", data: { ...board, badge }, notice: GAFFER[board.voice].arrived });
    trackBoard(ANALYTICS_EVENTS.squadReceived, board);
  }

  if (!pending) return null;
  const older = pending.updatedAt > 0 && data.updatedAt > pending.updatedAt;
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
