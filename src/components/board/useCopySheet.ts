"use client";

import { useCallback } from "react";
import { ANALYTICS_EVENTS, SENT_HOW, SENT_WHAT, type SentWhat } from "@/constants/config";
import { GAFFER } from "@/constants/content/gaffer";
import { trackEvent } from "@/lib/analytics";
import { sheetText } from "@/lib/board/sheet";
import type { BoardData } from "@/lib/board/types";
import { useBoard } from "./BoardProvider";

/** Puts text on the clipboard, with the old textarea route where the API is missing. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.className = "sr-only";
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/**
 * Copies the team sheet, or another message built from the board, and lets the Gaffer say how it went.
 * Used by the pitch, the sheet panel and the squad message.
 */
export function useCopySheet(build: (d: BoardData) => string = sheetText, what: SentWhat = SENT_WHAT.sheet) {
  const { state, act } = useBoard();
  const { data } = state;
  return useCallback(async () => {
    const ok = await copyText(build(data));
    if (ok) trackEvent(ANALYTICS_EVENTS.sheetSent, { what, how: SENT_HOW.copy });
    act({ type: "notify", text: ok ? GAFFER[data.voice].copied : GAFFER[data.voice].copyFailed });
  }, [data, act, build, what]);
}
