import { describe, expect, it } from "vitest";
import type { PositionKey } from "@/constants/football";
import { boardReducer, initSandbox, type Action } from "./reducer";
import { playedMs, slotOf, slots } from "./queries";
import { buildBoard } from "./start";
import type { BoardState } from "./types";

const MIN = 60000;

const SQUAD: readonly [string, PositionKey][] = [
  ["Keeper", "GK"],
  ["Left Back", "FB"],
  ["Centre One", "CB"],
  ["Centre Two", "CB"],
  ["Right Back", "FB"],
  ["Mid One", "CM"],
  ["Mid Two", "CM"],
  ["Mid Three", "CM"],
  ["Wing One", "W"],
  ["Striker", "ST"],
  ["Wing Two", "W"],
  ["Sub Striker", "ST"],
  ["Sub Centre", "CB"],
];

/** An 11-a-side board, ids p1 to p13 in squad order, before kick-off. */
function board(): BoardState {
  let n = 0;
  const squad = SQUAD.map(([name, pos], i) => ({ num: String(i + 1), name, pos: [pos] }));
  return initSandbox(buildBoard("Reds", squad, () => `p${++n}`, "U15"), "");
}

/** Plays actions in order, each at its own time. */
function play(state: BoardState, ...steps: [Action, number][]): BoardState {
  return steps.reduce((s, [action, now]) => boardReducer(s, { ...action, now }), state);
}

const idOf = (s: BoardState, name: string) => s.data.players.find((p) => p.name === name)?.id ?? "";
const slotFor = (s: BoardState, name: string) => slotOf(s.data, idOf(s, name)) ?? "";

describe("picking the team", () => {
  it("starts every player on the pitch or the bench, keeper in goal", () => {
    const s = board();
    expect(Object.keys(s.data.xi)).toHaveLength(11);
    expect(s.data.bench).toEqual(["p12", "p13"]);
    const goal = slots(s.data).find((sl) => sl.role === "GK");
    expect(goal && s.data.xi[goal.id]).toBe(idOf(s, "Keeper"));
  });

  it("swaps a bench player onto an occupied position before kick-off without logging a change", () => {
    const s0 = board();
    const target = slotFor(s0, "Striker");
    const s = play(s0, [{ type: "drop", pid: idOf(s0, "Sub Striker"), target: { kind: "slot", id: target } }, 0]);
    expect(s.data.xi[target]).toBe(idOf(s, "Sub Striker"));
    expect(s.data.bench[0]).toBe(idOf(s, "Striker"));
    expect(s.data.subs).toEqual([]);
  });

  it("refuses an injured player and leaves the team as it was", () => {
    const s0 = board();
    const sub = idOf(s0, "Sub Centre");
    const s1 = play(s0, [{ type: "toggleInjured", id: sub }, 0]);
    expect(s1.data.bench).not.toContain(sub);

    const target = slotFor(s1, "Centre One");
    const s2 = play(s1, [{ type: "drop", pid: sub, target: { kind: "slot", id: target } }, 0]);
    expect(s2.data.xi).toEqual(s1.data.xi);
    expect(s2.ui.notice?.id).toBeGreaterThan(s1.ui.notice?.id ?? 0);
  });
});

