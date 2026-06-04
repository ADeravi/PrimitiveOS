import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "@storybook/test";
import { userEvent, within, expect } from "@storybook/test";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const meta: Meta = { title: "UI/RadioGroup", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable" onValueChange={fn()}>
      <div className="flex items-center space-x-2"><RadioGroupItem value="default" id="r1" /><Label htmlFor="r1">Default</Label></div>
      <div className="flex items-center space-x-2"><RadioGroupItem value="comfortable" id="r2" /><Label htmlFor="r2">Comfortable</Label></div>
      <div className="flex items-center space-x-2"><RadioGroupItem value="compact" id="r3" /><Label htmlFor="r3">Compact</Label></div>
    </RadioGroup>
  ),
};

export const SelectInteraction: Story = {
  name: "Interaction: Select Compact",
  render: () => (
    <RadioGroup defaultValue="default" onValueChange={fn()}>
      <div className="flex items-center space-x-2"><RadioGroupItem value="default" id="r1" /><Label htmlFor="r1">Default</Label></div>
      <div className="flex items-center space-x-2"><RadioGroupItem value="comfortable" id="r2" /><Label htmlFor="r2">Comfortable</Label></div>
      <div className="flex items-center space-x-2"><RadioGroupItem value="compact" id="r3" /><Label htmlFor="r3">Compact</Label></div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const compact = canvas.getByRole("radio", { name: /compact/i });
    await userEvent.click(compact);
    await expect(compact).toBeChecked();
  },
};
