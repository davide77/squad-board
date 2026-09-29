"use client";

import { createContext, use, useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { BOARD_CONFIG } from "@/constants/config";
import { boardReducer, initBoard, initSandbox, type Action } from "@/lib/board/reducer";
import { keepStored, writeStored } from "@/lib/board/storage";
import type { BoardData, BoardState } from "@/lib/board/types";

interface BoardContextValue {
  readonly state: BoardState;
  readonly act: (action: Action) => void;
  /** True for a board kept in memory only, like the example team. Nothing is saved and there is nothing to back up. */
  readonly sandbox: boolean;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoard(): BoardContextValue {
  const value = use(BoardContext);
  if (!value) throw new Error("useBoard must be used inside <BoardProvider>");
  return value;
}

interface BoardProviderProps {
  readonly children: ReactNode;
  /** Plays this board in memory instead of the one in storage, opening with `notice`. */
  readonly sandbox?: { readonly data: BoardData; readonly notice: string };
}

export function BoardProvider({ children, sandbox }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, sandbox, (s) => (s ? initSandbox(s.data, s.notice) : initBoard()));
  const inMemory = !!sandbox;
  const act = useCallback((action: Action) => dispatch({ ...action, now: Date.now() }), []);

  // Writes to localStorage a moment after the last change.
  const { data } = state;
  useEffect(() => {
    if (inMemory) return;
    const timer = setTimeout(() => {
      if (!writeStored(data, Date.now())) act({ type: "storageFailed" });
    }, BOARD_CONFIG.saveDebounceMs);
    return () => clearTimeout(timer);
  }, [data, act, inMemory]);

  // Once the coach has a team of their own, ask the browser to keep it.
  const ownTeam = !inMemory && data.players.length > 0 && !data.example;
  useEffect(() => {
    if (ownTeam) void keepStored();
  }, [ownTeam]);

  const value = useMemo(() => ({ state, act, sandbox: inMemory }), [state, act, inMemory]);
  return <BoardContext value={value}>{children}</BoardContext>;
}
