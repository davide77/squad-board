"use client";

import { useEffect, useState } from "react";
import { FORMAT_KEYS, type FormatKey } from "@/constants/football";
import { FORMAT_PARAM } from "@/constants/routes";
import { MotionConfig } from "framer-motion";
import { trackBoardOpened } from "@/lib/analytics";
import { BoardProvider, useBoard } from "./BoardProvider";
import { kitColours } from "@/lib/board/kit";
import { BoardView } from "./BoardView";
import { IncomingSquad } from "./IncomingSquad";
import { StartScreen } from "./StartScreen";
import { Toast } from "./Toast";

/** The format asked for in the address, as from a format page: /board?format=7v7. */
function formatAsked(): FormatKey | null {
  const value = new URLSearchParams(window.location.search).get(FORMAT_PARAM);
  return FORMAT_KEYS.find((k) => k === value) ?? null;
}

function Board() {
  const { state, act } = useBoard();
  // Read once: a board already saved when the page opened is a coach coming back.
  const [reopened] = useState(() => state.data.players.length > 0 && !state.data.example);
  const [openedAge] = useState(() => state.data.age);
  const [asked] = useState(formatAsked);
  useEffect(() => {
    if (reopened) trackBoardOpened(openedAge);
  }, [reopened, openedAge]);

  // A format page's button: a saved team switches to that format (Undo takes it back), and a new
  // board starts on it. The address is tidied, so a reload does not switch it again.
  useEffect(() => {
    if (!asked) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(FORMAT_PARAM);
    window.history.replaceState(null, "", url);
    if (reopened) act({ type: "setFormat", format: asked });
  }, [asked, reopened, act]);

  // An empty board opens on the start screen: name the team, paste the squad, done.
  if (!state.data.players.length) {
    return (
      <div className="board container has-pt-4 has-pb-11" style={kitColours(state.data.colour)}>
        <IncomingSquad />
        <StartScreen format={asked} />
        <Toast />
      </div>
    );
  }

  return (
    <>
      <IncomingSquad />
      <BoardView />
    </>
  );
}

export function SquadBoard() {
  return (
    <MotionConfig reducedMotion="user">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </MotionConfig>
  );
}
