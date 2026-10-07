import { describe, expect, it } from "vitest";
import { parseStored, readBoard, snapshot } from "./storage";
import { buildBoard } from "./start";

const player = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: `Player ${id}`, num: id, pos: ["CM"], ...extra });

describe("readBoard", () => {
  it("refuses anything that is not a squad file", () => {
    expect(readBoard(null)).toBeNull();
    expect(readBoard("squad")).toBeNull();
    expect(readBoard([])).toBeNull();
    expect(readBoard({ team: "No players key" })).toBeNull();
  });

  it("cleans untrusted fields in an imported file", () => {
    const d = readBoard({
      players: [
        player("a", { pos: ["GK", "Striker?", 7], side: "middle", inj: "yes" }),
        { id: 42, name: "Numeric id" },
        { id: "b" },
        "not a player",
      ],
      match: { date: "next Saturday", kickoff: "10:30", meet: "9am", us: -3, them: 2.7, venue: "moon", ended: "true" },
      badge: "javascript:alert(1)",
      clock: { running: true, base: 125000, since: 99 },
      colour: 999,
      nameStyle: "shouting",
      voice: "nobody",
    });
    expect(d).not.toBeNull();
    if (!d) return;

    // Only the well formed player survives, with unknown positions dropped.
    expect(d.players.map((p) => p.id)).toEqual(["a"]);
    expect(d.players[0].pos).toEqual(["GK"]);
    expect(d.players[0].side).toBeNull();
    expect(d.players[0].inj).toBe(true);

    expect(d.match).toMatchObject({ date: "", kickoff: "10:30", meet: "", us: 0, them: 2, venue: "", ended: false });
    // A badge that is not this app's PNG could be a link, so it is dropped.
    expect(d.badge).toBe("");
    // The clock always reopens paused where it was left.
    expect(d.clock).toEqual({ running: false, base: 125000, since: 0 });
    expect(d.colour).toBe(0);
    expect(d.nameStyle).toBe("first");
  });

  it("upgrades a board saved before formats, age groups and kits existed", () => {
    const d = readBoard({
      players: [player("a", { pos: ["DM"] })],
      formation: "4-4-2",
      awayColour: 1,
    });
    expect(d).not.toBeNull();
    if (!d) return;
    expect(d.format).toBe("11v11");
    expect(d.age).toBeNull();
    expect(d.formation).toBe("4-4-2");
    // "DM" was renamed "CDM".
    expect(d.players[0].pos).toEqual(["CDM"]);
    // The old away colour becomes the away shirt.
    expect(d.kits.away.shirt).not.toBe(d.kits.home.shirt);
  });

  it("falls back to the format's first shape when the formation does not fit", () => {
    const wrongShape = readBoard({ players: [player("a")], format: "7v7", formation: "4-3-3" });
    expect(wrongShape?.formation).toBe("2-3-1");

    // A custom shape needs one point per player in the format.
    const shortCustom = readBoard({ players: [player("a")], format: "5v5", formation: "Custom formation", custom: [{ x: 50, y: 50 }] });
    expect(shortCustom?.formation).toBe("1-2-1");
  });
});

describe("parseStored", () => {
  it("returns null for missing, broken or empty storage", () => {
    expect(parseStored(null)).toBeNull();
    expect(parseStored("{not json")).toBeNull();
    expect(parseStored(JSON.stringify({ players: [] }))).toBeNull();
  });

  it("round-trips a saved board, banking a running clock", () => {
    let n = 0;
    const d = buildBoard("Reds", [{ num: "1", name: "Sam Keeper", pos: ["GK"] }], () => `p${++n}`, "U15");
    d.clock = { running: true, base: 60000, since: 1000 };

    const back = parseStored(JSON.stringify(snapshot(d, 31000)));
    expect(back?.team).toBe("Reds");
    expect(back?.players).toEqual(d.players);
    expect(back?.clock).toEqual({ running: false, base: 90000, since: 0 });
  });
});
