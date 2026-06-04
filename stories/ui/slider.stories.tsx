import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Slider } from "@/components/ui/slider";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  args: { onValueChange: fn() },
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = { args: { defaultValue: [33], max: 100, step: 1, className: "w-80" } };
export const Range: Story = { args: { defaultValue: [25, 75], max: 100, step: 1, className: "w-80" } };
export const Disabled: Story = { args: { defaultValue: [50], max: 100, disabled: true, className: "w-80" } };
