import { encode } from "uqr";
import { HANDOFF_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { BADGE_PREFIXES, isBadge, readBoard, snapshot } from "./storage";
import type { BoardData } from "./types";

/*
 * The squad, carried to another device in a link. It sits after the #, which the browser keeps to
 * itself, so the players never reach a server. A shared link carries a small copy of the badge too.
 * The QR code carries the squad only, so it stays coarse enough to scan, and the badge follows in a
 * second code of its own.
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

// A badge in an address: a letter for its kind, then its bytes in base64url, which needs no escaping.
const BADGE_KINDS = { p: BADGE_PREFIXES[0], w: BADGE_PREFIXES[1] } as const;
const isKind = (k: string): k is keyof typeof BADGE_KINDS => k in BADGE_KINDS;

/** "data:image/webp;base64,..." as "w.<base64url>", or "" for anything that is not a badge we wrote. */
export function badgeCode(badge: string): string {
  for (const [kind, prefix] of Object.entries(BADGE_KINDS)) {
    if (badge.startsWith(prefix)) {
      const body = badge.slice(prefix.length).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      return `${kind}.${body}`;
    }
  }
  return "";
}

/** A badge code back as the data URL the board stores, or "" when it was cut short or is not ours. */
export function badgeFromCode(code: string): string {
  const [kind = "", body = "", ...rest] = code.split(".");
  if (rest.length || !isKind(kind) || !/^[\w-]+$/.test(body)) return "";
  const base64 = body.replace(/-/g, "+").replace(/_/g, "/");
  const badge = BADGE_KINDS[kind] + base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return isBadge(badge) ? badge : "";
}

const boardLink = (origin: string, params: Record<string, string>) =>
  `${origin}${ROUTES.board}#${new URLSearchParams(params).toString()}`;

interface SquadLinkExtras {
  /** The travel copy of the badge, from travelBadge. Shared links carry it; the QR code does not. */
  readonly badge?: string;
  /** The sending device has a badge this link does not carry, so the other device can ask for it. */
  readonly badgeBehind?: boolean;
}

/** The address that opens this board on another device. */
export async function squadLink(d: BoardData, now: number, origin: string, extras: SquadLinkExtras = {}): Promise<string> {
  const json = JSON.stringify(snapshot({ ...d, badge: "" }, now));
  const squeezed = new Blob([json]).stream().pipeThrough(new CompressionStream(HANDOFF_CONFIG.compression));
  const bytes = new Uint8Array(await new Response(squeezed).arrayBuffer());
  const params: Record<string, string> = { [HANDOFF_CONFIG.param]: toBase64Url(bytes) };
  const badge = extras.badge ? badgeCode(extras.badge) : "";
  if (badge) params[HANDOFF_CONFIG.badgeParam] = badge;
  else if (extras.badgeBehind) params[HANDOFF_CONFIG.badgeBehindParam] = "1";
  return boardLink(origin, params);
}

/** The address of the badge QR code: the badge on its own, for the team it belongs to. */
export function badgeLink(team: string, badge: string, origin: string): string {
  return boardLink(origin, { [HANDOFF_CONFIG.badgeParam]: badgeCode(badge), [HANDOFF_CONFIG.teamParam]: team.trim() });
}

/** What an address's # carries: a squad code, a badge, or both. */
export interface HandoffLink {
  readonly squad: string | null;
  /** The badge as a data URL, "" when there is none or it did not survive the trip. */
  readonly badge: string;
  /** Set on a badge-only link: the team the badge is for. */
  readonly team: string | null;
  readonly badgeBehind: boolean;
}

/** The hand-off in an address's #, or null when it carries neither a squad nor a badge. */
export function readLink(hash: string): HandoffLink | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const squad = params.get(HANDOFF_CONFIG.param);
  const badgeParam = params.get(HANDOFF_CONFIG.badgeParam);
  if (!squad && badgeParam === null) return null;
  return {
    squad,
    badge: badgeParam ? badgeFromCode(badgeParam) : "",
    team: squad ? null : (params.get(HANDOFF_CONFIG.teamParam) ?? ""),
    badgeBehind: params.get(HANDOFF_CONFIG.badgeBehindParam) === "1",
  };
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
