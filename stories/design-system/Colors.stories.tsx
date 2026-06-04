"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Design System/Color Palette",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Token definitions
// ---------------------------------------------------------------------------
const GROUPS = [
  {
    title: "Brand",
    description: "Core action colours — primary, secondary and accent update with the Design Layer toolbar.",
    tokens: [
      { name: "Primary",              bg: "--primary",              fg: "--primary-foreground" },
      { name: "Primary Foreground",   bg: "--primary-foreground",   fg: "--primary" },
      { name: "Secondary",            bg: "--secondary",            fg: "--secondary-foreground" },
      { name: "Secondary Foreground", bg: "--secondary-foreground", fg: "--secondary" },
      { name: "Accent",               bg: "--accent",               fg: "--accent-foreground" },
      { name: "Accent Foreground",    bg: "--accent-foreground",    fg: "--accent" },
      { name: "Destructive",          bg: "--destructive",          fg: "--background" },
    ],
  },
  {
    title: "Surface",
    description: "Background, card and popover layers that form the depth stack.",
    tokens: [
      { name: "Background",           bg: "--background",           fg: "--foreground" },
      { name: "Foreground",           bg: "--foreground",           fg: "--background" },
      { name: "Card",                 bg: "--card",                 fg: "--card-foreground" },
      { name: "Card Foreground",      bg: "--card-foreground",      fg: "--card" },
      { name: "Popover",              bg: "--popover",              fg: "--popover-foreground" },
      { name: "Popover Foreground",   bg: "--popover-foreground",   fg: "--popover" },
      { name: "Muted",                bg: "--muted",                fg: "--muted-foreground" },
      { name: "Muted Foreground",     bg: "--muted-foreground",     fg: "--muted" },
    ],
  },
  {
    title: "Border & Input",
    description: "Stroke colours used on dividers, input fields and focus rings.",
    tokens: [
      { name: "Border",               bg: "--border",               fg: "--foreground" },
      { name: "Input",                bg: "--input",                fg: "--foreground" },
      { name: "Ring",                 bg: "--ring",                 fg: "--background" },
    ],
  },
  {
    title: "Chart",
    description: "Five-step data visualisation palette.",
    tokens: [
      { name: "Chart 1", bg: "--chart-1", fg: "--background" },
      { name: "Chart 2", bg: "--chart-2", fg: "--background" },
      { name: "Chart 3", bg: "--chart-3", fg: "--background" },
      { name: "Chart 4", bg: "--chart-4", fg: "--foreground" },
      { name: "Chart 5", bg: "--chart-5", fg: "--background" },
    ],
  },
  {
    title: "Sidebar",
    description: "Tokens specific to the Sidebar component.",
    tokens: [
      { name: "Sidebar",                   bg: "--sidebar",                   fg: "--sidebar-foreground" },
      { name: "Sidebar Foreground",        bg: "--sidebar-foreground",        fg: "--sidebar" },
      { name: "Sidebar Primary",           bg: "--sidebar-primary",           fg: "--sidebar-primary-foreground" },
      { name: "Sidebar Primary Foreground",bg: "--sidebar-primary-foreground",fg: "--sidebar-primary" },
      { name: "Sidebar Accent",            bg: "--sidebar-accent",            fg: "--sidebar-accent-foreground" },
      { name: "Sidebar Border",            bg: "--sidebar-border",            fg: "--sidebar-foreground" },
      { name: "Sidebar Ring",              bg: "--sidebar-ring",              fg: "--sidebar" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers: read computed CSS variable values at runtime
// ---------------------------------------------------------------------------
function useCSSVar(variable: string): string {
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue(variable).trim();
    setValue(raw || variable);
  }, [variable]);
  return value;
}

// ---------------------------------------------------------------------------
// Swatch component
// ---------------------------------------------------------------------------
function Swatch({ name, bg, fg }: { name: string; bg: string; fg: string }) {
  const rawValue = useCSSVar(bg);
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`var(${bg})`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={copy}
      title={`Copy var(${bg})`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border text-left w-full cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Colour block */}
      <div
        className="h-20 w-full flex items-end p-2"
        style={{ background: `var(${bg})` }}
      >
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `var(${fg})`, color: `var(${bg})` }}
        >
          {copied ? "Copied!" : "Copy"}
        </span>
      </div>

      {/* Label */}
      <div className="bg-card px-3 py-2 space-y-0.5">
        <p className="text-xs font-semibold text-card-foreground truncate">{name}</p>
        <p className="text-[10px] font-mono text-muted-foreground truncate">{bg}</p>
        <p className="text-[10px] font-mono text-muted-foreground/70 truncate">{rawValue || "…"}</p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Group component
// ---------------------------------------------------------------------------
function ColorGroup({
  title,
  description,
  tokens,
}: {
  title: string;
  description: string;
  tokens: Array<{ name: string; bg: string; fg: string }>;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {tokens.map((t) => (
          <Swatch key={t.bg} name={t.name} bg={t.bg} fg={t.fg} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------
export const AllTokens: Story = {
  name: "All Tokens",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Color Palette</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Live token swatches for the active design layer. Switch the{" "}
          <span className="font-medium text-foreground">Design Layer</span> in the toolbar
          to see Material Design 3, Fluent, Carbon, Apple HIG or Expressive palettes.
          Click any swatch to copy its CSS variable.
        </p>
      </div>

      {/* Token groups */}
      {GROUPS.map((g) => (
        <ColorGroup key={g.title} title={g.title} description={g.description} tokens={g.tokens} />
      ))}
    </div>
  ),
};

export const BrandOnly: Story = {
  name: "Brand Colors",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Brand Colors</h1>
        <p className="mt-2 text-muted-foreground">
          Primary, secondary and accent — the three brand roles that define the design layer’s identity.
        </p>
      </div>
      {/* Large feature swatches */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { name: "Primary",    bg: "--primary",   fg: "--primary-foreground",   label: "Main actions, default buttons" },
          { name: "Secondary",  bg: "--secondary", fg: "--secondary-foreground", label: "Supporting actions, chips" },
          { name: "Accent",     bg: "--accent",    fg: "--accent-foreground",    label: "Hover states, highlights, badges" },
        ].map(({ name, bg, fg, label }) => (
          <div key={bg} className="rounded-2xl overflow-hidden border border-border">
            <div className="h-40" style={{ background: `var(${bg})` }} />
            <div className="p-4 bg-card">
              <p className="font-semibold text-card-foreground">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs font-mono text-muted-foreground mt-2">{bg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Destructive */}
      <div className="rounded-2xl overflow-hidden border border-border max-w-sm">
        <div className="h-24" style={{ background: "var(--destructive)" }} />
        <div className="p-4 bg-card">
          <p className="font-semibold text-card-foreground">Destructive</p>
          <p className="text-xs text-muted-foreground mt-0.5">Errors, danger states, delete actions</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">--destructive</p>
        </div>
      </div>
    </div>
  ),
};

export const ChartPalette: Story = {
  name: "Chart Palette",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Chart Palette</h1>
        <p className="mt-2 text-muted-foreground">
          Five-step data visualisation sequence. Used by the Chart component to colour series.
        </p>
      </div>

      {/* Horizontal scale */}
      <div className="flex rounded-2xl overflow-hidden border border-border h-24">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex-1" style={{ background: `var(--chart-${n})` }} />
        ))}
      </div>

      {/* Individual swatches */}
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="rounded-xl overflow-hidden border border-border">
            <div className="h-16" style={{ background: `var(--chart-${n})` }} />
            <div className="p-2 bg-card">
              <p className="text-xs font-semibold text-card-foreground">Chart {n}</p>
              <p className="text-[10px] font-mono text-muted-foreground">--chart-{n}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
