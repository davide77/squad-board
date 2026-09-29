"use client";

import { MotionConfig } from "framer-motion";
import { BoardProvider, useBoard } from "./BoardProvider";
import { BoardView, kitColours } from "./BoardView";
import { StartScreen } from "./StartScreen";
import { Toast } from "./Toast";

function Board() {
  const { state } = useBoard();

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
