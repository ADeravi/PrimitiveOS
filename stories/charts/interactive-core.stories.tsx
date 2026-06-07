"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const meta: Meta = {
  title: "Charts/Interactive/Core",
  parameters: {
    layout: "centered",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Interactive versions of the core chart family. Every chart is a self-contained component with live controls — series toggles, range selectors, curve/stacking modes, sliders — built entirely from the design-system inputs (Button-style pills, Slider, Switch) and the --chart-* tokens.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// ---------------------------------------------------------------------------
// Shared deterministic data
// ---------------------------------------------------------------------------
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS24 = Array.from({ length: 24 }, (_, i) => ({
  month: `${MONTH_NAMES[i % 12]} ${i < 12 ? "25" : "26"}`,
  desktop: Math.round(180 + 70 * Math.sin(i / 2.4) + i * 4),
  mobile: Math.round(120 + 50 * Math.sin(i / 1.9 + 1.2) + i * 6),
  tablet: Math.round(60 + 28 * Math.sin(i / 3.1 + 2.4) + i * 1.5),
}));

const SERIES = [
  { key: "desktop", label: "Desktop", color: TOKEN[0] },
  { key: "mobile", label: "Mobile", color: TOKEN[1] },
  { key: "tablet", label: "Tablet", color: TOKEN[2] },
] as const;

const seriesConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  tablet: { label: "Tablet", color: "var(--chart-3)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Control primitives (token-themed, reused by every chart)
// ---------------------------------------------------------------------------
function SeriesPill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-transparent bg-secondary text-secondary-foreground"
          : "border-border bg-transparent text-muted-foreground opacity-60"
      }`}
    >
      <span
        className="size-2 rounded-full"
        style={{ background: color, opacity: active ? 1 : 0.4 }}
      />
      {label}
    </button>
  );
}

function Seg<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`rounded-[calc(var(--radius)-4px)] px-2.5 py-1 text-xs font-medium transition-colors ${
            o === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Controls({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">{children}</div>;
}

function Frame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-[620px] max-w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function useSeriesToggle() {
  const [on, setOn] = React.useState<Record<string, boolean>>({ desktop: true, mobile: true, tablet: true });
  const toggle = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));
  return { on, toggle };
}

const RANGES = ["6M", "12M", "24M"] as const;
const rangeSlice = (r: (typeof RANGES)[number]) =>
  MONTHS24.slice(r === "6M" ? 18 : r === "12M" ? 12 : 0);

// ---------------------------------------------------------------------------
// 1. Line
// ---------------------------------------------------------------------------
function InteractiveLine() {
  const { on, toggle } = useSeriesToggle();
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("12M");
  const [curve, setCurve] = React.useState<"smooth" | "linear" | "step">("smooth");
  const [dots, setDots] = React.useState(false);
  const type = curve === "smooth" ? "monotone" : curve === "linear" ? "linear" : "stepAfter";
  return (
    <Frame title="Line" description="Range, curve interpolation, point markers and per-series visibility.">
      <Controls>
        <Seg options={RANGES} value={range} onChange={setRange} ariaLabel="Range" />
        <Seg options={["smooth", "linear", "step"] as const} value={curve} onChange={setCurve} ariaLabel="Curve" />
        <span className="flex items-center gap-2">
          <Switch id="line-dots" checked={dots} onCheckedChange={setDots} />
          <Label htmlFor="line-dots" className="text-xs text-muted-foreground">Dots</Label>
        </span>
        <span className="flex items-center gap-1.5">
          {SERIES.map((s) => (
            <SeriesPill key={s.key} label={s.label} color={s.color} active={on[s.key]} onClick={() => toggle(s.key)} />
          ))}
        </span>
      </Controls>
      <ChartContainer config={seriesConfig} className="h-64 w-full">
        <LineChart data={rangeSlice(range)} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {SERIES.filter((s) => on[s.key]).map((s) => (
            <Line key={s.key} dataKey={s.key} type={type} stroke={s.color} strokeWidth={2} dot={dots} />
          ))}
        </LineChart>
      </ChartContainer>
    </Frame>
  );
}

export const LineStory: Story = { name: "Line", render: () => <InteractiveLine /> };

// ---------------------------------------------------------------------------
// 2. Area
// ---------------------------------------------------------------------------
function InteractiveArea() {
  const { on, toggle } = useSeriesToggle();
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("12M");
  const [mode, setMode] = React.useState<"stacked" | "overlap" | "100%">("stacked");
  const stackId = mode === "overlap" ? undefined : "a";
  return (
    <Frame title="Area" description="Stacked, overlapped or 100% normalised; toggle series in and out.">
      <Controls>
        <Seg options={RANGES} value={range} onChange={setRange} ariaLabel="Range" />
        <Seg options={["stacked", "overlap", "100%"] as const} value={mode} onChange={setMode} ariaLabel="Mode" />
        <span className="flex items-center gap-1.5">
          {SERIES.map((s) => (
            <SeriesPill key={s.key} label={s.label} color={s.color} active={on[s.key]} onClick={() => toggle(s.key)} />
          ))}
        </span>
      </Controls>
      <ChartContainer config={seriesConfig} className="h-64 w-full">
        <AreaChart
          data={rangeSlice(range)}
          stackOffset={mode === "100%" ? "expand" : "none"}
          margin={{ left: 0, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => (mode === "100%" ? `${Math.round(v * 100)}%` : `${v}`)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {SERIES.filter((s) => on[s.key]).map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stackId={stackId}
              stroke={s.color}
              fill={s.color}
              fillOpacity={mode === "overlap" ? 0.25 : 0.4}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </Frame>
  );
}

export const AreaStory: Story = { name: "Area", render: () => <InteractiveArea /> };

// ---------------------------------------------------------------------------
// 3. Bar
// ---------------------------------------------------------------------------
const REGION_DATA = [
  { region: "AMER", current: 420, previous: 360 },
  { region: "EMEA", current: 360, previous: 390 },
  { region: "APAC", current: 290, previous: 215 },
  { region: "LATAM", current: 140, previous: 110 },
  { region: "MEA", current: 90, previous: 95 },
];

const regionConfig = {
  current: { label: "FY26", color: "var(--chart-1)" },
  previous: { label: "FY25", color: "var(--chart-3)" },
} satisfies ChartConfig;

function InteractiveBar() {
  const [mode, setMode] = React.useState<"grouped" | "stacked">("grouped");
  const [sorted, setSorted] = React.useState(false);
  const [horizontal, setHorizontal] = React.useState(false);
  const data = sorted ? [...REGION_DATA].sort((a, b) => b.current - a.current) : REGION_DATA;
  return (
    <Frame title="Bar" description="Grouped vs stacked, sorted vs source order, vertical vs horizontal.">
      <Controls>
        <Seg options={["grouped", "stacked"] as const} value={mode} onChange={setMode} ariaLabel="Mode" />
        <span className="flex items-center gap-2">
          <Switch id="bar-sort" checked={sorted} onCheckedChange={setSorted} />
          <Label htmlFor="bar-sort" className="text-xs text-muted-foreground">Sort by value</Label>
        </span>
        <span className="flex items-center gap-2">
          <Switch id="bar-horiz" checked={horizontal} onCheckedChange={setHorizontal} />
          <Label htmlFor="bar-horiz" className="text-xs text-muted-foreground">Horizontal</Label>
        </span>
      </Controls>
      <ChartContainer config={regionConfig} className="h-64 w-full">
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <YAxis dataKey="region" type="category" tickLine={false} axisLine={false} width={56} />
              <XAxis type="number" tickLine={false} axisLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey="region" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={36} />
            </>
          )}
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="previous" stackId={mode === "stacked" ? "s" : undefined} fill="var(--chart-3)" radius={3} />
          <Bar dataKey="current" stackId={mode === "stacked" ? "s" : undefined} fill="var(--chart-1)" radius={3} />
        </BarChart>
      </ChartContainer>
    </Frame>
  );
}

export const BarStory: Story = { name: "Bar", render: () => <InteractiveBar /> };

// ---------------------------------------------------------------------------
// 4. Donut
// ---------------------------------------------------------------------------
const DONUT_PARTS = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 187 },
  { key: "edge", label: "Edge", value: 173 },
  { key: "other", label: "Other", value: 90 },
];

