"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Design System/Radius",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const RADII = [
  { token: "--radius-sm", name: "SM", calc: "radius − 4px", usage: "Checkboxes, small chips" },
  { token: "--radius-md", name: "MD", calc: "radius − 2px", usage: "Inputs, menu items" },
  { token: "--radius-lg", name: "LG", calc: "radius", usage: "Buttons, cards, popovers" },
  { token: "--radius-xl", name: "XL", calc: "radius + 4px", usage: "Dialogs, large cards" },
];

export const Scale: Story = {
  name: "Radius Scale",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-10">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Radius</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          All corner rounding derives from a single <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--radius</code> token
          (default 0.625rem). Each design layer sets its own base — Carbon is square,
          Material is 0.75rem — and every component follows automatically. Try the{" "}
          <span className="font-medium text-foreground">Radius</span> toolbar override.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {RADII.map((r) => (
          <div key={r.token} className="space-y-3">
            <div
              className="h-28 bg-primary/10 border-2 border-primary"
              style={{ borderRadius: `var(${r.token})` }}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">{r.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{r.token} · {r.calc}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.usage}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Special cases</h2>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-full bg-primary/10 border-2 border-primary" />
            <p className="font-mono text-[11px] text-muted-foreground">rounded-full</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-32 rounded-full bg-primary/10 border-2 border-primary" />
            <p className="font-mono text-[11px] text-muted-foreground">pill (badges)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-none bg-primary/10 border-2 border-primary" />
            <p className="font-mono text-[11px] text-muted-foreground">rounded-none</p>
          </div>
        </div>
      </section>
    </div>
  ),
};
