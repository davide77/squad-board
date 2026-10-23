"use client";

import dynamic from "next/dynamic";
import { BoardSkeleton } from "./BoardSkeleton";

// The whole board lives in this browser's storage, so it renders in the browser
// only. The server has nothing true to show before it loads, so it shows the board's shape.
const SquadBoard = dynamic(() => import("./SquadBoard").then((m) => m.SquadBoard), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

export function BoardClient() {
  return <SquadBoard />;
}
