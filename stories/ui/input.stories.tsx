import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Input> = {
  title: "Components/Data entry/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A text field. Always pair with a `Label`; use `aria-invalid` for error state and helper text below the field for guidance.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "file"],
      table: { defaultValue: { summary: "text" } },
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: { type: "text", placeholder: "Type here…" },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = { render: (args) => <Input className="w-72" {...args} /> };

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
      <p className="text-xs text-muted-foreground">We&apos;ll never share your email.</p>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-72 gap-4">
      <div className="grid gap-2">
        <Label>Default</Label>
        <Input placeholder="Placeholder" />
      </div>
      <div className="grid gap-2">
        <Label>Filled</Label>
        <Input defaultValue="Hello world" />
      </div>
      <div className="grid gap-2">
        <Label>Disabled</Label>
        <Input disabled placeholder="Disabled" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="err">Error</Label>
        <Input id="err" aria-invalid defaultValue="not-an-email" />
        <p className="text-xs text-destructive">Enter a valid email address.</p>
      </div>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="flex w-80 items-center gap-2">
      <Input type="email" placeholder="you@example.com" />
      <Button type="submit">Subscribe</Button>
    </div>
  ),
};

export const File: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  ),
};

export const TypingInteraction: Story = {
  name: "Interaction: typing updates value",
  render: () => <Input placeholder="Type here" className="w-72" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type here");
    await userEvent.type(input, "hello tokens");
    await expect(input).toHaveValue("hello tokens");
  },
};
