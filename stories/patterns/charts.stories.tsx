"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Chart } from "@/components/charts/Chart";
import type { FieldSpec } from "@/components/charts/pickChart";

// Charts/Overview — the sample gallery, now POLICY-DRIVEN. The everyday idioms
// (rank, trend, share, relationship, distribution, KPI) render through the
// <Chart> guardrail: you pass the question + data, and it picks the chart,
// zeroes the baseline, caps a colour-blind-safe palette, gates contrast, and
// attaches an alt-data-table — a dishonest chart is unrepresentable. A second
// section keeps the richer recharts compositions the guardrail doesn't gate yet,
// clearly labelled, so nothing the library can do is hidden.

const meta: Meta = {
  title: "Charts/Overview",
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "The sample gallery, policy-driven. The common idioms flow through the **<Chart>** guardrail (`intent` + `data` → picked chart, zero baseline, capped accessible palette, alt-table). Richer compositions the guardrail doesn't render yet (stacked area, grouped bars, radar, radial, heatmap) are kept raw in a labelled section. The two banned idioms — dual & triple axis — are intentionally removed; see the policy note. Guardrail charts use the fixed Okabe-Ito palette (accessibility over decoration), so they don't re-theme with the Design Layer; the raw section still does.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ── data ─────────────────────────────────────────────────────────────────────
const MONTHLY = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 264, mobile: 140 },
];
const trafficConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

const BROWSERS = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];
const browserConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

const SKILLS = [
  { metric: "Speed", a: 80, b: 60 },
  { metric: "Quality", a: 70, b: 85 },
  { metric: "Cost", a: 60, b: 70 },
  { metric: "Scale", a: 90, b: 55 },
  { metric: "Support", a: 65, b: 80 },
];
const skillsConfig = {
  a: { label: "Plan A", color: "var(--chart-1)" },
  b: { label: "Plan B", color: "var(--chart-3)" },
} satisfies ChartConfig;

// guardrail inputs (the caller declares the question + field types)
const REGIONS = [
  { region: "AMER", revenue: 420 }, { region: "EMEA", revenue: 360 },
  { region: "APAC", revenue: 290 }, { region: "LATAM", revenue: 140 },
];
const REGION_F: FieldSpec[] = [{ name: "region", type: "categorical" }, { name: "revenue", type: "quantitative" }];

const MONTHLY_REV = MONTHLY.map((m) => ({ month: m.month, revenue: m.desktop + m.mobile }));
const TREND_F: FieldSpec[] = [{ name: "month", type: "ordinal" }, { name: "revenue", type: "quantitative" }];

const SHARE = BROWSERS.map(({ browser, visitors }) => ({ browser, visitors }));
const SHARE_F: FieldSpec[] = [{ name: "browser", type: "categorical" }, { name: "visitors", type: "quantitative" }];

const SCATTER = [
  { sessions: 12, revenue: 18, accounts: 40 }, { sessions: 22, revenue: 31, accounts: 90 },
  { sessions: 28, revenue: 26, accounts: 60 }, { sessions: 35, revenue: 44, accounts: 140 },
  { sessions: 44, revenue: 41, accounts: 110 }, { sessions: 52, revenue: 58, accounts: 190 },
  { sessions: 33, revenue: 30, accounts: 120 }, { sessions: 41, revenue: 28, accounts: 80 },
];
const SCATTER_F: FieldSpec[] = [
  { name: "sessions", type: "quantitative" }, { name: "revenue", type: "quantitative" }, { name: "accounts", type: "quantitative" },
];

const DIST = Array.from({ length: 48 }, (_, i) => ({ latency: Math.round(120 + 60 * Math.sin(i * 0.9) + (i % 7) * 14) }));
const DIST_F: FieldSpec[] = [{ name: "latency", type: "quantitative" }];

const KPI = [{ revenue: 1284 }];
const KPI_F: FieldSpec[] = [{ name: "revenue", type: "quantitative" }];

// ── heatmap (raw SVG, token hue × opacity) ───────────────────────────────────
const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT_WEEKS = 14;
const heat = (d: number, w: number) => (Math.sin(d * 3.7 + w * 1.3) + Math.cos(d * 1.9 - w * 2.3) + 2) / 4;

function VizStyles() {
  return (
    <style>{`
      @keyframes viz-pop { from { transform: scale(0); } }
      .viz-pop { animation: viz-pop var(--duration-normal) var(--ease-spring) backwards; transform-box: fill-box; transform-origin: center; }
      .viz-hit { transition: opacity var(--duration-fast) var(--ease-standard), filter var(--duration-fast) var(--ease-standard); cursor: default; }
      .viz-hit:hover { opacity: 1 !important; filter: brightness(1.15); }
      @media (prefers-reduced-motion: reduce) { .viz-pop { animation: none; } }
    `}</style>
  );
}

