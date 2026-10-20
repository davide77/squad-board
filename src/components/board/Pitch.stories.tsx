import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { KIT_COLOURS } from "@/constants/brand";
import { CUSTOM_FORMATION } from "@/constants/football";
import { slots } from "@/lib/board/queries";
import type { Action } from "@/lib/board/reducer";
import type { BoardData } from "@/lib/board/types";
import { buildBoard } from "@/lib/board/start";
import { BoardFixture, fixtureBoard } from "./BoardFixture";
import { ChangeBar, MatchBench } from "./Matchday";
import { Pitch } from "./Pitch";

const example = fixtureBoard();
const slotWith = (name: string) => {
  const id = example.players.find((p) => p.name === name)?.id;
  return slots(example).find((s) => example.xi[s.id] === id)?.id ?? "";
};

interface PitchArgs {
  readonly data: BoardData;
  /** What the coach did before the story is looked at. */
  readonly setup: readonly Action[];
}

const meta = {
  title: "Board/Pitch",
  args: { data: example, setup: [] },
  render: ({ data, setup }) => (
    <BoardFixture data={data} setup={setup}>
      <Pitch />
    </BoardFixture>
  ),
} satisfies Meta<PitchArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Picking the team: each marker shows the shirt, the name, and who on the bench covers that position. */
export const PickingTheTeam: Story = {
  play: async ({ canvas, canvasElement }) => {
    const markers = canvasElement.querySelectorAll("[data-slot]");
    await expect(markers).toHaveLength(11);
    await expect(canvasElement.querySelectorAll(".pitch-slot--keeper")).toHaveLength(1);
    // Each marker names the player and the position for a screen reader.
    await expect(canvas.getByRole("button", { name: "1 Alex, GK" })).toBeVisible();
  },
};

/** During the match a marker shows the minutes played instead of the cover. */
export const Matchday: Story = {
  args: { setup: [{ type: "clockToggle" }, { type: "setStep", step: "match" }] },
  play: async ({ canvas }) => {
    await expect(await canvas.findAllByText("0' played")).toHaveLength(11);
  },
};

/** A player out of position is marked, so the coach sees the problem where they are looking. */
export const OutOfPosition: Story = {
  args: { setup: [{ type: "drop", pid: "p1", target: { kind: "slot", id: slotWith("Taylor") } }] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".pitch-slot--misfit")).not.toBeNull();
  },
};

/** Two players with the same shirt number are both marked. */
export const ShirtNumberClash: Story = {
  args: {
    data: fixtureBoard((d) => {
      d.players[1].num = d.players[2].num;
    }),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll(".pitch-slot--clash")).toHaveLength(2);
  },
};

/** The same pitch at 7-a-side for an under 10s team: the format comes from the age group. */
export const SevenASide: Story = {
  args: {
    data: buildBoard(
      "Under 10s",
      ["Alex GK", "Charlie", "Riley", "Jamie", "Sam", "Frankie", "Taylor", "Mia"].map((line) => {
        const [name, pos] = line.split(" ");
        return { num: "", name, pos: pos ? ["GK" as const] : [] };
      }),
      (() => {
        let n = 0;
        return () => `u${++n}`;
      })(),
      "U10",
    ),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-slot]")).toHaveLength(7);
  },
};

/** The club colour is set at runtime through custom properties, so every club gets its own board from one stylesheet. */
export const ClubColour: Story = {
  args: { data: fixtureBoard((d) => (d.colour = Math.max(0, KIT_COLOURS.findIndex((k) => k.name === "Sky")))) },
};

/** Moving positions works without a mouse: tab to a marker and the arrow keys move it, Shift further. */
export const MoveAMarkerWithTheKeys: Story = {
  args: { setup: [{ type: "setFormation", name: CUSTOM_FORMATION }, { type: "togglePosMode" }] },
  play: async ({ canvasElement }) => {
    const marker = await waitFor(() => {
      const m = canvasElement.querySelector<HTMLElement>(".pitch-slot--movable");
      if (!m) throw new Error("no movable marker yet");
      return m;
    });
    const before = marker.getAttribute("style");
    marker.focus();
    await userEvent.keyboard("{ArrowLeft}{Shift>}{ArrowUp}{/Shift}");
    await waitFor(() => expect(canvasElement.querySelector("[data-slot]")?.getAttribute("style")).not.toBe(before));
    // Focus stays on the marker, so the coach can keep moving it.
    await expect(document.activeElement?.hasAttribute("data-slot")).toBe(true);
  },
};

/**
 * A substitution from the keyboard alone. Choosing who comes off sends focus to the first "On for"
 * button, which on a wide screen is in the bench list beside the pitch; bringing them on returns focus
 * to the marker; Escape lets go and does the same.
 */
export const SubstitutionWithTheKeyboard: Story = {
  args: { setup: [{ type: "clockToggle" }, { type: "setStep", step: "match" }] },
  render: ({ data, setup }) => (
    <BoardFixture data={data} setup={setup}>
      <MatchBench />
      <Pitch />
      <ChangeBar />
    </BoardFixture>
  ),
  play: async ({ canvas }) => {
    const markerFor = (name: RegExp) => canvas.findByRole("button", { name });
    const nine = await markerFor(/^9 /);
    nine.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement?.hasAttribute("data-on")).toBe(true));

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement?.hasAttribute("data-slot")).toBe(true));
    await expect(document.activeElement?.getAttribute("aria-label")).not.toMatch(/^9 /);

    // Pick someone off again, then change your mind.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement?.hasAttribute("data-on")).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement?.hasAttribute("data-slot")).toBe(true));
  },
};
