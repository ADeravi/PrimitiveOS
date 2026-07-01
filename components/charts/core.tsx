"use client";
import * as React from "react";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterPill } from "@/components/ui/filter-pill";
import { ChartCard, ChartControls } from "./chart-card";

const TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// ---------------------------------------------------------------------------
// Default demo data (deterministic)
// ---------------------------------------------------------------------------
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type MonthlySeriesDatum = { month: string; desktop: number; mobile: number; tablet: number };

const MONTHS24: MonthlySeriesDatum[] = Array.from({ length: 24 }, (_, i) => ({
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

// General data contract for the categorical-x / multi-series charts (Line, Area):
// rows of data + which field is the x-axis + which numeric series to plot. All
// default to the demo above, so existing prop-less usage is unchanged.
export type SeriesDatum = Record<string, string | number>;
export interface SeriesSpec { key: string; label?: string; color?: string }
export interface SeriesChartProps {
  data?: SeriesDatum[];
  xKey?: string;
  series?: readonly SeriesSpec[];
  title?: string;
  description?: string;
}

const colorAt = (s: SeriesSpec, i: number) => s.color ?? `var(--chart-${(i % 5) + 1})`;
const configFromSeries = (series: readonly SeriesSpec[]): ChartConfig =>
  Object.fromEntries(series.map((s, i) => [s.key, { label: s.label ?? s.key, color: colorAt(s, i) }])) as ChartConfig;

function useSeriesToggle(keys: string[]) {
  const [on, setOn] = React.useState<Record<string, boolean>>(() => Object.fromEntries(keys.map((k) => [k, true])));
  const toggle = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));
  return { on, toggle };
}

const RANGES = ["6M", "12M", "24M"] as const;

// ---------------------------------------------------------------------------
// Line
// ---------------------------------------------------------------------------
export interface ChartLineProps {
  data?: MonthlySeriesDatum[];
  title?: string;
  description?: string;
}

export function ChartLine({
  data = MONTHS24,
  xKey = "month",
  series = SERIES,
  title = "Line",
  description = "Range, curve interpolation, point markers and per-series visibility.",
}: SeriesChartProps) {
  const { on, toggle } = useSeriesToggle(series.map((s) => s.key));
  const cfg = configFromSeries(series);
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("12M");
  const [curve, setCurve] = React.useState<"smooth" | "linear" | "step">("smooth");
  const [dots, setDots] = React.useState(false);
  const type = curve === "smooth" ? "monotone" : curve === "linear" ? "linear" : "stepAfter";
  const sliced = data.slice(range === "6M" ? -6 : range === "12M" ? -12 : 0);
  return (
    <ChartCard title={title} description={description} exportData={sliced}>
      <ChartControls>
        <SegmentedControl options={RANGES} value={range} onChange={setRange} ariaLabel="Range" />
        <SegmentedControl options={["smooth", "linear", "step"] as const} value={curve} onChange={setCurve} ariaLabel="Curve" />
        <span className="flex items-center gap-2">
          <Switch id="line-dots" checked={dots} onCheckedChange={setDots} />
          <Label htmlFor="line-dots" className="text-xs text-muted-foreground">Dots</Label>
        </span>
        <span className="flex items-center gap-1.5">
          {series.map((s, i) => (
            <FilterPill key={s.key} label={s.label ?? s.key} color={colorAt(s, i)} active={on[s.key]} onClick={() => toggle(s.key)} />
          ))}
        </span>
      </ChartControls>
      <ChartContainer config={cfg} className="h-64 w-full">
        <LineChart data={sliced} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {series.map((s, i) => (on[s.key] ? (
            <Line key={s.key} dataKey={s.key} type={type} stroke={colorAt(s, i)} strokeWidth={2} dot={dots} />
          ) : null))}
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Area
// ---------------------------------------------------------------------------
export function ChartArea({
  data = MONTHS24,
  xKey = "month",
  series = SERIES,
  title = "Area",
  description = "Stacked, overlapped or 100% normalised; toggle series in and out.",
}: SeriesChartProps) {
  const { on, toggle } = useSeriesToggle(series.map((s) => s.key));
  const cfg = configFromSeries(series);
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("12M");
  const [mode, setMode] = React.useState<"stacked" | "overlap" | "100%">("stacked");
  const stackId = mode === "overlap" ? undefined : "a";
  const sliced = data.slice(range === "6M" ? -6 : range === "12M" ? -12 : 0);
  return (
    <ChartCard title={title} description={description} exportData={sliced}>
      <ChartControls>
        <SegmentedControl options={RANGES} value={range} onChange={setRange} ariaLabel="Range" />
        <SegmentedControl options={["stacked", "overlap", "100%"] as const} value={mode} onChange={setMode} ariaLabel="Mode" />
        <span className="flex items-center gap-1.5">
          {series.map((s, i) => (
            <FilterPill key={s.key} label={s.label ?? s.key} color={colorAt(s, i)} active={on[s.key]} onClick={() => toggle(s.key)} />
          ))}
        </span>
      </ChartControls>
      <ChartContainer config={cfg} className="h-64 w-full">
        <AreaChart data={sliced} stackOffset={mode === "100%" ? "expand" : "none"} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => (mode === "100%" ? `${Math.round(v * 100)}%` : `${v}`)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {series.map((s, i) => (on[s.key] ? (
            <Area
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stackId={stackId}
              stroke={colorAt(s, i)}
              fill={colorAt(s, i)}
              fillOpacity={mode === "overlap" ? 0.25 : 0.4}
            />
          ) : null))}
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Bar
// ---------------------------------------------------------------------------
export type RegionDatum = { region: string; current: number; previous: number };

const REGION_DATA: RegionDatum[] = [
  { region: "AMER", current: 420, previous: 360 },
  { region: "EMEA", current: 360, previous: 390 },
  { region: "APAC", current: 290, previous: 215 },
  { region: "LATAM", current: 140, previous: 110 },
  { region: "MEA", current: 90, previous: 95 },
];

const REGION_SERIES: SeriesSpec[] = [
  { key: "previous", label: "FY25", color: "var(--chart-3)" },
  { key: "current", label: "FY26", color: "var(--chart-1)" },
];

export function ChartBar({
  data = REGION_DATA,
  xKey = "region",
  series = REGION_SERIES,
  title = "Bar",
  description = "Grouped vs stacked, sorted vs source order, vertical vs horizontal.",
}: SeriesChartProps) {
  const [mode, setMode] = React.useState<"grouped" | "stacked">("grouped");
  const [sorted, setSorted] = React.useState(false);
  const [horizontal, setHorizontal] = React.useState(false);
  const sortKey = series[series.length - 1]?.key;
  const rows = sorted && sortKey
    ? [...data].sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]))
    : data;
  return (
    <ChartCard title={title} description={description} exportData={rows}>
      <ChartControls>
        <SegmentedControl options={["grouped", "stacked"] as const} value={mode} onChange={setMode} ariaLabel="Mode" />
        <span className="flex items-center gap-2">
          <Switch id="bar-sort" checked={sorted} onCheckedChange={setSorted} />
          <Label htmlFor="bar-sort" className="text-xs text-muted-foreground">Sort by value</Label>
        </span>
        <span className="flex items-center gap-2">
          <Switch id="bar-horiz" checked={horizontal} onCheckedChange={setHorizontal} />
          <Label htmlFor="bar-horiz" className="text-xs text-muted-foreground">Horizontal</Label>
        </span>
      </ChartControls>
      <ChartContainer config={configFromSeries(series)} className="h-64 w-full">
        <BarChart data={rows} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <YAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} width={56} />
              <XAxis type="number" tickLine={false} axisLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={36} />
            </>
          )}
          <ChartTooltip content={<ChartTooltipContent />} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} stackId={mode === "stacked" ? "s" : undefined} fill={colorAt(s, i)} radius={3} />
          ))}
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Donut
// ---------------------------------------------------------------------------
export type SliceDatum = { key: string; label: string; value: number };

