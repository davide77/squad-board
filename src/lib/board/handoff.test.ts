import { describe, expect, it } from "vitest";
import { badgeCode, badgeFromCode, badgeLink, readLink, readSquadCode, squadLink } from "./handoff";
import { emptyData } from "./storage";
import type { BoardData } from "./types";

const ORIGIN = "https://gafferboard.com";
// Bytes chosen so the base64 holds "+", "/" and padding, the characters an address would mangle.
const WEBP = "data:image/webp;base64,+/+/AAA=";
const PNG = "data:image/png;base64,iVBORw0KGgo=";

function board(): BoardData {
  const d = emptyData();
  return { ...d, team: "Ayat", players: [{ ...d.players[0], id: "p1", name: "Luca" } as BoardData["players"][number]] };
}

const hashOf = (url: string) => new URL(url).hash;

describe("badge codes", () => {
  it("round trips a WebP and a PNG badge", () => {
    expect(badgeFromCode(badgeCode(WEBP))).toBe(WEBP);
    expect(badgeFromCode(badgeCode(PNG))).toBe(PNG);
  });

  it("needs no escaping in an address", () => {
    expect(badgeCode(WEBP)).toMatch(/^w\.[\w-]+$/);
  });

  it("drops anything that is not a badge we wrote", () => {
    expect(badgeCode("https://example.com/crest.png")).toBe("");
    expect(badgeFromCode("x.AAAA")).toBe("");
    expect(badgeFromCode("w.AA AA")).toBe("");
    expect(badgeFromCode("")).toBe("");
  });
});

describe("readLink", () => {
  it("is null for an address with nothing for us", () => {
    expect(readLink("")).toBeNull();
    expect(readLink("#pitch")).toBeNull();
  });

  it("reads a badge-only link with its team", () => {
    const link = readLink(hashOf(badgeLink(" Ayat ", WEBP, ORIGIN)));
    expect(link).toEqual({ squad: null, badge: WEBP, team: "Ayat", badgeBehind: false });
  });
});

describe("squadLink", () => {
  it("keeps the badge out of the squad itself", async () => {
    const link = readLink(hashOf(await squadLink({ ...board(), badge: PNG }, 1, ORIGIN)));
    const sent = await readSquadCode(link?.squad ?? "");
    expect(sent?.team).toBe("Ayat");
    expect(sent?.badge).toBe("");
    expect(link?.badge).toBe("");
    expect(link?.badgeBehind).toBe(false);
  });

  it("carries the travel badge when given one", async () => {
    const link = readLink(hashOf(await squadLink(board(), 1, ORIGIN, { badge: WEBP, badgeBehind: true })));
    expect(link?.badge).toBe(WEBP);
    // The badge is here, so nothing is left behind to ask for.
    expect(link?.badgeBehind).toBe(false);
    expect(link?.team).toBeNull();
  });

  it("says a badge stayed behind when it could not come", async () => {
    const link = readLink(hashOf(await squadLink(board(), 1, ORIGIN, { badgeBehind: true })));
    expect(link?.badge).toBe("");
    expect(link?.badgeBehind).toBe(true);
  });
});
