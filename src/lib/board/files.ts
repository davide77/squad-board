import { CLUB } from "@/constants/content/board";
import { teamSlug } from "./names";
import { snapshot } from "./storage";
import type { BoardData } from "./types";

/** Saves a file to the device through a temporary link. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** Downloads the board as a squad file, the backup that moves it between devices. */
export function exportSquadFile(d: BoardData, now: number): void {
  const blob = new Blob([JSON.stringify(snapshot({ ...d, backedUpAt: now }, now), null, 2)], { type: "application/json" });
  downloadBlob(blob, teamSlug(d.team, CLUB.fileFallback) + CLUB.fileSuffix);
}