function Heatmap() {
  const cell = 16, pad = 30;
  return (
    <svg viewBox={`0 0 ${pad + HEAT_WEEKS * cell + 4} ${18 + 7 * cell + 4}`} className="w-full">
      {HEAT_DAYS.map((d, i) => (
        <text key={d} x={pad - 5} y={18 + i * cell + cell * 0.7} textAnchor="end" fontSize={7} fontFamily="monospace" fill="var(--muted-foreground)">{d}</text>
      ))}
      {HEAT_DAYS.map((_, d) =>
        Array.from({ length: HEAT_WEEKS }, (_, w) => {
          const v = heat(d, w);
          return (
            <rect key={`${d}-${w}`} className="viz-pop viz-hit" style={{ animationDelay: `${(w * 7 + d) * 6}ms` }}
              x={pad + w * cell} y={18 + d * cell} width={cell - 2} height={cell - 2} rx={3}
              fill={v < 0.18 ? "var(--muted)" : "var(--chart-1)"} opacity={v < 0.18 ? 0.7 : 0.25 + v * 0.75}>
              <title>{`${HEAT_DAYS[d]} W${w + 1}: ${(v * 10).toFixed(1)}`}</title>
            </rect>
          );
        })
      )}
    </svg>
  );
}

function RawCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="mt-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{kicker}</div>
      <h2 className="text-lg font-bold text-foreground mt-0.5">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">{sub}</p>
    </div>
  );
}

// ── gallery ──────────────────────────────────────────────────────────────────
export const ChartGallery: Story = {
  name: "Chart Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <VizStyles />
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Charts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The everyday idioms run through the <code className="text-xs">&lt;Chart&gt;</code> guardrail — meaning in, an honest chart out. Richer compositions the guardrail doesn&apos;t gate yet are kept raw below.
          </p>
        </div>

        <SectionHead
          kicker="Policy-driven · via <Chart>"
          title="Pass the question, get an honest chart"
          sub="Each card supplies only intent + data + a takeaway title. The guardrail picks the chart, zeroes the baseline, caps a colour-blind-safe palette, and attaches the alt-data-table. The grade badge shows the linter's verdict."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="pt-6">
            <Chart intent="rank regions by revenue" title="AMER leads revenue; LATAM trails" data={REGIONS} fields={REGION_F} height={230} showGrade />
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Chart intent="revenue over time" title="Revenue climbed back through H1" data={MONTHLY_REV} fields={TREND_F} height={230} showGrade />
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Chart intent="share of visitors by browser" title="Chrome and Safari are most of traffic" data={SHARE} fields={SHARE_F} height={230} showGrade />
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Chart intent="relationship between sessions and revenue" title="Revenue rises with sessions" data={SCATTER} fields={SCATTER_F} height={230} showGrade />
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Chart intent="distribution of latency" title="Latency clusters around 150 ms" data={DIST} fields={DIST_F} height={230} showGrade />
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Chart intent="kpi total revenue" title="Revenue this quarter ($k)" data={KPI} fields={KPI_F} height={230} showGrade />
          </CardContent></Card>
        </div>

        <SectionHead
          kicker="Raw recharts · outside the guardrail"
          title="Compositions the guardrail doesn't render yet"
          sub="Multi-series and polar idioms the <Chart> renderer doesn't cover. Kept raw so the library's full range stays visible; these still re-theme with the Design Layer. Roadmap: fold the honest ones (stacked area, grouped bars) into <Chart>."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <RawCard title="Stacked area" description="Traffic by device, stacked.">
            <ChartContainer config={trafficConfig} className="h-56 w-full">
              <AreaChart data={MONTHLY} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area dataKey="mobile" type="natural" stackId="a" fill="var(--color-mobile)" fillOpacity={0.4} stroke="var(--color-mobile)" />
                <Area dataKey="desktop" type="natural" stackId="a" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </RawCard>

          <RawCard title="Grouped bars" description="Desktop vs mobile, side by side.">
            <ChartContainer config={trafficConfig} className="h-56 w-full">
              <BarChart data={MONTHLY}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </RawCard>

          <RawCard title="Radar" description="Two plans compared across five metrics.">
            <ChartContainer config={skillsConfig} className="mx-auto aspect-square max-h-56">
              <RadarChart data={SKILLS}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey="metric" />
                <PolarGrid />
                <Radar dataKey="a" fill="var(--color-a)" fillOpacity={0.5} stroke="var(--color-a)" />
                <Radar dataKey="b" fill="var(--color-b)" fillOpacity={0.4} stroke="var(--color-b)" />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </RawCard>

          <RawCard title="Radial bars" description="Visitors by browser on a polar scale.">
            <ChartContainer config={browserConfig} className="mx-auto aspect-square max-h-56">
              <RadialBarChart data={BROWSERS} innerRadius={28} outerRadius={100}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="browser" />} />
                <RadialBar dataKey="visitors" background />
                <ChartLegend content={<ChartLegendContent nameKey="browser" />} className="flex-wrap" />
              </RadialBarChart>
            </ChartContainer>
          </RawCard>

          <RawCard title="Heatmap" description="Activity by weekday and week — one token hue, intensity = opacity.">
            <Heatmap />
          </RawCard>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Dual &amp; triple axis — removed by policy</CardTitle>
              <CardDescription>Not a coverage gap — a refusal.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Two cards used to live here. A second y-axis invites a correlation the data may not support, and the eye can&apos;t tell which scale a mark belongs to. <code className="text-xs">validateChart</code> bans <code className="text-xs">dualAxis</code>; the honest fixes are to split into two charts or index both series to a common base (= 100).
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};
