import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PICKER } from "@/constants/content/board";
import { BoardFixture, fixtureBoard } from "./BoardFixture";
import { Picker } from "./Picker";
import { Pitch } from "./Pitch";

const example = fixtureBoard();

/**
 * Tap a position on the pitch and a sheet lists who can play there, best suited first.
 * The sheet is the phone's way to pick, so these stories run at phone width.
 */
const meta = {
  title: "Board/Picker sheet",
  component: Picker,
  globals: { viewport: { value: "mobile2" } },
  render: () => (
    <BoardFixture data={example}>
      <Pitch />
      <Picker />
    </BoardFixture>
  ),
} satisfies Meta<typeof Picker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpensOnTap: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "9 Taylor, ST" }));
    const sheet = await canvas.findByRole("dialog", { name: PICKER.title("ST", "Taylor") });
    // The striker on the bench is offered first, under the position they play.
    await expect(within(sheet).getByRole("group", { name: PICKER.suited("ST") })).toHaveTextContent("Kit");
    // Focus moves into the sheet, so a keyboard user is not left behind it.
    await waitFor(() => expect(sheet).toContainElement(document.activeElement as HTMLElement));
  },
};

export const PicksAPlayer: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "9 Taylor, ST" }));
    const sheet = await canvas.findByRole("dialog");
    const suited = within(sheet).getByRole("group", { name: PICKER.suited("ST") });
    await userEvent.click(within(suited).getByRole("button", { name: /Kit/ }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("button", { name: "16 Kit, ST" })).toBeVisible();
  },
};

export const EscapeCloses: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "1 Alex, GK" }));
    await canvas.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};