const donutConfig = Object.fromEntries(
  DONUT_PARTS.map((p, i) => [p.key, { label: p.label, color: `var(--chart-${i + 1})` }])
) as ChartConfig;

function InteractiveDonut() {
  const [on, setOn] = React.useState<Record<string, boolean>>(
    Object.fromEntries(DONUT_PARTS.map((p) => [p.key, true]))
  );
  const [inner, setInner] = React.useState(55);
  const visible = DONUT_PARTS.filter((p) => on[p.key]).map((p, i) => ({
    ...p,
    fill: TOKEN[DONUT_PARTS.indexOf(p) % 5] ?? TOKEN[i % 5],
  }));
  const total = visible.reduce((a, p) => a + p.value, 0);
  return (
    <Frame title="Donut" description="Toggle slices and adjust the inner radius from ring to pie.">
      <Controls>
        <span className="flex items-center gap-1.5">
          {DONUT_PARTS.map((p, i) => (
            <SeriesPill
              key={p.key}
              label={p.label}
              color={TOKEN[i % 5]}
              active={on[p.key]}
              onClick={() => setOn((s) => ({ ...s, [p.key]: !s[p.key] }))}
            />
          ))}
        </span>
        <span className="flex w-44 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Inner {inner}</Label>
          <Slider value={[inner]} onValueChange={([v]) => setInner(v)} min={0} max={80} step={5} />
        </span>
      </Controls>
      <div className="relative">
        <ChartContainer config={donutConfig} className="mx-auto aspect-square max-h-64">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={visible} dataKey="value" nameKey="label" innerRadius={inner} strokeWidth={2} />
          </PieChart>
        </ChartContainer>
        {inner >= 35 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">visitors</span>
          </div>
        )}
      </div>
    </Frame>
  );
}

