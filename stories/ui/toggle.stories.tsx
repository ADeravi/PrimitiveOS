import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { userEvent, within, expect } from "storybook/test";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline } from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: { onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = { render: (args) => <Toggle aria-label="Bold" {...args}><Bold className="h-4 w-4" /></Toggle> };
export const Outline: Story = { render: (args) => <Toggle variant="outline" aria-label="Bold" {...args}><Bold className="h-4 w-4" /></Toggle> };
export const WithText: Story = { render: (args) => <Toggle aria-label="Toggle italic" {...args}><Italic className="mr-2 h-4 w-4" />Italic</Toggle> };

export const Toolbar: Story = {
  render: () => (
    <div className="flex gap-1">
      <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
      <Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
      <Toggle aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
    </div>
  ),
};

export const PressInteraction: Story = {
  name: "Interaction: Press to activate",
  render: (args) => <Toggle aria-label="Bold" {...args}><Bold className="h-4 w-4" /></Toggle>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button");
    await userEvent.click(toggle);
    await expect(args.onClick).toHaveBeenCalled();
    await expect(toggle).toHaveAttribute("data-state", "on");
  },
};
