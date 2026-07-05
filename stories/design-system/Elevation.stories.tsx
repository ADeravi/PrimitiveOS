"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Primitives/Elevation",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const LEVELS = [
  { token: "--shadow-2xs", name: "2XS", usage: "Subtle lift on inputs and rows" },
  { token: "--shadow-xs",  name: "XS",  usage: "Buttons, segmented controls" },
  { token: "--shadow-sm",  name: "SM",  usage: "Cards at rest" },
  { token: "--shadow-md",  name: "MD",  usage: "Dropdowns, popovers, hovered cards" },
  { token: "--shadow-lg",  name: "LG",  usage: "Dialogs, sheets, command palette" },
  { token: "--shadow-xl",  name: "XL",  usage: "Spotlight surfaces, onboarding" },
];

export const Shadows: Story = {
  name: "Elevation Scale",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-10">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Elevation</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Six shadow tokens express depth. Higher elevation = closer to the user =
          stronger shadow. Each level maps to a class of surface — don&apos;t mix levels
          within the same surface class.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        {LEVELS.map((l) => (
          <div key={l.token} className="space-y-3">
            <div
              className="h-28 rounded-xl bg-card border border-border/50"
              style={{ boxShadow: `var(${l.token})` }}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">{l.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{l.token}</p>
              <p className="text-xs text-muted-foreground mt-1">{l.usage}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Usage</h2>
        <pre className="rounded-xl bg-muted p-4 text-xs font-mono text-foreground overflow-x-auto">{`<div style={{ boxShadow: "var(--shadow-md)" }} />
// or with Tailwind arbitrary values
<div className="shadow-[var(--shadow-md)]" />`}</pre>
      </section>
    </div>
  ),
};
