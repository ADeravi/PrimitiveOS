import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "@storybook/test";
import { userEvent, within, expect } from "@storybook/test";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { onCheckedChange: fn() },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane" {...args} />
      <Label htmlFor="airplane">Airplane Mode</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="on" defaultChecked {...args} />
      <Label htmlFor="on">Enabled</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled" disabled />
      <Label htmlFor="disabled" className="opacity-50">Disabled</Label>
    </div>
  ),
};

export const ToggleInteraction: Story = {
  name: "Interaction: Toggle on then off",
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="interact" {...args} />
      <Label htmlFor="interact">Toggle me</Label>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await userEvent.click(sw);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.click(sw);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};
