import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { userEvent, within, expect } from "storybook/test";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: { onChange: fn() },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Email" } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="you@example.com" {...args} />
    </div>
  ),
};

export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };

export const File: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  ),
};

export const TypeInteraction: Story = {
  name: "Interaction: Type text",
  args: { placeholder: "Type here..." },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.type(input, "hello@example.com");
    await expect(input).toHaveValue("hello@example.com");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
