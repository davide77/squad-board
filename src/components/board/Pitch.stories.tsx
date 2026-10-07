import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { KIT_COLOURS } from "@/constants/brand";
import { slots } from "@/lib/board/queries";
import type { Action } from "@/lib/board/reducer";
import type { BoardData } from "@/lib/board/types";
import { buildBoard } from "@/lib/board/start";
import { BoardFixture, fixtureBoard } from "./BoardFixture";
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
