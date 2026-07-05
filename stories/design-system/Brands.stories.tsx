"use client";
/**
 * Design System / Brands (TokenOS ADR-104)
 *
 * Swap a WHOLE identity — not one primitive. Each button injects a brand's engine-emitted referential
 * CSS (`brands-data.mjs`, produced by `TOKENOS_BRAND=<id> node packages/core/index.mjs`) as a <style>
 * on :root, so the real ScnTw components below re-skin all at once: colour + radius + motion +
 * elevation. The overlay persists on `:root`, so navigating to any other story shows it in that brand.
 *
 * This recasts ScnTw's hardcoded "Design Layer" switcher as real TokenOS brands: the values come from
 * the engine (deep-merged overlays, re-derived, gate-checked — CVD + WCAG-AAA-in-high-contrast), not
 * hand-written constants. Add a brand by dropping a `tokens/brands/<id>.json` overlay and re-running
 * `build-brands.mjs`. Use on the default "shadcn" Design Layer.
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
import { BRANDS, BRAND_CSS } from "./brands-data";

const STYLE_ID = "tokenos-brand";

function applyBrand(id: string | null) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!id) { el?.remove(); return; }
  if (!el) { el = document.createElement("style"); el.id = STYLE_ID; document.head.appendChild(el); }
  el.textContent = BRAND_CSS[id] ?? "";
}

function BrandSwitcher() {
  const [active, setActive] = React.useState<string | null>(null);
  const pick = (id: string | null) => { setActive(id); applyBrand(id); };

  const chip = (id: string | null, label: string) => {
    const on = active === id;
    return (
      <button
        key={label}
        onClick={() => pick(id)}
        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
          on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Brands</h1>
            <Badge variant="secondary">TokenOS engine</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Pick a brand — the real ScnTw components below re-skin entirely (colour, radius, motion,
            elevation). Each is an engine-resolved overlay (<code className="text-foreground">tokens/brands/&lt;id&gt;.json</code>),
            not a hardcoded preset, and every one passed the CVD + WCAG-AAA-in-high-contrast gates on
            build. The choice persists on <code className="text-foreground">:root</code>, so any other
            story renders in this brand too.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {chip(null, "Default (neutral)")}
          {BRANDS.map((b) => chip(b.id, b.label))}
          {active && (
            <span className="ml-2 text-sm text-muted-foreground">
              {BRANDS.find((b) => b.id === active)?.blurb}
            </span>
          )}
        </div>

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

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account settings</CardTitle>
                <CardDescription>Real ScnTw card — re-skinned by the selected TokenOS brand.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="br-email">Email</Label>
                  <Input id="br-email" placeholder="you@example.com" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="br-notify" defaultChecked />
                  <Label htmlFor="br-notify">Email me about activity</Label>
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button>Save</Button>
                <Button variant="outline">Cancel</Button>
              </CardFooter>
            </Card>

            <Alert>
              <AlertTitle>Whole-identity swap</AlertTitle>
              <AlertDescription>
                Corner radius, motion timing and shadow depth change with the colour — because a brand
                overlays primitives + radius + motion + elevation, and the components bind to roles that
                trace to all of them. One head, many identities.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Foundations/Brands",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Switcher: Story = {
  name: "Brands",
  render: () => <BrandSwitcher />,
};
