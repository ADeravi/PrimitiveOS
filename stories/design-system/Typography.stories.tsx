"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Design System/Typography",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const TYPE_SCALE = [
  { cls: "text-xs",   px: "12 / 16",  usage: "Captions, badges, helper text" },
  { cls: "text-sm",   px: "14 / 20",  usage: "Body (default component size), labels" },
  { cls: "text-base", px: "16 / 24",  usage: "Long-form body copy" },
  { cls: "text-lg",   px: "18 / 28",  usage: "Card titles, section headings" },
  { cls: "text-xl",   px: "20 / 28",  usage: "Dialog titles" },
  { cls: "text-2xl",  px: "24 / 32",  usage: "Page section headings" },
  { cls: "text-3xl",  px: "30 / 36",  usage: "Page titles" },
  { cls: "text-4xl",  px: "36 / 40",  usage: "Hero headings" },
  { cls: "text-5xl",  px: "48 / 48",  usage: "Display / marketing" },
];

const WEIGHTS = [
  { cls: "font-normal",   name: "Normal · 400",   usage: "Body copy" },
  { cls: "font-medium",   name: "Medium · 500",   usage: "Labels, buttons, titles" },
  { cls: "font-semibold", name: "Semibold · 600", usage: "Headings, emphasis" },
  { cls: "font-bold",     name: "Bold · 700",     usage: "Page titles, numerals" },
];

export const TypeScale: Story = {
  name: "Type Scale",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Typography</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          The system uses the Tailwind v4 type scale with{" "}
          <span className="font-medium text-foreground">Inter</span> for UI text and{" "}
          <span className="font-mono">JetBrains Mono</span> for code. Components default
          to <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">text-sm</code>.
        </p>
      </div>

      {/* Scale */}
      <section className="space-y-1">
        <h2 className="text-lg font-semibold mb-4">Scale</h2>
        <div className="divide-y divide-border border-y border-border">
          {TYPE_SCALE.map((t) => (
            <div key={t.cls} className="grid grid-cols-[7rem_6rem_1fr_minmax(12rem,auto)] items-baseline gap-6 py-4">
              <code className="font-mono text-xs text-muted-foreground">{t.cls}</code>
              <span className="font-mono text-xs text-muted-foreground/70">{t.px}</span>
              <span className={`${t.cls} text-foreground truncate`}>The quick brown fox</span>
              <span className="text-xs text-muted-foreground text-right">{t.usage}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Weights */}
      <section className="space-y-1">
        <h2 className="text-lg font-semibold mb-4">Weights</h2>
        <div className="divide-y divide-border border-y border-border">
          {WEIGHTS.map((w) => (
            <div key={w.cls} className="grid grid-cols-[10rem_1fr_minmax(12rem,auto)] items-baseline gap-6 py-4">
              <code className="font-mono text-xs text-muted-foreground">{w.cls}</code>
              <span className={`text-xl ${w.cls} text-foreground`}>{w.name}</span>
              <span className="text-xs text-muted-foreground text-right">{w.usage}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Families */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Families</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-6 space-y-2">
            <p className="text-xs font-mono text-muted-foreground">font-sans · Inter, system-ui</p>
            <p className="text-2xl text-foreground">ABCDEFGHIJKLM</p>
            <p className="text-2xl text-foreground">abcdefghijklm 0123456789</p>
            <p className="text-sm text-muted-foreground">All UI text, headings and body copy.</p>
          </div>
          <div className="rounded-xl border border-border p-6 space-y-2">
            <p className="text-xs font-mono text-muted-foreground">font-mono · JetBrains Mono</p>
            <p className="text-2xl font-mono text-foreground">ABCDEFGHIJKLM</p>
            <p className="text-2xl font-mono text-foreground">abcdefghijklm 0123456789</p>
            <p className="text-sm text-muted-foreground">Code, tokens, tabular data.</p>
          </div>
        </div>
      </section>
    </div>
  ),
};
