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
// Radix Color System — 29 scales × 12 steps
// ---------------------------------------------------------------------------
const RADIX_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
type RadixStep = (typeof RADIX_STEPS)[number];

const STEP_SEMANTICS: Record<RadixStep, { label: string; description: string }> = {
  1:  { label: "App bg",       description: "App / page background" },
  2:  { label: "Subtle bg",    description: "Subtle or alternate background" },
  3:  { label: "UI bg",        description: "Component background at rest" },
  4:  { label: "Hovered UI",   description: "Component background, hovered" },
  5:  { label: "Active UI",    description: "Component background, pressed or selected" },
  6:  { label: "Borders",      description: "Subtle borders and separators" },
  7:  { label: "Borders+",     description: "Interactive element borders" },
  8:  { label: "Links",        description: "Hovered borders and links" },
  9:  { label: "Solid ★",      description: "Solid backgrounds — the main vivid accent" },
  10: { label: "Solid hover",  description: "Solid backgrounds, hovered" },
  11: { label: "Lo-contrast",  description: "Low-contrast text and icons" },
  12: { label: "Hi-contrast",  description: "High-contrast text and headings" },
};

const RADIX_GROUPS: { name: string; scales: string[] }[] = [
  { name: "Gray Families",    scales: ["gray", "mauve", "slate", "sage", "olive", "sand"] },
  { name: "Red Family",       scales: ["tomato", "red", "ruby", "crimson"] },
  { name: "Pink → Purple",    scales: ["pink", "plum", "purple"] },
  { name: "Violet → Indigo",  scales: ["violet", "iris", "indigo"] },
  { name: "Blue → Teal",      scales: ["blue", "cyan", "sky", "teal"] },
  { name: "Green",            scales: ["mint", "jade", "green", "grass", "lime"] },
  { name: "Yellow → Brown",   scales: ["yellow", "amber", "orange", "brown"] },
];

