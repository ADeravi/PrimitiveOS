"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Design System/Motion",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const DURATIONS = [
  { token: "--duration-instant", ms: "75ms",  usage: "Hover tints, focus rings" },
  { token: "--duration-fast",    ms: "150ms", usage: "Buttons, toggles, tooltips" },
  { token: "--duration-normal",  ms: "250ms", usage: "Dropdowns, popovers, accordions" },
  { token: "--duration-slow",    ms: "400ms", usage: "Dialogs, sheets, page transitions" },
];

const EASINGS = [
  { token: "--ease-standard", curve: "cubic-bezier(0.2, 0, 0, 1)",      usage: "Default for most transitions" },
  { token: "--ease-enter",    curve: "cubic-bezier(0, 0, 0.2, 1)",      usage: "Elements entering the screen" },
  { token: "--ease-exit",     curve: "cubic-bezier(0.4, 0, 1, 1)",      usage: "Elements leaving the screen" },
  { token: "--ease-spring",   curve: "cubic-bezier(0.34, 1.56, 0.64, 1)", usage: "Playful emphasis, toasts" },
];

function Demo({ duration, easing }: { duration: string; easing: string }) {
  return (
    <div className="group h-12 rounded-lg bg-muted relative overflow-hidden cursor-pointer">
      <div
        className="absolute left-1 top-1 size-10 rounded-md bg-primary transition-transform group-hover:translate-x-[calc(100%+8rem)]"
        style={{
          transitionDuration: `var(${duration})`,
          transitionTimingFunction: `var(${easing})`,
        }}
      />
    </div>
  );
}

export const Tokens: Story = {
  name: "Durations & Easings",
  render: () => (
    <div className="bg-background min-h-screen p-8 space-y-10">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Motion</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Four durations and four easing curves cover all interface motion.
          Hover each demo strip to preview. Smaller elements move faster;
          entering elements decelerate, exiting elements accelerate.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Durations</h2>
        <div className="space-y-5 max-w-xl">
          {DURATIONS.map((d) => (
            <div key={d.token} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-xs text-foreground">{d.token} · {d.ms}</p>
                <p className="text-xs text-muted-foreground">{d.usage}</p>
              </div>
              <Demo duration={d.token} easing="--ease-standard" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Easings</h2>
        <div className="space-y-5 max-w-xl">
          {EASINGS.map((e) => (
            <div key={e.token} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-xs text-foreground">{e.token}</p>
                <p className="text-xs text-muted-foreground">{e.usage}</p>
              </div>
              <Demo duration="--duration-slow" easing={e.token} />
              <p className="font-mono text-[10px] text-muted-foreground/70">{e.curve}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Rules</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5 max-w-xl">
          <li>Animate <code className="font-mono text-xs">transform</code> and <code className="font-mono text-xs">opacity</code> only — never layout properties.</li>
          <li>Respect <code className="font-mono text-xs">prefers-reduced-motion</code>; tw-animate-css handles this for built-in animations.</li>
          <li>Anything over 400ms must be interruptible.</li>
        </ul>
      </section>
    </div>
  ),
};
