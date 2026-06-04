import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within, expect, waitFor } from "storybook/test";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const meta: Meta = {
  title: "UI/Select",
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Select onValueChange={fn()}>
      <SelectTrigger className="w-48"><SelectValue placeholder="Select a fruit" /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const OpenInteraction: Story = {
  name: "Interaction: Open dropdown",
  render: () => (
    <Select>
      <SelectTrigger className="w-48"><SelectValue placeholder="Select a fruit" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    // waitFor retries until the Radix portal dropdown animation completes
    await waitFor(() =>
      expect(within(document.body).getByRole("option", { name: "Apple" })).toBeVisible()
    );
  },
};
