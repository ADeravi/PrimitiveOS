"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "@storybook/test";
import { userEvent, within, expect } from "@storybook/test";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const meta: Meta = { title: "UI/Form", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

const schema = z.object({ username: z.string().min(2, { message: "Username must be at least 2 characters." }) });

function FormDemo({ onSubmit = fn() }: { onSubmit?: () => void }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-80">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input placeholder="shadcn" {...field} /></FormControl>
            <FormDescription>This is your public display name.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export const Default: Story = { render: () => <FormDemo /> };

export const FillAndSubmit: Story = {
  name: "Interaction: Fill and submit",
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("shadcn");
    await userEvent.click(input);
    await userEvent.type(input, "johndoe");
    await expect(input).toHaveValue("johndoe");
    await userEvent.click(canvas.getByRole("button", { name: /submit/i }));
  },
};

export const ValidationError: Story = {
  name: "Interaction: Trigger validation error",
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /submit/i }));
    await expect(canvas.getByText(/at least 2 characters/i)).toBeVisible();
  },
};
