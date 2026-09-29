"use client";

import { createContext, use, useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { BOARD_CONFIG } from "@/constants/config";
import { boardReducer, initBoard, type Action } from "@/lib/board/reducer";
import { keepStored, writeStored } from "@/lib/board/storage";
import type { BoardState } from "@/lib/board/types";

interface BoardContextValue {
  readonly state: BoardState;
  readonly act: (action: Action) => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoard(): BoardContextValue {
  const value = use(BoardContext);
  if (!value) throw new Error("useBoard must be used inside <BoardProvider>");
  return value;
}

interface BoardProviderProps {
  readonly children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, undefined, initBoard);
  const act = useCallback((action: Action) => dispatch({ ...action, now: Date.now() }), []);

  // Writes to localStorage a moment after the last change.
  const { data } = state;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!writeStored(data, Date.now())) act({ type: "storageFailed" });
    }, BOARD_CONFIG.saveDebounceMs);
    return () => clearTimeout(timer);
  }, [data, act]);

  // Once the coach has a team of their own, ask the browser to keep it.
  const ownTeam = data.players.length > 0 && !data.example;
  useEffect(() => {
    if (ownTeam) void keepStored();
  }, [ownTeam]);

  const value = useMemo(() => ({ state, act }), [state, act]);
  return <BoardContext value={value}>{children}</BoardContext>;
}
