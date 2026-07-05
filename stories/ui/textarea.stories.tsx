import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { userEvent, within, expect } from "storybook/test";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Textarea> = {
  title: "Components/Data entry/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { onChange: fn() },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = { args: { placeholder: "Type your message here." } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type here..." id="message" {...args} />
    </div>
  ),
};

export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };

export const TypeInteraction: Story = {
  name: "Interaction: Type a message",
  args: { placeholder: "Type here..." },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.click(textarea);
    await userEvent.type(textarea, "Hello, Storybook!");
    await expect(textarea).toHaveValue("Hello, Storybook!");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
