"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
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

const meta: Meta = {
  title: "Patterns/Charts",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A gallery of chart compositions built on the Chart component (recharts). Every series colour comes from the --chart-1…5 tokens, so all charts re-theme with the Design Layer toolbar.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Shared data + configs
// ---------------------------------------------------------------------------
const MONTHLY = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
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

const REGIONS = [
  { region: "AMER", revenue: 420 },
  { region: "EMEA", revenue: 360 },
  { region: "APAC", revenue: 290 },
  { region: "LATAM", revenue: 140 },
];

const regionConfig = {
  revenue: { label: "Revenue ($k)", color: "var(--chart-1)" },
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

const COMBO = [
  { month: "Jan", revenue: 42, users: 310, conversion: 2.1 },
  { month: "Feb", revenue: 51, users: 380, conversion: 2.6 },
  { month: "Mar", revenue: 47, users: 350, conversion: 2.3 },
  { month: "Apr", revenue: 61, users: 470, conversion: 3.1 },
  { month: "May", revenue: 58, users: 440, conversion: 2.8 },
  { month: "Jun", revenue: 70, users: 520, conversion: 3.4 },
];

const comboConfig = {
  revenue: { label: "Revenue ($k)", color: "var(--chart-1)" },
  users: { label: "Active users", color: "var(--chart-2)" },
  conversion: { label: "Conversion (%)", color: "var(--chart-3)" },
} satisfies ChartConfig;

const SCATTER_A = [
  { x: 12, y: 18, z: 40 }, { x: 22, y: 31, z: 90 }, { x: 28, y: 26, z: 60 },
  { x: 35, y: 44, z: 140 }, { x: 44, y: 41, z: 110 }, { x: 52, y: 58, z: 190 },
];
const SCATTER_B = [
  { x: 15, y: 9, z: 50 }, { x: 25, y: 17, z: 70 }, { x: 33, y: 30, z: 120 },
  { x: 41, y: 28, z: 80 }, { x: 49, y: 39, z: 150 }, { x: 58, y: 45, z: 100 },
];

const scatterConfig = {
  a: { label: "Plan A", color: "var(--chart-1)" },
  b: { label: "Plan B", color: "var(--chart-3)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Heatmap — pure SVG, single token hue scaled by opacity (token-safe ramp)
// ---------------------------------------------------------------------------
const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT_WEEKS = 14;
// Deterministic pseudo-random intensity 0..1
const heat = (d: number, w: number) =>
  (Math.sin(d * 3.7 + w * 1.3) + Math.cos(d * 1.9 - w * 2.3) + 2) / 4;

function Heatmap() {
  const cell = 16;
  const pad = 30;
  return (
    <svg
      viewBox={`0 0 ${pad + HEAT_WEEKS * cell + 4} ${18 + 7 * cell + 4}`}
      className="w-full"
    >
      {HEAT_DAYS.map((d, i) => (
        <text
          key={d}
          x={pad - 5}
          y={18 + i * cell + cell * 0.7}
          textAnchor="end"
          fontSize={7}
          fontFamily="monospace"
          fill="var(--muted-foreground)"
        >
          {d}
        </text>
      ))}
      {Array.from({ length: HEAT_WEEKS }, (_, w) => (
        <text
          key={w}
          x={pad + w * cell + cell / 2}
          y={10}
          textAnchor="middle"
          fontSize={6.5}
          fontFamily="monospace"
          fill="var(--muted-foreground)"
        >
          {w % 2 === 0 ? `W${w + 1}` : ""}
        </text>
      ))}
      {HEAT_DAYS.map((_, d) =>
        Array.from({ length: HEAT_WEEKS }, (_, w) => {
          const v = heat(d, w);
          return (
            <rect
              key={`${d}-${w}`}
              x={pad + w * cell}
              y={18 + d * cell}
              width={cell - 2}
              height={cell - 2}
              rx={3}
              fill={v < 0.18 ? "var(--muted)" : "var(--chart-1)"}
              opacity={v < 0.18 ? 0.7 : 0.25 + v * 0.75}
            />
          );
        })
      )}
    </svg>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
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

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export const ChartGallery: Story = {
  name: "Chart Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Charts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Eleven compositions on one data-viz language. Switch the Design Layer to re-theme every series.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Stacked area" description="Traffic by device, stacked.">
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
          </ChartCard>

          <ChartCard title="Grouped bars" description="Desktop vs mobile, side by side.">
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
          </ChartCard>

          <ChartCard title="Horizontal bars" description="Revenue by region with value labels.">
            <ChartContainer config={regionConfig} className="h-56 w-full">
              <BarChart data={REGIONS} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="region" type="category" tickLine={false} axisLine={false} width={56} />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}>
                  <LabelList dataKey="revenue" position="right" className="fill-foreground" fontSize={11} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Line" description="Trend lines with no dots, two series.">
            <ChartContainer config={trafficConfig} className="h-56 w-full">
              <LineChart data={MONTHLY} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line dataKey="desktop" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
                <Line dataKey="mobile" type="monotone" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Donut" description="Share of visitors by browser.">
            <ChartContainer config={browserConfig} className="mx-auto aspect-square max-h-56">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={BROWSERS} dataKey="visitors" nameKey="browser" innerRadius={55} strokeWidth={2} />
                <ChartLegend content={<ChartLegendContent nameKey="browser" />} className="flex-wrap" />
              </PieChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Radar" description="Two plans compared across five metrics.">
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
          </ChartCard>

          <ChartCard title="Radial bars" description="Visitors by browser on a polar scale.">
            <ChartContainer config={browserConfig} className="mx-auto aspect-square max-h-56">
              <RadialBarChart data={BROWSERS} innerRadius={28} outerRadius={100}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="browser" />} />
                <RadialBar dataKey="visitors" background />
                <ChartLegend content={<ChartLegendContent nameKey="browser" />} className="flex-wrap" />
              </RadialBarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Heatmap"
            description="Activity by weekday and week — one token hue, intensity = opacity."
          >
            <Heatmap />
          </ChartCard>

          <ChartCard
            title="Dual axis"
            description="Revenue (bars, left $) against conversion rate (line, right %)."
          >
            <ChartContainer config={comboConfig} className="h-56 w-full">
              <ComposedChart data={COMBO} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} width={30} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Line
                  yAxisId="right"
                  dataKey="conversion"
                  type="monotone"
                  stroke="var(--color-conversion)"
                  strokeWidth={2}
                  dot={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </ComposedChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Triple axis"
            description="Three independent scales: revenue ($k), users (count), conversion (%)."
          >
            <ChartContainer config={comboConfig} className="h-56 w-full">
              <ComposedChart data={COMBO} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="rev" tickLine={false} axisLine={false} width={28} />
                <YAxis
                  yAxisId="usr"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <YAxis
                  yAxisId="cnv"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar yAxisId="rev" dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Line
                  yAxisId="usr"
                  dataKey="users"
                  type="monotone"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="cnv"
                  dataKey="conversion"
                  type="monotone"
                  stroke="var(--color-conversion)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </ComposedChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Scatter / bubble"
            description="Two series on x·y; bubble size carries the third dimension."
          >
            <ChartContainer config={scatterConfig} className="h-56 w-full">
              <ScatterChart margin={{ left: 0, right: 8 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Sessions (k)" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis type="number" dataKey="y" name="Revenue ($k)" tickLine={false} axisLine={false} width={30} />
                <ZAxis type="number" dataKey="z" range={[40, 320]} name="Accounts" />
                <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent hideLabel />} />
                <Scatter name="a" data={SCATTER_A} fill="var(--color-a)" fillOpacity={0.75} />
                <Scatter name="b" data={SCATTER_B} fill="var(--color-b)" fillOpacity={0.75} />
                <ChartLegend content={<ChartLegendContent />} />
              </ScatterChart>
            </ChartContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  ),
};
