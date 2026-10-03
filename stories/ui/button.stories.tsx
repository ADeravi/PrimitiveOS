import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { userEvent, within, expect } from "storybook/test";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, ChevronRight, Trash2 } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Triggers an action. Use `default` for the primary action on a view (one per view), `outline`/`secondary` for supporting actions, `destructive` for irreversible ones, and `ghost`/`link` for low-emphasis actions.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
      description: "Visual emphasis of the action",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "icon"],
      description: "Control height and padding",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: { control: "boolean" },
    asChild: { control: false, description: "Render as the child element (e.g. a link)" },
  },
  args: { onClick: fn(), children: "Button", variant: "default", size: "default" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Mail /></Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Enabled</Button>
      <Button disabled>Disabled</Button>
      <Button disabled><Loader2 className="animate-spin" /> Loading</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button><Mail /> Login with Email</Button>
      <Button variant="outline">Continue <ChevronRight /></Button>
      <Button variant="destructive"><Trash2 /> Delete</Button>
    </div>
  ),
};

export const ClickInteraction: Story = {
  name: "Interaction: Click fires action",
  args: { children: "Click me" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
