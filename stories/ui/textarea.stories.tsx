import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Textarea> = { title: "UI/Textarea", component: Textarea, tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = { args: { placeholder: "Type your message here." } };
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type here..." id="message" />
    </div>
  ),
};
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };
