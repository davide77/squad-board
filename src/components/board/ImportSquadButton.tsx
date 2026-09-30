"use client";

import { useRef, useState } from "react";
import { CLUB, CONFIRM } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { DEFAULT_VOICE } from "@/constants/content/landing";
import { readBoard } from "@/lib/board/storage";
import type { BoardData } from "@/lib/board/types";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { ConfirmBox } from "./ConfirmBox";
import { readVoicePref } from "@/lib/voice";

interface ImportSquadButtonProps {
  readonly size?: "regular" | "tiny";
}

/** Loads an exported squad file, asking first when it would replace a squad. */
export function ImportSquadButton({ size = "tiny" }: ImportSquadButtonProps) {
  const { state, act } = useBoard();
  const fileRef = useRef<HTMLInputElement>(null);
  // A file read and waiting, when loading it would replace the coach's squad: asked in place first.
  const [pending, setPending] = useState<BoardData | null>(null);

  // On the start screen there is no board yet, so the gaffer is the one picked last.
  const say = GAFFER[state.data.players.length ? state.data.voice : (readVoicePref() ?? DEFAULT_VOICE)];

  async function importFile(file: File) {
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      act({ type: "notify", text: say.unreadable });
      return;
    }
    const board = readBoard(raw);
    if (!board) {
      act({ type: "notify", text: say.notASquad });
      return;
    }
    if (state.data.players.length && !state.data.example) setPending(board);
    else load(board);
  }

  function load(board: BoardData) {
    setPending(null);
    // The file is itself a copy, so the board counts as backed up.
    act({ type: "load", data: { ...board, backedUpAt: Date.now() }, notice: say.imported });
  }

  return (
    <>
      <Button size={size} variant="quiet" onClick={() => fileRef.current?.click()}>
        {CLUB.import}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="is-hidden"
        aria-label={CLUB.importLabel}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void importFile(file);
        }}
      />
      {pending && (
        <ConfirmBox
          className="is-w-full has-mt-3"
          text={CONFIRM.replaceSquad}
          yes={CONFIRM.replaceSquadYes}
          keep={CONFIRM.keep}
          onYes={() => load(pending)}
          onKeep={() => setPending(null)}
        />
      )}
    </>
  );
}
