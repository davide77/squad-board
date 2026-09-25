"use client";

import dynamic from "next/dynamic";

// The whole board lives in this browser's storage, so it renders in the browser
// only. The server has nothing true to show before it loads.
const SquadBoard = dynamic(() => import("./SquadBoard").then((m) => m.SquadBoard), { ssr: false });

export function BoardClient() {
  return <SquadBoard />;
}
