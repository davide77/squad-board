import { encode } from "uqr";
import { HANDOFF_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { readBoard, snapshot } from "./storage";
import type { BoardData } from "./types";

/*
 * The squad, carried to another device in a link. It sits after the #, which the browser keeps to
 * itself, so the players never reach a server. The badge stays behind: it is too big for a QR code.
 */

/** False on an older browser that cannot squeeze the squad small enough to send. */
export const canHandOff = (): boolean =>
  typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): Uint8Array<ArrayBuffer> {
  const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** The address that opens this board on another device. */
export async function squadLink(d: BoardData, now: number, origin: string): Promise<string> {
  const json = JSON.stringify(snapshot({ ...d, badge: "" }, now));
  const squeezed = new Blob([json]).stream().pipeThrough(new CompressionStream(HANDOFF_CONFIG.compression));
  const bytes = new Uint8Array(await new Response(squeezed).arrayBuffer());
  return `${origin}${ROUTES.board}#${HANDOFF_CONFIG.param}=${toBase64Url(bytes)}`;
}

/** The squad code in an address's #, or null when it carries none. */
export function linkCode(hash: string): string | null {
  return new URLSearchParams(hash.replace(/^#/, "")).get(HANDOFF_CONFIG.param);
}

/** The board a squad code carries, or null when the link was cut short or is not one of ours. */
export async function readSquadCode(code: string): Promise<BoardData | null> {
  try {
    const opened = new Blob([fromBase64Url(code)]).stream().pipeThrough(new DecompressionStream(HANDOFF_CONFIG.compression));
    const board = readBoard(JSON.parse(await new Response(opened).text()));
    return board?.players.length ? board : null;
  } catch {
    return null;
  }
}

/** A QR code as one SVG path, a unit square per dark module, on a grid `size` wide. */
export function qrPath(text: string): { readonly size: number; readonly path: string } {
  const { size, data } = encode(text, { ecc: HANDOFF_CONFIG.ecc, border: HANDOFF_CONFIG.border });
  let path = "";
  data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    }),
  );
  return { size, path };
}