describe("matchday changes", () => {
  it("logs a change with its minute and keeps each player's time", () => {
    const s0 = board();
    const off = idOf(s0, "Striker");
    const on = idOf(s0, "Sub Striker");
    const s = play(
      s0,
      [{ type: "clockToggle" }, 0],
      [{ type: "selectOff", slotId: slotFor(s0, "Striker") }, 20 * MIN],
      [{ type: "bringOn", pid: on }, 20 * MIN],
    );
    expect(s.data.subs).toEqual([{ min: 21, onName: "Sub Striker", offName: "Striker", inj: false }]);
    expect(s.data.bench).toContain(off);
    expect(playedMs(s.data, off, 50 * MIN)).toBe(20 * MIN);
    expect(playedMs(s.data, on, 50 * MIN)).toBe(30 * MIN);
  });

  it("takes an injured player off the squad for the week, and Reset goes back to kick-off", () => {
    const s0 = board();
    const off = idOf(s0, "Centre One");
    const kickoffXI = s0.data.xi;
    const s1 = play(
      s0,
      [{ type: "clockToggle" }, 0],
      [{ type: "selectOff", slotId: slotFor(s0, "Centre One") }, 10 * MIN],
      [{ type: "toggleOffInjured" }, 10 * MIN],
      [{ type: "bringOn", pid: idOf(s0, "Sub Centre") }, 10 * MIN],
    );
    expect(s1.data.subs[0].inj).toBe(true);
    expect(s1.data.players.find((p) => p.id === off)).toMatchObject({ inj: true, out: true });
    expect(s1.data.bench).not.toContain(off);

    const s2 = play(s1, [{ type: "clockReset" }, 15 * MIN]);
    expect(s2.data.xi).toEqual(kickoffXI);
    expect(s2.data.players.find((p) => p.id === off)).toMatchObject({ inj: false, out: false });
    expect(s2.data.subs).toEqual([]);
    expect(s2.data.clock.base).toBe(0);
    expect(s2.ui.step).toBe("pick");
  });
});

describe("undo", () => {
  it("takes back the last change to the team", () => {
    const s0 = board();
    const s1 = play(s0, [{ type: "drop", pid: idOf(s0, "Keeper"), target: { kind: "bench" } }, 1000]);
    expect(s1.ui.undo).not.toBeNull();

    const s2 = play(s1, [{ type: "undo" }, 2000]);
    expect(s2.data.xi).toEqual(s0.data.xi);
    expect(s2.data.bench).toEqual(s0.data.bench);
    expect(s2.ui.undo).toBeNull();
  });

  it("is lost once something else on the board changes", () => {
    const s0 = board();
    const s1 = play(
      s0,
      [{ type: "drop", pid: idOf(s0, "Keeper"), target: { kind: "bench" } }, 1000],
      [{ type: "setTeam", value: "Blues" }, 2000],
    );
    expect(s1.ui.undo).toBeNull();
    expect(play(s1, [{ type: "undo" }, 3000])).toBe(s1);
  });
});

describe("formats", () => {
  it("moves to 7-a-side without losing anyone, keeper still in goal", () => {
    const s0 = board();
    const s = play(s0, [{ type: "setFormat", format: "7v7" }, 0]);
    const placed = [...Object.values(s.data.xi), ...s.data.bench];
    expect(Object.keys(s.data.xi)).toHaveLength(7);
    expect(new Set(placed).size).toBe(13);
    const goal = slots(s.data).find((sl) => sl.role === "GK");
    expect(goal && s.data.xi[goal.id]).toBe(idOf(s, "Keeper"));
  });

  it("will not load an 11-a-side plan onto a 7-a-side board", () => {
    const s1 = play(board(), [{ type: "saveNamed", name: "Cup final" }, 0], [{ type: "setFormat", format: "7v7" }, 0]);
    expect(play(s1, [{ type: "loadNamed", index: 0 }, 0])).toBe(s1);
  });
});

describe("new matchday", () => {
  it("clears the week but keeps injuries", () => {
    const s0 = board();
    const hurt = idOf(s0, "Wing One");
    const missed = idOf(s0, "Wing Two");
    const s = play(
      s0,
      [{ type: "toggleInjured", id: hurt }, 0],
      [{ type: "toggleTraining", id: missed }, 0],
      [{ type: "setMatch", field: "date", value: "2026-10-10" }, 0],
      [{ type: "newMatchday" }, 0],
    );
    expect(s.data.players.every((p) => p.out)).toBe(true);
    expect(s.data.players.find((p) => p.id === hurt)?.inj).toBe(true);
    expect(s.data.players.find((p) => p.id === missed)?.trn).toBe(false);
    expect(s.data.match.date).toBe("");
    expect(Object.keys(s.data.xi)).toHaveLength(0);
  });
});