export const DonutStory: Story = { name: "Donut", render: () => <InteractiveDonut /> };

// ---------------------------------------------------------------------------
// 5. Radar
// ---------------------------------------------------------------------------
const RADAR_DATA = [
  { metric: "Speed", a: 80, b: 60, c: 45 },
  { metric: "Quality", a: 70, b: 85, c: 60 },
  { metric: "Cost", a: 60, b: 70, c: 90 },
  { metric: "Scale", a: 90, b: 55, c: 50 },
  { metric: "Support", a: 65, b: 80, c: 70 },
  { metric: "Docs", a: 55, b: 62, c: 78 },
];

const PLANS = [
  { key: "a", label: "Plan A", color: TOKEN[0] },
  { key: "b", label: "Plan B", color: TOKEN[2] },
  { key: "c", label: "Plan C", color: TOKEN[1] },
] as const;

const radarConfig = {
  a: { label: "Plan A", color: "var(--chart-1)" },
  b: { label: "Plan B", color: "var(--chart-3)" },
  c: { label: "Plan C", color: "var(--chart-2)" },
} satisfies ChartConfig;

function InteractiveRadar() {
  const [on, setOn] = React.useState<Record<string, boolean>>({ a: true, b: true, c: false });
  const [opacity, setOpacity] = React.useState(45);
  return (
    <Frame title="Radar" description="Compare up to three plans; tune the fill opacity for overlap legibility.">
      <Controls>
        <span className="flex items-center gap-1.5">
          {PLANS.map((p) => (
            <SeriesPill
              key={p.key}
              label={p.label}
              color={p.color}
              active={on[p.key]}
              onClick={() => setOn((s) => ({ ...s, [p.key]: !s[p.key] }))}
            />
          ))}
        </span>
        <span className="flex w-44 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Fill {opacity}%</Label>
          <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={0} max={80} step={5} />
        </span>
      </Controls>
      <ChartContainer config={radarConfig} className="mx-auto aspect-square max-h-64">
        <RadarChart data={RADAR_DATA}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <PolarAngleAxis dataKey="metric" />
          <PolarGrid />
          {PLANS.filter((p) => on[p.key]).map((p) => (
            <Radar key={p.key} dataKey={p.key} stroke={p.color} fill={p.color} fillOpacity={opacity / 100} />
          ))}
        </RadarChart>
      </ChartContainer>
    </Frame>
  );
}

export const RadarStory: Story = { name: "Radar", render: () => <InteractiveRadar /> };

