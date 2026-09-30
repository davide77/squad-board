"use client";

import { useCallback } from "react";
import { SENT_HOW, type AnalyticsEvent } from "@/constants/config";
import { GAFFER } from "@/constants/content/gaffer";
import { trackSend } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";
import type { BoardData } from "@/lib/board/types";
import { useBoard } from "./BoardProvider";

/**
 * Copies a message built from the board, the call-up or the result, counts it as sent by copying,
 * and lets the Gaffer say how it went.
 */
export function useCopySheet(build: (d: BoardData) => string, sent: AnalyticsEvent) {
  const { state, act } = useBoard();
  const { data } = state;
  return useCallback(async () => {
    const ok = await copyText(build(data));
    if (ok) trackSend(sent, data, SENT_HOW.copy);
    act({ type: "notify", text: ok ? GAFFER[data.voice].copied : GAFFER[data.voice].copyFailed });
  }, [data, act, build, sent]);
}