// ---------------------------------------------------------------------------
// Semantic token groups (Tier 2 + Tier 3)
// ---------------------------------------------------------------------------
const GROUPS = [
  {
    title: "Brand",
    description: "Core action colours — update with the Design Layer toolbar. Default: Radix Violet.",
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
    description: "Status colours mapped to Radix step-9 (solid accent) — green, amber, blue, red.",
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
    description: "Background, card and popover layers mapped to Radix Slate steps 1–3.",
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
    description: "Stroke colours mapped to Radix Slate steps 6–7.",
    tokens: [
      { name: "Border", bg: "--border", fg: "--foreground" },
      { name: "Input",  bg: "--input",  fg: "--foreground" },
      { name: "Ring",   bg: "--ring",   fg: "--background" },
    ],
  },
  {
    title: "Chart",
    description: "Five vivid step-9 colours across distinct hue families. Auto-shifts in dark mode.",
    tokens: [
      { name: "Chart 1 (violet)", bg: "--chart-1", fg: "--background" },
      { name: "Chart 2 (cyan)",   bg: "--chart-2", fg: "--background" },
      { name: "Chart 3 (amber)",  bg: "--chart-3", fg: "--background" },
      { name: "Chart 4 (green)",  bg: "--chart-4", fg: "--background" },
      { name: "Chart 5 (red)",    bg: "--chart-5", fg: "--background" },
    ],
  },
  {
    title: "Sidebar",
    description: "Tokens specific to the Sidebar component.",
    tokens: [
      { name: "Sidebar",                    bg: "--sidebar",                    fg: "--sidebar-foreground" },
      { name: "Sidebar Foreground",         bg: "--sidebar-foreground",         fg: "--sidebar" },
      { name: "Sidebar Primary",            bg: "--sidebar-primary",            fg: "--sidebar-primary-foreground" },
      { name: "Sidebar Primary Foreground", bg: "--sidebar-primary-foreground", fg: "--sidebar-primary" },
      { name: "Sidebar Accent",             bg: "--sidebar-accent",             fg: "--sidebar-accent-foreground" },
      { name: "Sidebar Border",             bg: "--sidebar-border",             fg: "--sidebar-foreground" },
      { name: "Sidebar Ring",               bg: "--sidebar-ring",               fg: "--sidebar" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function useCSSVar(variable: string): string {
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    setValue(raw || variable);
  }, [variable]);
  return value;
}

function copyText(text: string, done: () => void) {
  navigator.clipboard.writeText(text).then(done);
}

// ---------------------------------------------------------------------------
// Radix step swatch
// ---------------------------------------------------------------------------
function RadixStep({
  scale,
  step,
}: {
  scale: string;
  step: RadixStep;
}) {
  const varName = `--${scale}-${step}`;
  const [copied, setCopied] = React.useState(false);
  const isSolid = step === 9;
  const isLight = step <= 6;

  return (
    <button
      onClick={() =>
        copyText(`var(${varName})`, () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        })
      }
      title={`${STEP_SEMANTICS[step].description}\nvar(${varName})`}
      className={`group relative flex-1 flex flex-col items-center justify-between py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10 first:rounded-l-lg last:rounded-r-lg transition-opacity hover:opacity-90 ${
        isSolid ? "outline outline-2 outline-offset-[-2px] outline-white/25 z-10" : ""
      }`}
      style={{ background: `var(${varName})`, minHeight: "52px" }}
    >
      {isSolid && (
        <span className={`text-[8px] font-bold ${isLight ? "text-black/40" : "text-white/60"}`}>★</span>
      )}
      {!isSolid && <span />}
      <span className={`text-[9px] font-mono ${isLight ? "text-black/40" : "text-white/50"}`}>
        {copied ? "✓" : step}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Scale row
// ---------------------------------------------------------------------------
function RadixScaleRow({ scale }: { scale: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 shrink-0">
        <p className="text-[11px] font-semibold text-foreground capitalize leading-tight">{scale}</p>
      </div>
      <div className="flex flex-1 rounded-lg overflow-hidden border border-border/40 shadow-xs">
        {RADIX_STEPS.map((step) => (
          <RadixStep key={step} scale={scale} step={step} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full Radix palette
// ---------------------------------------------------------------------------
function RadixPaletteSection() {
  return (
    <div className="space-y-10">
      {/* Step semantics legend */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Step Semantics (applies to every scale)</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
          {RADIX_STEPS.map((step) => (
            <div key={step} className="flex items-baseline gap-2">
              <span className={`text-xs font-mono font-bold tabular-nums w-5 ${
                step === 9 ? "text-primary" : "text-muted-foreground"
              }`}>
                {step}
              </span>
              <span className="text-xs text-foreground">{STEP_SEMANTICS[step].label}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Toggle dark mode in the toolbar — all 29 scales remap automatically.
          Click any step to copy its CSS variable. ★ = step 9, the vivid solid accent.
        </p>
      </div>

      {/* Scale groups */}
      {RADIX_GROUPS.map((group) => (
        <section key={group.name} className="space-y-2.5">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1.5">
            {group.name}
          </h3>
          <div className="space-y-1.5">
            {group.scales.map((scale) => (
              <RadixScaleRow key={scale} scale={scale} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Semantic swatch
// ---------------------------------------------------------------------------
function Swatch({ name, bg, fg }: { name: string; bg: string; fg: string }) {
  const rawValue = useCSSVar(bg);
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      onClick={() =>
        copyText(`var(${bg})`, () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      title={`Copy var(${bg})`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border text-left w-full cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
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
      <div className="bg-card px-3 py-2 space-y-0.5">
        <p className="text-xs font-semibold text-card-foreground truncate">{name}</p>
        <p className="text-[10px] font-mono text-muted-foreground truncate">{bg}</p>
        <p className="text-[10px] font-mono text-muted-foreground/70 truncate">{rawValue || "…"}</p>
      </div>
    </button>
  );
}

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
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Color Palette</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Semantic tokens (Tier 2/3) built on{" "}
          <span className="font-medium text-foreground">Radix Colors</span> — 29 scales, 12 steps, automatic
          dark mode. Switch the{" "}
          <span className="font-medium text-foreground">Design Layer</span> toolbar to see Material, Fluent,
          Carbon, Apple HIG or Expressive palettes. Click any swatch to copy its CSS variable.
        </p>
      </div>
      {GROUPS.map((g) => (
        <ColorGroup key={g.title} title={g.title} description={g.description} tokens={g.tokens} />
      ))}
    </div>
  ),
};

export const RadixPalette: Story = {
  name: "Radix Color System",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-8">
      <div className="border-b border-border pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold text-foreground">Radix Color System</h1>
          <span className="text-sm text-muted-foreground font-mono">29 scales × 12 steps</span>
        </div>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          The complete Radix Colors primitive palette — the foundation every semantic token is built from.
          Every scale follows the same 12-step semantics. Toggle dark mode to see automatic remapping.
          Click any step to copy <code className="font-mono text-xs">var(--scale-step)</code>.
        </p>
      </div>
      <RadixPaletteSection />
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
          Status colours — each maps to Radix step-9 (solid accent) of its hue family and
          automatically adjusts for dark mode.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Success",     bg: "--success",     fg: "--success-foreground",  label: "Confirmations, completed states",  radix: "green-9" },
          { name: "Warning",     bg: "--warning",     fg: "--warning-foreground",  label: "Caution, needs attention",          radix: "amber-9" },
          { name: "Info",        bg: "--info",        fg: "--info-foreground",     label: "Neutral notices, tips",             radix: "blue-9" },
          { name: "Destructive", bg: "--destructive", fg: "--primary-foreground",  label: "Errors, danger, delete actions",   radix: "red-9" },
        ].map(({ name, bg, fg, label, radix }) => (
          <div key={bg} className="rounded-2xl overflow-hidden border border-border">
            <div
              className="h-28 flex items-center justify-center"
              style={{ background: `var(${bg})` }}
            >
              <span className="text-sm font-semibold" style={{ color: `var(${fg})` }}>
                {name}
              </span>
            </div>
            <div className="p-4 bg-card">
              <p className="font-semibold text-card-foreground">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs font-mono text-muted-foreground mt-2">{bg}</p>
              <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">→ {radix}</p>
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
          Primary, secondary and accent — the three brand roles. Default: Radix Violet (step 9/3/11).
          Switch the Design Layer toolbar to see alternative brand palettes.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { name: "Primary",   bg: "--primary",   fg: "--primary-foreground",   label: "Main actions, default buttons",        radix: "violet-9" },
          { name: "Secondary", bg: "--secondary", fg: "--secondary-foreground", label: "Supporting actions, chips, tags",       radix: "slate-3" },
          { name: "Accent",    bg: "--accent",    fg: "--accent-foreground",    label: "Hover states, highlights, selection",   radix: "violet-3" },
        ].map(({ name, bg, fg, label, radix }) => (
          <div key={bg} className="rounded-2xl overflow-hidden border border-border">
            <div className="h-40" style={{ background: `var(${bg})` }} />
            <div className="p-4 bg-card">
              <p className="font-semibold text-card-foreground">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs font-mono text-muted-foreground mt-2">{bg}</p>
              <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">→ {radix}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden border border-border max-w-sm">
        <div className="h-24" style={{ background: "var(--destructive)" }} />
        <div className="p-4 bg-card">
          <p className="font-semibold text-card-foreground">Destructive</p>
          <p className="text-xs text-muted-foreground mt-0.5">Errors, danger states, delete actions</p>
          <p className="text-xs font-mono text-muted-foreground mt-2">--destructive</p>
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">→ red-9</p>
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
          Five step-9 colours drawn from distinct hue families — perceptually separated, vivid, and
          automatically dark-mode adapted via Radix.
        </p>
      </div>
      <div className="flex rounded-2xl overflow-hidden border border-border h-24">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex-1" style={{ background: `var(--chart-${n})` }} />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {[
          { n: 1, radix: "violet-9" },
          { n: 2, radix: "cyan-9" },
          { n: 3, radix: "amber-9" },
          { n: 4, radix: "green-9" },
          { n: 5, radix: "red-9" },
        ].map(({ n, radix }) => (
          <div key={n} className="rounded-xl overflow-hidden border border-border">
            <div className="h-16" style={{ background: `var(--chart-${n})` }} />
            <div className="p-2 bg-card space-y-0.5">
              <p className="text-xs font-semibold text-card-foreground">Chart {n}</p>
              <p className="text-[10px] font-mono text-muted-foreground">--chart-{n}</p>
              <p className="text-[10px] font-mono text-muted-foreground/60">{radix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
