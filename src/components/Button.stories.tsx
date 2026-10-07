import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Design system/Button",
  component: Button,
  args: { children: "Send call-up", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "primary", "quiet", "out", "outline", "chalk"] },
    size: { control: "inline-radio", options: ["regular", "tiny"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Send call-up" });
    // A button that submits by accident is a classic bug inside a form.
    await expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Primary: Story = { args: { variant: "primary" } };

export const Quiet: Story = { args: { variant: "quiet", children: "Close" } };

export const Outline: Story = { args: { variant: "outline", children: "Save line-up" } };

export const Tiny: Story = { args: { size: "tiny", children: "Sort by number" } };

export const WithIcon: Story = { args: { icon: "kit", children: "Customise your club" } };

/** A toggle that is on takes the kit colour, whatever its variant. */
export const ToggledOn: Story = {
  args: { on: true, children: "Show cover", "aria-pressed": true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Show cover" })).toHaveClass("button--primary");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button"), { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
