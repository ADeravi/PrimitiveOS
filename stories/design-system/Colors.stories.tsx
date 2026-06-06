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
// Tier 1 — Primitive scales
// Raw colour ladders. Mode-independent; read straight from CSS variables.
// ---------------------------------------------------------------------------
const PRIMITIVE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const PRIMITIVE_HUES = [
  { name: "Neutral", token: "neutral" },
  { name: "Blue", token: "blue" },
  { name: "Green", token: "green" },
  { name: "Red", token: "red" },
  { name: "Amber", token: "amber" },
];

// ---------------------------------------------------------------------------
// Tier 2 + Tier 3 — Semantic + functional token definitions
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
    ],
  },
  {
    title: "Functional",
    description: "Status colours for success, warning, info and destructive states. These also shift per design layer.",
    tokens: [
      { name: "Success",              bg: "--success",              fg: "--success-foreground" },
      { name: "Success Foreground",   bg: "--success-foreground",   fg: "--success" },
      { name: "Warning",              bg: "--warning",              fg: "--warning-foreground" },
      { name: "Warning Foreground",   bg: "--warning-foreground",   fg: "--warning" },
      { name: "Info",                 bg: "--info",                 fg: "--info-foreground" },
      { name: "Info Foreground",      bg: "--info-foreground",      fg: "--info" },
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

function copyVar(variable: string, done: () => void) {
  navigator.clipboard.writeText(`var(${variable})`).then(done);
}

// ---------------------------------------------------------------------------
// Swatch component
// ---------------------------------------------------------------------------
function Swatch({ name, bg, fg }: { name: string; bg: string; fg: string }) {
  const rawValue = useCSSVar(bg);
  const [copied, setCopied] = React.useState(false);

  const copy = () => copyVar(bg, () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });

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
// Primitive ladder components
// ---------------------------------------------------------------------------
function PrimitiveCell({ token, step }: { token: string; step: number }) {
  const varName = `--${token}-${step}`;
  const rawValue = useCSSVar(varName);
  const [copied, setCopied] = React.useState(false);
  // Light text on the darker half of the ladder.
  const dark = step >= 500;

  return (
    <button
      onClick={() => copyVar(varName, () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })}
      title={`Copy var(${varName})`}
      className="group relative flex-1 h-16 first:rounded-l-lg last:rounded-r-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10"
      style={{ background: `var(${varName})` }}
    >
      <span
        className={`absolute inset-x-0 bottom-1 text-center text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${dark ? "text-white" : "text-black"}`}
      >
        {copied ? "Copied!" : step}
      </span>
      {/* Persistent step label */}
      <span
        className={`absolute inset-x-0 top-1 text-center text-[9px] font-semibold ${dark ? "text-white/80" : "text-black/70"}`}
      >
        {step}
      </span>
    </button>
  );
}

function PrimitiveLadder({ name, token }: { name: string; token: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-[10px] font-mono text-muted-foreground">--{token}-50 → --{token}-950</p>
      </div>
      <div className="flex gap-0.5">
        {PRIMITIVE_STEPS.map((step) => (
          <PrimitiveCell key={step} token={token} step={step} />
        ))}
      </div>
    </div>
  );
}

function PrimitiveScalesSection() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Primitive Scale</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tier 1 — raw colour ladders (50 → 950) with no semantic meaning. These are the absolute
          palette the semantic and functional tokens reference. Click any step to copy its CSS variable.
        </p>
      </div>
      <div className="space-y-5">
        {PRIMITIVE_HUES.map((h) => (
          <PrimitiveLadder key={h.token} name={h.name} token={h.token} />
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
          A three-tier token architecture: primitive ladders (Tier 1), semantic brand and surface
          tokens (Tier 2), and functional status colours (Tier 3). Switch the{" "}
          <span className="font-medium text-foreground">Design Layer</span> in the toolbar
          to see Material Design 3, Fluent, Carbon, Apple HIG or Expressive palettes.
          Click any swatch to copy its CSS variable.
        </p>
      </div>

      {/* Tier 1 */}
      <PrimitiveScalesSection />

      {/* Tier 2 + Tier 3 token groups */}
      {GROUPS.map((g) => (
        <ColorGroup key={g.title} title={g.title} description={g.description} tokens={g.tokens} />
      ))}
    </div>
  ),
};

export const PrimitiveScales: Story = {
  name: "Primitive Scale",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Primitive Scale</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Tier 1 of the token system — the raw 11-step colour ladders that everything else is built
          from. These values are mode-independent and do not change with the Design Layer.
        </p>
      </div>
      <PrimitiveScalesSection />
    </div>
  ),
};

export const FunctionalColors: Story = {
  name: "Functional Colors",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Functional Colors</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Tier 3 — status colours that communicate meaning: success, warning, info and destructive.
          Each pairs with a foreground token for accessible text and shifts per design layer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Success",     bg: "--success",     fg: "--success-foreground",     label: "Confirmations, completed states" },
          { name: "Warning",     bg: "--warning",     fg: "--warning-foreground",     label: "Caution, needs attention" },
          { name: "Info",        bg: "--info",        fg: "--info-foreground",        label: "Neutral notices, tips" },
          { name: "Destructive", bg: "--destructive", fg: "--primary-foreground",     label: "Errors, danger, delete actions" },
        ].map(({ name, bg, fg, label }) => (
          <div key={bg} className="rounded-2xl overflow-hidden border border-border">
            <div className="h-28 flex items-center justify-center" style={{ background: `var(${bg})` }}>
              <span className="text-sm font-semibold" style={{ color: `var(${fg})` }}>{name}</span>
            </div>
            <div className="p-4 bg-card">
              <p className="font-semibold text-card-foreground">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs font-mono text-muted-foreground mt-2">{bg}</p>
            </div>
          </div>
        ))}
      </div>
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
