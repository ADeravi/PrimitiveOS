"use client";
/**
 * Primitives / State — the interaction-state primitives (ADR-088/110/115). Two hover archetypes
 * (lightness tint + Material state-layer overlay), disabled, focus-ring, and the new `selected` state
 * (genome finding from Atlassian). Reads --state-* from the engine.
 */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = { title: "Primitives/State", parameters: { layout: "fullscreen" }, tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

const LAYERS: [string, number][] = [["hover", 8], ["focus", 10], ["pressed", 10], ["dragged", 16], ["selected", 12]];

export const Knobs: Story = {
  name: "State knobs",
  render: () => (
    <div className="bg-background text-foreground min-h-screen p-8 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold">State</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The interaction-state primitives. Material lays a <b>state layer</b> — the content colour overlaid at a
          fixed opacity — which is a different model from a lightness tint (ADR-115). Below: each state layer
          binds <code>opacity: var(--state-layer-*)</code>, including the new <code>selected</code> state.
        </p>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">State-layer overlays (content colour over primary)</h2>
        <div className="flex flex-wrap gap-5">
          {LAYERS.map(([s, o]) => (
            <div key={s} className="text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-md bg-primary">
                <div className="absolute inset-0" style={{ background: "var(--primary-foreground)", opacity: `var(--state-layer-${s})` as unknown as number }} />
              </div>
              <div className="mt-1.5 font-mono text-xs">{s}</div>
              <div className="text-xs text-muted-foreground">{o}%</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Disabled — <code className="text-sm">--state-disabled-opacity</code> (0.38)</h2>
        <div className="flex h-12 w-44 items-center justify-center rounded-md bg-primary text-primary-foreground" style={{ opacity: "var(--state-disabled-opacity)" }}>
          Disabled
        </div>
      </div>
    </div>
  ),
};
