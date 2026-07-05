"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Inbox } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { MultiSelect } from "@/components/ui/multi-select";
import { TagInput } from "@/components/ui/tag-input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Rating } from "@/components/ui/rating";
import { PasswordInput } from "@/components/ui/password-input";
import { Dropzone } from "@/components/ui/dropzone";
import { Label } from "@/components/ui/label";

const meta: Meta = {
  title: "Nests/Data entry/Composite Inputs",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive composite inputs built from the core primitives: combobox, multi-select, tag input, date-range picker, rating, password with strength meter and a file dropzone. All controlled/uncontrolled and token-themed.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
  { value: "mango", label: "Mango" },
  { value: "peach", label: "Peach", disabled: true },
];

export const ComboboxStory: Story = {
  name: "Combobox",
  render: () => (
    <div className="grid w-56 gap-2">
      <Label>Favourite fruit</Label>
      <Combobox options={FRUITS} placeholder="Select a fruit…" />
    </div>
  ),
};

export const MultiSelectStory: Story = {
  name: "Multi-select",
  render: () => (
    <div className="grid w-72 gap-2">
      <Label>Toppings</Label>
      <MultiSelect options={FRUITS} defaultValue={["apple", "cherry"]} placeholder="Pick toppings…" />
    </div>
  ),
};

export const TagInputStory: Story = {
  name: "Tag Input",
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="tags">Keywords</Label>
      <TagInput defaultValue={["design", "tokens"]} placeholder="Add keyword…" />
      <p className="text-xs text-muted-foreground">Enter or comma adds; Backspace removes the last.</p>
    </div>
  ),
};

export const DateRangeStory: Story = {
  name: "Date Range Picker",
  render: () => (
    <div className="grid w-72 gap-2">
      <Label>Reporting period</Label>
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 14) }}
      />
    </div>
  ),
};

export const RatingStory: Story = {
  name: "Rating",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label>Interactive</Label>
        <Rating defaultValue={3} />
      </div>
      <div className="grid gap-1.5">
        <Label>Read only</Label>
        <Rating value={4} readOnly />
      </div>
    </div>
  ),
};

export const PasswordStory: Story = {
  name: "Password Input",
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="pw">Password</Label>
      <PasswordInput id="pw" showStrength placeholder="Choose a password" />
    </div>
  ),
};

export const DropzoneStory: Story = {
  name: "Dropzone",
  render: () => (
    <div className="w-96">
      <Dropzone accept=".png,.svg,.pdf" />
    </div>
  ),
};

export const EmptyDropzoneHint: Story = {
  name: "Dropzone in Empty State context",
  render: () => (
    <div className="w-96 text-center">
      <Inbox className="mx-auto mb-2 size-5 text-muted-foreground" />
      <Dropzone multiple={false} />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------
export const TagInputInteraction: Story = {
  name: "Interaction: tags add & remove",
  render: function TagDemo() {
    const [tags, setTags] = React.useState<string[]>([]);
    return (
      <div className="grid w-72 gap-2">
        <TagInput value={tags} onValueChange={setTags} placeholder="Type and press Enter" />
        <output data-testid="count" className="text-xs text-muted-foreground">{tags.length} tags</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type and press Enter");
    await userEvent.type(input, "alpha{enter}");
    await userEvent.type(input, "beta{enter}");
    await expect(canvas.getByTestId("count")).toHaveTextContent("2 tags");
    await userEvent.click(canvas.getByLabelText("Remove alpha"));
    await expect(canvas.getByTestId("count")).toHaveTextContent("1 tags");
  },
};

export const RatingInteraction: Story = {
  name: "Interaction: rating selects",
  args: { onValueChange: fn() },
  render: (args) => <Rating onValueChange={args.onValueChange as (v: number) => void} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "4 of 5" }));
    await expect(args.onValueChange).toHaveBeenCalledWith(4);
    await expect(canvas.getByRole("radio", { name: "4 of 5" })).toHaveAttribute("aria-checked", "true");
  },
};

export const PasswordInteraction: Story = {
  name: "Interaction: strength meter responds",
  render: () => <PasswordInput showStrength placeholder="Type a password" className="w-72" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type a password");
    await userEvent.type(input, "Str0ng!Passw0rd");
    await expect(canvas.getByText("Strong")).toBeInTheDocument();
    await userEvent.click(canvas.getByLabelText("Show password"));
    await expect(input).toHaveAttribute("type", "text");
  },
};
