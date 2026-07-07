"use client";
/**
 * Foundations / Genome — the design-system genome (session finding, tokens/system-profiles.json).
 *
 * A design system is a POINT in a ~29-knob space with three axes: value primitives (the numbers),
 * model composites (which derivation runs), and policies (behaviour/a11y toggles). Change the knobs,
 * get Material / Apple / your own — without touching component code. Two facts are EMERGENT, not knobs:
 * the 7-role universal core and the ~¾ colour-demand ratio fall out of the levers; they're measured.
 */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = { title: "Foundations/Genome", parameters: { layout: "fullscreen" }, tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

const Page = ({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) => (
  <div className="bg-background text-foreground min-h-screen p-8 space-y-8">
    <div className="border-b border-border pb-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">{blurb}</p>
    </div>
    {children}
  </div>
);

const VALUE_PRIMITIVES: [string, string][] = [
  ["colour", "7-role core + ramps"],
  ["space", "spacing scale"],
  ["radius", "corner radii"],
  ["type", "typographic scale"],
  ["elevation", "shadow / tint ramp"],
  ["motion", "durations + easings"],
  ["state", "hover · focus · pressed · dragged · selected · disabled"],
  ["z-index", "stacking order — Polaris"],
  ["breakpoint", "responsive thresholds"],
  ["scaling", "global size multiplier — Radix"],
  ["scale-ratio", "the ratio scales derive from — Base Web"],
  ["primary-anchor", "which ramp stop is the brand — Mantine"],
];

const MODEL_COMPOSITES: [string, string[]][] = [
  ["hover-model", ["tint", "overlay"]],
  ["container-model", ["flat", "tonal"]],
  ["on-colour-model", ["contrast-pick", "fixed-foreground", "hue-toned"]],
  ["elevation-model", ["shadow", "surface-tint", "both"]],
  ["motion-feel", ["standard", "emphasized", "spring"]],
  ["shape-feel", ["sharp", "neutral", "rounded"]],
  ["surface-material", ["solid", "translucent", "glass"]],
  ["corner-geometry", ["circular", "continuous"]],
  ["depth-technique", ["drop", "inset", "bevel"]],
  ["elevation-direction", ["raised", "sunken", "both"]],
  ["neutral-tint", ["pure", "warm", "cool"]],
  ["density", ["comfortable", "compact"]],
  ["fill-technique", ["solid", "gradient", "material"]],
];

const POLICIES: [string, string[]][] = [
  ["focus-policy", ["auto", "always", "never"]],
  ["auto-contrast", ["off", "on"]],
  ["reduced-motion", ["respect", "ignore"]],
  ["cursor-policy", ["default", "pointer"]],
];

const Axis = ({ n, name, tag, children }: { n: string; name: string; tag: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-mono text-muted-foreground">{n}</span>
      <h2 className="text-lg font-semibold">{name}</h2>
    </div>
    <p className="mb-3 text-sm text-muted-foreground">{tag}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

export const Overview: Story = {
  render: () => (
    <Page
      title="The design-system genome"
      blurb="A design system is a point in a ~29-knob space. Change the knobs → Material, Apple, or your own, without touching component code. Colour is saturated (0 new roles across 9 functional systems); every new finding lands in the non-colour axes."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <Axis n="Axis 1" name="Value primitives" tag="The numbers — 12 settable value tiers.">
          {VALUE_PRIMITIVES.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 rounded-md bg-muted px-3 py-1.5">
              <span className="font-mono text-sm">{k}</span>
              <span className="text-right text-xs text-muted-foreground">{v}</span>
            </div>
          ))}
        </Axis>
        <Axis n="Axis 2" name="Model composites" tag="Which derivation runs — 13 degrees of freedom beyond raw values.">
          {MODEL_COMPOSITES.map(([k, opts]) => (
            <div key={k} className="rounded-md bg-muted px-3 py-1.5">
              <div className="font-mono text-sm">{k}</div>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {opts.map((o) => (
                  <span key={o} className="rounded bg-card px-1.5 py-0.5 text-[11px] text-muted-foreground border border-border">{o}</span>
                ))}
              </div>
            </div>
          ))}
        </Axis>
        <Axis n="Axis 3" name="Policies" tag="Behaviour / a11y toggles — 4 (mostly the Mantine theme).">
          {POLICIES.map(([k, opts]) => (
            <div key={k} className="rounded-md bg-muted px-3 py-1.5">
              <div className="font-mono text-sm">{k}</div>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {opts.map((o) => (
                  <span key={o} className="rounded bg-card px-1.5 py-0.5 text-[11px] text-muted-foreground border border-border">{o}</span>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 p-3">
            <div className="text-sm font-semibold">Emergent — not knobs</div>
            <p className="mt-1 text-xs text-muted-foreground">
              The <b>7-role universal core</b> (primary · primary-foreground · destructive · foreground · muted · muted-foreground · border-subtle)
              and the <b>~¾ colour-demand ratio</b> fall out of the levers. They&rsquo;re measured, not turned.
            </p>
          </div>
        </Axis>
      </div>
    </Page>
  ),
};

// ---- Profiles matrix: each system = a point in the space -------------------
const COLS = ["hover", "container", "elevation", "motion", "shape", "material", "corner", "depth", "direction"] as const;
type Row = { sys: string } & Record<(typeof COLS)[number], string>;
const BASE: Record<(typeof COLS)[number], string> = {
  hover: "tint", container: "flat", elevation: "shadow", motion: "standard", shape: "neutral",
  material: "solid", corner: "circular", depth: "drop", direction: "raised",
};
const PROFILES: Row[] = [
  { sys: "shadcn",     hover: "tint",    container: "flat",  elevation: "shadow",       motion: "standard",   shape: "neutral", material: "solid",       corner: "circular",   depth: "drop",  direction: "raised" },
  { sys: "material",   hover: "overlay", container: "tonal", elevation: "both",         motion: "emphasized", shape: "rounded", material: "solid",       corner: "circular",   depth: "drop",  direction: "raised" },
  { sys: "carbon",     hover: "tint",    container: "flat",  elevation: "shadow",       motion: "standard",   shape: "sharp",   material: "solid",       corner: "circular",   depth: "drop",  direction: "raised" },
  { sys: "fluent",     hover: "tint",    container: "flat",  elevation: "shadow",       motion: "standard",   shape: "neutral", material: "translucent", corner: "circular",   depth: "drop",  direction: "raised" },
  { sys: "apple",      hover: "tint",    container: "flat",  elevation: "surface-tint", motion: "spring",     shape: "rounded", material: "glass",       corner: "continuous", depth: "drop",  direction: "raised" },
  { sys: "atlassian",  hover: "tint",    container: "flat",  elevation: "both",         motion: "standard",   shape: "neutral", material: "solid",       corner: "circular",   depth: "drop",  direction: "both" },
  { sys: "polaris",    hover: "tint",    container: "flat",  elevation: "shadow",       motion: "standard",   shape: "neutral", material: "solid",       corner: "circular",   depth: "bevel", direction: "raised" },
  { sys: "salesforce", hover: "tint",    container: "flat",  elevation: "shadow",       motion: "standard",   shape: "rounded", material: "solid",       corner: "circular",   depth: "drop",  direction: "raised" },
];

export const Profiles: Story = {
  name: "Profiles matrix",
  render: () => (
    <Page
      title="Profiles — each system is a point"
      blurb="The same components, re-derived. Highlighted cells diverge from the shadcn baseline — that divergence IS the system's identity. Nine of these systems add ZERO new colour roles; all the differentiation is in the non-colour knobs."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-semibold">system</th>
              {COLS.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-mono text-xs text-muted-foreground">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROFILES.map((r) => (
              <tr key={r.sys} className="border-b border-border">
                <td className="px-3 py-2 font-semibold">{r.sys}</td>
                {COLS.map((c) => {
                  const diverges = r[c] !== BASE[c];
                  return (
                    <td key={c} className={`px-3 py-2 font-mono text-xs ${diverges ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {r[c]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Radix Themes validates the whole direction — it&rsquo;s a productised settings API (accentColor · grayColor · radius · scaling · panelBackground · appearance · highContrast) = a commercial subset of exactly this genome.
      </p>
    </Page>
  ),
};