// ---------------------------------------------------------------------------
// 6. Scatter / bubble
// ---------------------------------------------------------------------------
const SCATTER = [0, 1].map((g) =>
  Array.from({ length: 14 }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin((i + 1) * 127.1 + (g + 1) * 311.7 + k * 73.3) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      x: Math.round(10 + r(1) * 55 + g * 6),
      y: Math.round(8 + r(2) * 48 + g * 10),
      z: Math.round(30 + r(3) * 170),
    };
  })
);

const scatterConfig = {
  a: { label: "Plan A", color: "var(--chart-1)" },
  b: { label: "Plan B", color: "var(--chart-3)" },
} satisfies ChartConfig;

function InteractiveScatter() {
  const [on, setOn] = React.useState<Record<string, boolean>>({ a: true, b: true });
  const [bubble, setBubble] = React.useState(true);
  const [size, setSize] = React.useState(160);
  return (
    <Frame title="Scatter / Bubble" description="Toggle series, switch bubble sizing on or off, scale the size range.">
      <Controls>
        <span className="flex items-center gap-1.5">
          <SeriesPill label="Plan A" color={TOKEN[0]} active={on.a} onClick={() => setOn((s) => ({ ...s, a: !s.a }))} />
          <SeriesPill label="Plan B" color={TOKEN[2]} active={on.b} onClick={() => setOn((s) => ({ ...s, b: !s.b }))} />
        </span>
        <span className="flex items-center gap-2">
          <Switch id="sc-bubble" checked={bubble} onCheckedChange={setBubble} />
          <Label htmlFor="sc-bubble" className="text-xs text-muted-foreground">Bubble size</Label>
        </span>
        <span className="flex w-44 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Max {size}</Label>
          <Slider value={[size]} onValueChange={([v]) => setSize(v)} min={60} max={400} step={20} disabled={!bubble} />
        </span>
      </Controls>
      <ChartContainer config={scatterConfig} className="h-64 w-full">
        <ScatterChart margin={{ left: 0, right: 12 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Sessions (k)" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis type="number" dataKey="y" name="Revenue ($k)" tickLine={false} axisLine={false} width={32} />
          <ZAxis type="number" dataKey="z" range={bubble ? [40, size] : [70, 70]} name="Accounts" />
          <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent hideLabel />} />
          {on.a && <Scatter name="a" data={SCATTER[0]} fill={TOKEN[0]} fillOpacity={0.75} />}
          {on.b && <Scatter name="b" data={SCATTER[1]} fill={TOKEN[2]} fillOpacity={0.75} />}
        </ScatterChart>
      </ChartContainer>
    </Frame>
  );
}

export const ScatterStory: Story = { name: "Scatter", render: () => <InteractiveScatter /> };

// ---------------------------------------------------------------------------
// 7. Heatmap
// ---------------------------------------------------------------------------
const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heat = (d: number, w: number) =>
  (Math.sin(d * 3.7 + w * 1.3) + Math.cos(d * 1.9 - w * 2.3) + 2) / 4;

function InteractiveHeatmap() {
  const [weeks, setWeeks] = React.useState<"8" | "14" | "20">("14");
  const [threshold, setThreshold] = React.useState(0);
  const [hover, setHover] = React.useState<string | null>(null);
  const W = Number(weeks);
  const cell = 16;
  const pad = 30;
  return (
    <Frame title="Heatmap" description="Adjust the visible window and filter low-intensity cells with the threshold.">
      <Controls>
        <Seg options={["8", "14", "20"] as const} value={weeks} onChange={setWeeks} ariaLabel="Weeks" />
        <span className="flex w-52 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Min {threshold}%</Label>
          <Slider value={[threshold]} onValueChange={([v]) => setThreshold(v)} min={0} max={80} step={5} />
        </span>
        <span className="text-xs tabular-nums text-muted-foreground min-w-28">
          {hover ?? "hover a cell"}
        </span>
      </Controls>
      <svg viewBox={`0 0 ${pad + W * cell + 4} ${18 + 7 * cell + 4}`} className="w-full">
        {HEAT_DAYS.map((d, i) => (
          <text key={d} x={pad - 5} y={18 + i * cell + cell * 0.7} textAnchor="end" fontSize={7} fontFamily="monospace" fill="var(--muted-foreground)">
            {d}
          </text>
        ))}
        {HEAT_DAYS.map((_, d) =>
          Array.from({ length: W }, (_, w) => {
            const v = heat(d, w);
            const below = v * 100 < threshold;
            return (
              <rect
                key={`${d}-${w}`}
                x={pad + w * cell}
                y={18 + d * cell}
                width={cell - 2}
                height={cell - 2}
                rx={3}
                fill={below ? "var(--muted)" : "var(--chart-1)"}
                opacity={below ? 0.5 : 0.25 + v * 0.75}
                onMouseEnter={() => setHover(`${HEAT_DAYS[d]} W${w + 1}: ${Math.round(v * 100)}%`)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${HEAT_DAYS[d]} W${w + 1}: ${Math.round(v * 100)}%`}</title>
              </rect>
            );
          })
        )}
      </svg>
    </Frame>
  );
}

export const HeatmapStory: Story = { name: "Heatmap", render: () => <InteractiveHeatmap /> };

// ---------------------------------------------------------------------------
// 8. Dual axis
// ---------------------------------------------------------------------------
const COMBO = Array.from({ length: 12 }, (_, i) => ({
  month: MONTH_NAMES[i],
  revenue: Math.round(40 + 18 * Math.sin(i / 1.9) + i * 2.4),
  users: Math.round(300 + 90 * Math.sin(i / 2.4 + 1) + i * 18),
  conversion: Math.round((2 + 0.8 * Math.sin(i / 1.6 + 2) + i * 0.09) * 10) / 10,
}));

const comboConfig = {
  revenue: { label: "Revenue ($k)", color: "var(--chart-1)" },
  users: { label: "Active users", color: "var(--chart-2)" },
  conversion: { label: "Conversion (%)", color: "var(--chart-3)" },
} satisfies ChartConfig;

function InteractiveDualAxis() {
  const [on, setOn] = React.useState<Record<string, boolean>>({ revenue: true, users: false, conversion: true });
  return (
    <Frame title="Dual axis" description="Revenue as bars on the left scale; users and conversion as lines on the right.">
      <Controls>
        <span className="flex items-center gap-1.5">
          <SeriesPill label="Revenue" color={TOKEN[0]} active={on.revenue} onClick={() => setOn((s) => ({ ...s, revenue: !s.revenue }))} />
          <SeriesPill label="Users" color={TOKEN[1]} active={on.users} onClick={() => setOn((s) => ({ ...s, users: !s.users }))} />
          <SeriesPill label="Conversion" color={TOKEN[2]} active={on.conversion} onClick={() => setOn((s) => ({ ...s, conversion: !s.conversion }))} />
        </span>
      </Controls>
      <ChartContainer config={comboConfig} className="h-64 w-full">
        <ComposedChart data={COMBO} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis yAxisId="left" tickLine={false} axisLine={false} width={32} />
          <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={38} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {on.revenue && <Bar yAxisId="left" dataKey="revenue" fill="var(--chart-1)" radius={4} />}
          {on.users && <Line yAxisId="right" dataKey="users" type="monotone" stroke="var(--chart-2)" strokeWidth={2} dot={false} />}
          {on.conversion && (
            <Line yAxisId="right" dataKey="conversion" type="monotone" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="4 3" dot={false} />
          )}
        </ComposedChart>
      </ChartContainer>
    </Frame>
  );
}

export const DualAxisStory: Story = { name: "Dual Axis", render: () => <InteractiveDualAxis /> };

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------
export const LineControlsInteraction: Story = {
  name: "Interaction: line controls",
  render: () => <InteractiveLine />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "6M" }));
    await expect(canvas.getByRole("button", { name: "6M" })).toHaveAttribute("aria-pressed", "true");
    const mobile = canvas.getByRole("button", { name: "Mobile" });
    await userEvent.click(mobile);
    await expect(mobile).toHaveAttribute("aria-pressed", "false");
  },
};

export const BarModeInteraction: Story = {
  name: "Interaction: bar stacking",
  render: () => <InteractiveBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stacked = canvas.getByRole("button", { name: "stacked" });
    await userEvent.click(stacked);
    await expect(stacked).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByLabelText("Sort by value"));
  },
};
