"use client";

import { useCallback } from "react";
import { GAFFER } from "@/constants/content/gaffer";
import { sheetText } from "@/lib/board/sheet";
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

/** Copies the team sheet and lets the Gaffer say how it went. Used by the pitch and the sheet panel. */
export function useCopySheet() {
  const { state, act } = useBoard();
  const { data } = state;
  return useCallback(async () => {
    const ok = await copyText(sheetText(data));
    act({ type: "notify", text: ok ? GAFFER[data.voice].copied : GAFFER[data.voice].copyFailed });
  }, [data, act]);
}
