"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Primitives/Spacing",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const STEPS = [
  { token: "0.5", rem: "0.125rem", px: 2 },
  { token: "1",   rem: "0.25rem",  px: 4 },
  { token: "1.5", rem: "0.375rem", px: 6 },
  { token: "2",   rem: "0.5rem",   px: 8 },
  { token: "3",   rem: "0.75rem",  px: 12 },
  { token: "4",   rem: "1rem",     px: 16 },
  { token: "6",   rem: "1.5rem",   px: 24 },
  { token: "8",   rem: "2rem",     px: 32 },
  { token: "10",  rem: "2.5rem",   px: 40 },
  { token: "12",  rem: "3rem",     px: 48 },
  { token: "16",  rem: "4rem",     px: 64 },
  { token: "20",  rem: "5rem",     px: 80 },
  { token: "24",  rem: "6rem",     px: 96 },
];

export const Scale: Story = {
  name: "Spacing Scale",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-10">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Spacing</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          A 4px base grid via the Tailwind v4 spacing scale (<code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--spacing: 0.25rem</code>).
          Use steps from this ladder for all padding, gaps and margins — avoid arbitrary values.
        </p>
      </div>

      <section>
        <div className="divide-y divide-border border-y border-border">
          {STEPS.map((s) => (
            <div key={s.token} className="grid grid-cols-[4rem_6rem_5rem_1fr] items-center gap-6 py-3">
              <code className="font-mono text-xs text-muted-foreground">{s.token}</code>
              <span className="font-mono text-xs text-muted-foreground/70">{s.rem}</span>
              <span className="font-mono text-xs text-muted-foreground/70">{s.px}px</span>
              <div className="h-4 rounded-sm bg-primary" style={{ width: `${s.px}px` }} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Conventions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Tight", step: "gap-2 · 8px", desc: "Icon + label, badge clusters, inline meta" },
            { name: "Default", step: "gap-4 · 16px", desc: "Form fields, card content, list items" },
            { name: "Section", step: "gap-8 · 32px", desc: "Between page sections and card groups" },
          ].map((c) => (
            <div key={c.name} className="rounded-xl border border-border p-5 space-y-1">
              <p className="font-semibold text-foreground">{c.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{c.step}</p>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
