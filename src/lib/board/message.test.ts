import { describe, expect, it } from "vitest";
import { boldRuns, fixtureVersus, squadMessage } from "./message";
import { emptyData } from "./storage";

describe("squadMessage", () => {
  it("puts the title, the times and the squad heading in bold", () => {
    const d = emptyData();
    const lines = squadMessage({
      ...d,
      team: "Ayat U15",
      sheetCredit: false,
      match: { ...d.match, date: "2026-11-01", kickoff: "09:30", meet: "09:00" },
    }).split("\n");
    expect(lines[0]).toBe("*Ayat U15 - Sunday 1 November*");
    expect(lines).toContain("Kick-off: *09:30*");
    expect(lines).toContain("Meet: *09:00*");
    expect(lines).toContain("*Matchday squad:*");
  });

  it("drops a stray mark from the team name so the bold still holds", () => {
    const d = emptyData();
    expect(squadMessage({ ...d, team: "Stars*", sheetCredit: false }).split("\n")[0]).toBe("*Stars*");
  });
});

describe("boldRuns", () => {
  it("splits a line into plain and bold runs", () => {
    expect(boldRuns("Kick-off: *09:30*")).toEqual([
      { text: "Kick-off: ", bold: false },
      { text: "09:30", bold: true },
    ]);
  });

  it("leaves a line with an unpaired mark plain", () => {
    expect(boldRuns("5*a side")).toEqual([{ text: "5*a side", bold: false }]);
  });
});

describe("fixtureVersus", () => {
  it("puts v before an opponent typed on its own", () => {
    expect(fixtureVersus("Redbridge Youth U15 Blue C Div")).toBe("v Redbridge Youth U15 Blue C Div");
  });

  it("keeps a v or vs the coach typed", () => {
    expect(fixtureVersus("v Northgate")).toBe("v Northgate");
    expect(fixtureVersus("vs. Northgate")).toBe("vs. Northgate");
    expect(fixtureVersus("VS Northgate")).toBe("VS Northgate");
  });

  it("does not mistake a name starting with v for the prefix", () => {
    expect(fixtureVersus("Valley Rangers")).toBe("v Valley Rangers");
  });

  it("stays empty when nothing is typed", () => {
    expect(fixtureVersus("  ")).toBe("");
  });

  it("heads the fixture line of the call-up", () => {
    const d = { ...emptyData(), team: "Ayat", fixture: "Redbridge", players: [] };
    d.match = { ...d.match, venue: "home", competition: "cup" };
    expect(squadMessage(d)).toContain("v Redbridge (home, cup)");
  });
});
