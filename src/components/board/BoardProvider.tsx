"use client";

import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { BOARD_CONFIG, STORAGE_KEY } from "@/constants/config";
import { boardReducer, initBoard, initSandbox, type Action, type StampedAction } from "@/lib/board/reducer";
import { keepStored, readStoredRaw, readSynced, writeStored } from "@/lib/board/storage";
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
  const [state, dispatch] = useReducer(boardReducer, sandbox, (s) => (s ? initSandbox(s.data, s.notice) : initBoard(Date.now())));
  const inMemory = !!sandbox;

  // Two tabs can have the same board open. Each one remembers what it last saw in storage, the
  // screen at that moment, and every action since. When the other tab has saved in between,
  // this one takes that board and plays its own actions on top, instead of writing over it.
  const seen = useRef<string | null>(null);
  const pending = useRef<StampedAction[]>([]);
  const savedUi = useRef(state.ui);
  const latest = useRef(state);
  const adopted = useRef<BoardData | null>(null);
  useEffect(() => {
    latest.current = state;
  });
  useEffect(() => {
    if (!inMemory) seen.current = readStoredRaw();
  }, [inMemory]);

  const act = useCallback(
    (action: Action) => {
      const stamped: StampedAction = { ...action, now: Date.now() };
      if (!inMemory) pending.current.push(stamped);
      dispatch(stamped);
    },
    [inMemory],
  );

  const adopt = useCallback(
    (raw: string | null) => {
      const now = Date.now();
      const data = readSynced(raw, now);
      seen.current = raw;
      // With nothing of its own to add, this tab now matches storage and has nothing to write back.
      adopted.current = pending.current.length ? null : data;
      dispatch({ type: "adopt", data, ui: savedUi.current, replay: [...pending.current], now });
    },
    [],
  );

  // Writes to localStorage a moment after the last change, unless another tab saved first.
  const { data } = state;
  useEffect(() => {
    if (inMemory || data === adopted.current) return;
    const timer = setTimeout(() => {
      const stored = readStoredRaw();
      if (stored !== seen.current) return adopt(stored);
      const written = writeStored(data);
      if (!written) return act({ type: "storageFailed" });
      seen.current = written;
      pending.current = [];
      savedUi.current = latest.current.ui;
    }, BOARD_CONFIG.saveDebounceMs);
    return () => clearTimeout(timer);
  }, [data, act, adopt, inMemory]);

  // Another tab saved or cleared the board.
  useEffect(() => {
    if (inMemory) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      const raw = readStoredRaw();
      if (raw !== seen.current) adopt(raw);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [adopt, inMemory]);

  // Once the coach has a team of their own, ask the browser to keep it.
  const ownTeam = !inMemory && data.players.length > 0 && !data.example;
  useEffect(() => {
    if (ownTeam) void keepStored();
  }, [ownTeam]);

  const value = useMemo(() => ({ state, act, sandbox: inMemory }), [state, act, inMemory]);
  return <BoardContext value={value}>{children}</BoardContext>;
}
