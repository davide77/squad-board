import { describe, expect, it } from "vitest";
import { fitsFormat, slots } from "./queries";
import { buildBoard, parseSquad } from "./start";

const ids = () => {
  let n = 0;
  return () => `p${++n}`;
};

describe("parseSquad", () => {
  it("reads a list pasted from WhatsApp", () => {
    const squad = parseSquad(
      ["Saturday squad:", "1. Alex Smith GK", "• Jordan Lee (c) RB 2", "- Sam W ⚽", "7 Chris Day LW, ST", "12"].join("\n"),
    );
    expect(squad).toEqual([
      { num: "1", name: "Alex Smith", pos: ["GK"], side: null },
      { num: "2", name: "Jordan Lee", pos: ["FB"], side: "R" },
      // A capital initial stays part of the name.
      { num: "", name: "Sam W", pos: [], side: null },
      { num: "7", name: "Chris Day", pos: ["W", "ST"], side: "L" },
    ]);
  });

  it("reads a single comma separated line", () => {
    expect(parseSquad("Alex, Jordan; Sam").map((e) => e.name)).toEqual(["Alex", "Jordan", "Sam"]);
  });
});

describe("buildBoard", () => {
  it("puts the age group's format on the pitch and the rest on the bench", () => {
    const squad = [
      { num: "2", name: "Defender", pos: ["CB"] as const },
      { num: "1", name: "Keeper", pos: ["GK"] as const },
      ...Array.from({ length: 8 }, (_, i) => ({ num: String(i + 3), name: `Player ${i + 3}`, pos: [] as const })),
    ];
    const d = buildBoard("Blues", squad, ids(), "U10");

    expect(d.format).toBe("7v7");
    expect(Object.keys(d.xi)).toHaveLength(7);
    expect(d.bench).toHaveLength(3);
    // The keeper goes in goal even though they were not listed first.
    const goal = slots(d).find((s) => s.role === "GK");
    expect(goal && d.players.find((p) => p.id === d.xi[goal.id])?.name).toBe("Keeper");
  });

  it("only treats a line-up as fitting a board of the same format", () => {
    const eleven = buildBoard("A", [], ids(), "U15");
    const seven = buildBoard("B", [], ids(), "U10");
    expect(eleven.preset && fitsFormat(eleven.preset, seven)).toBe(false);
    expect(seven.preset && fitsFormat(seven.preset, seven)).toBe(true);
    expect(fitsFormat({ formation: "Custom formation", xi: {}, bench: [], custom: Array(7).fill({ x: 50, y: 50 }) }, seven)).toBe(true);
  });
});
