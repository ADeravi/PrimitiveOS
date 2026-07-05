"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

const meta: Meta = { title: "Nests/Data entry/Calendar", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />;
}

export const Default: Story = { render: () => <CalendarDemo /> };

function CalendarRange() {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  return <Calendar mode="range" selected={range as any} onSelect={setRange as any} numberOfMonths={2} className="rounded-md border" />;
}
export const Range: Story = { render: () => <CalendarRange />, parameters: { layout: "padded" } };