const DONUT_PARTS: SliceDatum[] = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 187 },
  { key: "edge", label: "Edge", value: 173 },
  { key: "other", label: "Other", value: 90 },
];

export function ChartDonut({
  data = DONUT_PARTS,
  title = "Donut",
  description = "Toggle slices and adjust the inner radius from ring to pie.",
  unit = "visitors",
}: {
  data?: SliceDatum[];
  title?: string;
  description?: string;
  unit?: string;
}) {
  const [on, setOn] = React.useState<Record<string, boolean>>(
    Object.fromEntries(data.map((p) => [p.key, true]))
  );
  const [inner, setInner] = React.useState(55);
  const config = Object.fromEntries(
    data.map((p, i) => [p.key, { label: p.label, color: `var(--chart-${(i % 5) + 1})` }])
  ) as ChartConfig;
  const visible = data
    .filter((p) => on[p.key])
    .map((p) => ({ ...p, fill: TOKEN[data.indexOf(p) % 5] }));
  const total = visible.reduce((a, p) => a + p.value, 0);
  return (
    <ChartCard title={title} description={description} exportData={visible}>
      <ChartControls>
        <span className="flex items-center gap-1.5">
          {data.map((p, i) => (
            <FilterPill
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
      </ChartControls>
      <div className="relative">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-64">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={visible} dataKey="value" nameKey="label" innerRadius={inner} strokeWidth={2} />
          </PieChart>
        </ChartContainer>
        {inner >= 35 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Radar
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

export function ChartRadar({
  title = "Radar",
  description = "Compare up to three plans; tune the fill opacity for overlap legibility.",
}: {
  title?: string;
  description?: string;
}) {
  const [on, setOn] = React.useState<Record<string, boolean>>({ a: true, b: true, c: false });
  const [opacity, setOpacity] = React.useState(45);
  return (
    <ChartCard title={title} description={description} exportData={RADAR_DATA}>
      <ChartControls>
        <span className="flex items-center gap-1.5">
          {PLANS.map((p) => (
            <FilterPill
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
      </ChartControls>
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
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Scatter / bubble
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

export function ChartScatter({
  title = "Scatter / Bubble",
  description = "Toggle series, switch bubble sizing on or off, scale the size range.",
}: {
  title?: string;
  description?: string;
}) {
  const [on, setOn] = React.useState<Record<string, boolean>>({ a: true, b: true });
  const [bubble, setBubble] = React.useState(true);
  const [size, setSize] = React.useState(160);
  return (
    <ChartCard title={title} description={description} exportData={[...SCATTER[0], ...SCATTER[1]]}>
      <ChartControls>
        <span className="flex items-center gap-1.5">
          <FilterPill label="Plan A" color={TOKEN[0]} active={on.a} onClick={() => setOn((s) => ({ ...s, a: !s.a }))} />
          <FilterPill label="Plan B" color={TOKEN[2]} active={on.b} onClick={() => setOn((s) => ({ ...s, b: !s.b }))} />
        </span>
        <span className="flex items-center gap-2">
          <Switch id="sc-bubble" checked={bubble} onCheckedChange={setBubble} />
          <Label htmlFor="sc-bubble" className="text-xs text-muted-foreground">Bubble size</Label>
        </span>
        <span className="flex w-44 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Max {size}</Label>
          <Slider value={[size]} onValueChange={([v]) => setSize(v)} min={60} max={400} step={20} disabled={!bubble} />
        </span>
      </ChartControls>
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
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Heatmap
// ---------------------------------------------------------------------------
const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heat = (d: number, w: number) =>
  (Math.sin(d * 3.7 + w * 1.3) + Math.cos(d * 1.9 - w * 2.3) + 2) / 4;

export function ChartHeatmap({
  title = "Heatmap",
  description = "Adjust the visible window and filter low-intensity cells with the threshold.",
}: {
  title?: string;
  description?: string;
}) {
  const [weeks, setWeeks] = React.useState<"8" | "14" | "20">("14");
  const [threshold, setThreshold] = React.useState(0);
  const [hover, setHover] = React.useState<string | null>(null);
  const W = Number(weeks);
  const cell = 16;
  const pad = 30;
  const csv = HEAT_DAYS.flatMap((day, d) =>
    Array.from({ length: W }, (_, w) => ({ day, week: w + 1, value: Math.round(heat(d, w) * 100) }))
  );
  return (
    <ChartCard title={title} description={description} exportData={csv}>
      <ChartControls>
        <SegmentedControl options={["8", "14", "20"] as const} value={weeks} onChange={setWeeks} ariaLabel="Weeks" />
        <span className="flex w-52 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Min {threshold}%</Label>
          <Slider value={[threshold]} onValueChange={([v]) => setThreshold(v)} min={0} max={80} step={5} />
        </span>
        <span className="text-xs tabular-nums text-muted-foreground min-w-28">
          {hover ?? "hover a cell"}
        </span>
      </ChartControls>
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
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Dual axis
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

export function ChartDualAxis({
  title = "Dual axis",
  description = "Revenue as bars on the left scale; users and conversion as lines on the right.",
}: {
  title?: string;
  description?: string;
}) {
  const [on, setOn] = React.useState<Record<string, boolean>>({ revenue: true, users: false, conversion: true });
  return (
    <ChartCard title={title} description={description} exportData={COMBO}>
      <ChartControls>
        <span className="flex items-center gap-1.5">
          <FilterPill label="Revenue" color={TOKEN[0]} active={on.revenue} onClick={() => setOn((s) => ({ ...s, revenue: !s.revenue }))} />
          <FilterPill label="Users" color={TOKEN[1]} active={on.users} onClick={() => setOn((s) => ({ ...s, users: !s.users }))} />
          <FilterPill label="Conversion" color={TOKEN[2]} active={on.conversion} onClick={() => setOn((s) => ({ ...s, conversion: !s.conversion }))} />
        </span>
      </ChartControls>
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
    </ChartCard>
  );
}
