import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline } from "lucide-react";

const meta: Meta<typeof Toggle> = { title: "UI/Toggle", component: Toggle, tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = { render: () => <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle> };
export const Outline: Story = { render: () => <Toggle variant="outline" aria-label="Bold"><Bold className="h-4 w-4" /></Toggle> };
export const WithText: Story = { render: () => <Toggle aria-label="Toggle italic"><Italic className="mr-2 h-4 w-4" />Italic</Toggle> };
export const Toolbar: Story = {
  render: () => (
    <div className="flex gap-1">
      <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
      <Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
      <Toggle aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
    </div>
  ),
};
