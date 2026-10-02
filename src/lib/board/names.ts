import type { NameStyle } from "@/constants/content/board";
import type { Player } from "./types";

// A name in brackets is a known-as name, so it wins over the formal one.
function nickOf(name: string): string | null {
  const m = /\(([^)]+)\)/.exec(name);
  return m ? m[1].trim() : null;
}

export function plainName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

export function firstName(name: string): string {
  return nickOf(name) ?? plainName(name).split(/\s+/)[0];
}

export function lastName(name: string): string {
  const parts = plainName(name).split(/\s+/);
  return parts[parts.length - 1];
}

function initials(name: string): string {
  return plainName(name)
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

/** The name printed under a shirt on the pitch. */
export function shirtName(player: Player, style: NameStyle, players: readonly Player[]): string {
  const first = firstName(player.name);
  if (style === "first") {
    const lower = first.toLowerCase();
    const shared = players.filter((p) => firstName(p.name).toLowerCase() === lower).length > 1;
    return shared ? `${first} ${lastName(player.name).charAt(0)}` : first;
  }
  if (style === "initials") return player.init || initials(player.name);
  if (style === "full") return plainName(player.name);
  return lastName(player.name);
}

/**
 * A player's name as it goes to the parents, in the style the coach picked under Send: first names,
 * initials, full names or surnames. `name` may be a name from the subs log, matched back to its player.
 */
export function sentName(d: { readonly nameStyle: NameStyle; readonly players: readonly Player[] }, name: string): string {
  const p = d.players.find((x) => x.name === name);
  return p ? shirtName(p, d.nameStyle, d.players) : name;
}

/** The first letters of the first two words: "Ayat Sunday" is AS. A team's crest, or a player with no shirt number. */
export function monogram(team: string): string {
  return team
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/** The team name as a file name, or the fallback when there is none. */
export function teamSlug(team: string, fallback: string): string {
  const slug = team.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  return slug || fallback;
}
