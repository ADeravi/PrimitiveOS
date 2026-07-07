"use client";
/**
 * Primitives / Z-Index — the stacking-order primitive (genome finding from Polaris, wired ADR-116).
 * Named layers so z-index is a token, not a magic number. Reads --z-index-* from the TokenOS engine.
 */
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = { title: "Primitives/Z-Index", parameters: { layout: "fullscreen" }, tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

const LEVELS: [string, number][] = [
  ["base", 0], ["dropdown", 1000], ["sticky", 1100], ["overlay", 1200],
  ["modal", 1300], ["popover", 1400], ["toast", 1500], ["tooltip", 1600],
];

export const Scale: Story = {
  name: "Stacking scale",
  render: () => (
    <div className="bg-background text-foreground min-h-screen p-8 space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold">Z-Index</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A stacking-order primitive — a genome finding validated against Shopify Polaris. Named layers so
          z-index is a token, not an ad-hoc magic number. Each card binds <code>z-index: var(--z-index-*)</code>.
        </p>
      </div>
      <div className="relative h-72">
        {LEVELS.map(([name, v], i) => (
          <div key={name}
            className="absolute rounded-md border border-border bg-card px-4 py-3 shadow-md"
            style={{ left: i * 30, top: i * 22, zIndex: `var(--z-index-${name})` as unknown as number }}>
            <div className="font-mono text-sm">--z-index-{name}</div>
            <div className="text-xs text-muted-foreground">{v}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
