"use client";
/**
 * Fusions (TokenOS ladder, ADR-111) — the bridge tier between Primitives and Components.
 *
 * A Fusion merges a few primitives into one reusable unit that components consume: the focus-ring
 * (width + offset + colour), the interaction-state tints (hover/active lightness shifts), the derived
 * colours (muted mixes, contrast-picked foregrounds), and the "field" bundle (surface + border + radius
 * + padding). Everything here reads TokenOS engine variables — no literals.
 */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = { title: "Fusions/Foundations", parameters: { layout: "fullscreen" }, tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

const Page = ({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) => (
  <div className="bg-background text-foreground min-h-screen p-8 space-y-6">
    <div className="border-b border-border pb-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{blurb}</p>
    </div>
    {children}
  </div>
);
const Swatch = ({ label, style }: { label: string; style: React.CSSProperties }) => (
  <div className="space-y-1.5">
    <div className="h-16 rounded-md border border-border" style={style} />
    <div className="text-xs text-muted-foreground font-mono">{label}</div>
  </div>
);

export const FocusRing: Story = {
  name: "Focus ring",
  render: () => (
    <Page title="Focus ring" blurb="width + offset + colour, merged. Every interactive component consumes this one fusion. Tab to a control to see it; a brand's state.focus-ring-width drives the thickness.">
      <div className="flex flex-wrap gap-6 items-center">
        <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 outline-none focus-visible:ring-[length:var(--state-focus-ring-width,3px)] focus-visible:ring-ring/50 focus-visible:border-ring" autoFocus>Focused button</button>
        <input placeholder="Focus me (Tab)" className="rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-[length:var(--state-focus-ring-width,3px)] focus-visible:ring-ring/50" />
      </div>
      <div className="text-sm text-muted-foreground font-mono">--state-focus-ring-width · --state-focus-ring-offset · --ring</div>
    </Page>
  ),
};

export const StateTints: Story = {
  name: "State tints",
  render: () => (
    <Page title="State tints" blurb="hover/active lightness shifts fused onto primary. The relational engine derives these from one primitive + the state knob — a primitive edit moves all three together.">
      <div className="grid grid-cols-3 gap-4 max-w-xl">
        <Swatch label="--primary" style={{ background: "var(--primary)" }} />
        <Swatch label="--primary-hover" style={{ background: "var(--primary-hover, color-mix(in oklch, var(--primary), white 8%))" }} />
        <Swatch label="--primary-active" style={{ background: "var(--primary-active, color-mix(in oklch, var(--primary), white 14%))" }} />
      </div>
    </Page>
  ),
};

export const DerivedColours: Story = {
  name: "Derived colours",
  render: () => (
    <Page title="Derived colours" blurb="muted mixes and contrast-picked foregrounds — colours the engine computes (mix / contrastPick) rather than authors, then hands to components.">
      <div className="grid grid-cols-4 gap-4 max-w-3xl">
        <Swatch label="--muted" style={{ background: "var(--muted)" }} />
        <Swatch label="--muted-foreground" style={{ background: "var(--muted-foreground)" }} />
        <Swatch label="--accent" style={{ background: "var(--accent)" }} />
        <Swatch label="--secondary" style={{ background: "var(--secondary)" }} />
      </div>
    </Page>
  ),
};

export const Field: Story = {
  name: "Field",
  render: () => (
    <Page title="Field" blurb="surface + border + radius + padding, applied together — the structural bundle every text input, select and textarea is built from.">
      <div className="flex flex-col gap-4 max-w-sm">
        <input placeholder="Field bundle" className="rounded-md border border-input bg-background px-3 py-2 shadow-xs" />
        <div className="rounded-md border border-input bg-background px-3 py-2 shadow-xs text-muted-foreground">surface + border + radius + padding</div>
      </div>
    </Page>
  ),
};
