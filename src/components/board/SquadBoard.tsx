"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { trackBoardOpened } from "@/lib/analytics";
import { BoardProvider, useBoard } from "./BoardProvider";
import { kitColours } from "@/lib/board/kit";
import { BoardView } from "./BoardView";
import { StartScreen } from "./StartScreen";
import { Toast } from "./Toast";

function Board() {
  const { state } = useBoard();
  // Read once: a board already saved when the page opened is a coach coming back.
  const [reopened] = useState(() => state.data.players.length > 0 && !state.data.example);
  useEffect(() => {
    if (reopened) trackBoardOpened();
  }, [reopened]);

  // An empty board opens on the start screen: name the team, paste the squad, done.
  if (!state.data.players.length) {
    return (
      <div className="board container has-pt-4 has-pb-11" style={kitColours(state.data.colour)}>
        <StartScreen />
        <Toast />
      </div>
    );
  }

  return <BoardView />;
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
