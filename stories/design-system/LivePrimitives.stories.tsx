"use client";
/**
 * Design System / Live Primitives (TokenOS ADR-103)
 *
 * Manipulate the TokenOS *primitives* and watch the REAL ScnTw components below recolour
 * instantly. Every control setProperty()s a `--primitive-*` on :root; because ScnTw binds to
 * roles that trace to those primitives through the token graph, the cascade is automatic — no
 * rebuild. The overrides persist on :root, so navigating to any other component story shows it
 * recoloured too.
 *
 * Scope of the instant preview: *referential* values move live (primary, foreground, card,
 * border, ring, destructive, chart-*, …). Literal-authored semantics (e.g. muted) and derived
 * tints (hover/active/*-muted, contrast-picked foregrounds) are recomputed EXACTLY by the real
 * engine — from the TokenOS repo run `node integration/scntw/live/watch.mjs <this-checkout>` and
 * edit tokens/tokens.json to see those move too. Use this on the default "shadcn" Design Layer.
 */
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { STOPS, ANCHORS, retintNeutral, hexToOklch } from "./live-primitives";

const DEFAULT_HEX: Record<string, string> = {
  "--primitive-neutral-900": "#1a1a1a",
  "--primitive-red-600": "#dc2626",
  "--primitive-green-600": "#16a34a",
  "--primitive-blue-600": "#2563eb",
  "--primitive-amber-500": "#f59e0b",
};

function LivePrimitivesEditor() {
  const [hue, setHue] = React.useState(264);
  const [chroma, setChroma] = React.useState(0);
  const [radius, setRadius] = React.useState(0.5);
  const touched = React.useRef<Set<string>>(new Set());
  const baseline = React.useRef<Record<string, string>>({});

  const root = () => document.documentElement;
  const readVar = (n: string) => getComputedStyle(root()).getPropertyValue(n).trim();
  const setVar = (n: string, v: string) => { root().style.setProperty(n, v); touched.current.add(n); };

  // Capture the ramp's shipped values once, so retints always start from the original (no compounding).
  React.useEffect(() => {
    const b: Record<string, string> = {};
    for (const s of STOPS) b[`--primitive-neutral-${s}`] = readVar(`--primitive-neutral-${s}`);
    baseline.current = b;
    const cur = readVar("--radius");
    const n = parseFloat(cur);
    if (!Number.isNaN(n)) setRadius(cur.includes("rem") ? n : n / 16);
  }, []);

  const applyTint = (h: number, c: number) => {
    const out = retintNeutral(baseline.current, h, c);
    for (const [name, val] of Object.entries(out)) setVar(name, val);
  };
  const onHue = (h: number) => { setHue(h); applyTint(h, chroma); };
  const onChroma = (c: number) => { setChroma(c); applyTint(hue, c); };
  const onAnchor = (key: string, hex: string) => { const ok = hexToOklch(hex); if (ok) setVar(key, ok); };
  const onRadius = (v: number) => { setRadius(v); setVar("--radius", `${v}rem`); };

  const resetAll = () => {
    touched.current.forEach((n) => root().style.removeProperty(n));
    touched.current.clear();
    setHue(264); setChroma(0); setRadius(0.5);
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Live Primitives</h1>
            <Badge variant="secondary">TokenOS engine</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Drag a control — the real ScnTw components below recolour instantly, because they bind to
            roles that trace to these primitives through the token graph. Overrides persist on{" "}
            <code className="text-foreground">:root</code>, so any other story is recoloured too. For
            exact hover/active tints and literal tokens, run the engine watch loop and edit{" "}
            <code className="text-foreground">tokens/tokens.json</code>.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* ── Controls ─────────────────────────────────────────────── */}
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Neutral ramp tint</h2>
                <Button variant="ghost" size="sm" onClick={resetAll}>Reset</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keeps each stop&apos;s lightness, applies a shared hue + chroma. Primary, foreground,
                card, border and ring all follow.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><Label>Hue</Label><span className="text-muted-foreground">{hue}°</span></div>
                <input type="range" min={0} max={360} step={1} value={hue}
                  onChange={(e) => onHue(+e.target.value)} className="w-full" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><Label>Chroma</Label><span className="text-muted-foreground">{chroma.toFixed(3)}</span></div>
                <input type="range" min={0} max={0.05} step={0.002} value={chroma}
                  onChange={(e) => onChroma(+e.target.value)} className="w-full" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><Label>Radius</Label><span className="text-muted-foreground">{radius.toFixed(2)}rem</span></div>
                <input type="range" min={0} max={1.5} step={0.05} value={radius}
                  onChange={(e) => onRadius(+e.target.value)} className="w-full" />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-semibold">Status anchors</h2>
              <p className="text-xs text-muted-foreground">Each swatch writes one primitive stop.</p>
              {ANCHORS.map((a) => (
                <div key={a.key} className="flex items-center gap-3">
                  <input type="color" defaultValue={DEFAULT_HEX[a.key] ?? "#888888"}
                    onChange={(e) => onAnchor(a.key, e.target.value)}
                    className="h-8 w-10 shrink-0 rounded border border-border bg-transparent" />
                  <div className="min-w-0">
                    <div className="text-sm">{a.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.note}</div>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* ── Live real components ─────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account settings</CardTitle>
                <CardDescription>Real ScnTw card, coloured entirely by TokenOS primitives.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lp-email">Email</Label>
                  <Input id="lp-email" placeholder="you@example.com" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="lp-notify" defaultChecked />
                  <Label htmlFor="lp-notify">Email me about activity</Label>
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button>Save</Button>
                <Button variant="outline">Cancel</Button>
              </CardFooter>
            </Card>

            <Alert>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                This alert, the buttons, badges, inputs and switch are all real ScnTw components —
                every colour here is a TokenOS primitive you can drag.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Foundations/Live Primitives",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Editor: Story = {
  name: "Live Primitives",
  render: () => <LivePrimitivesEditor />,
};
