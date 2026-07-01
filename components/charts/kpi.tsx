"use client";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
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
import { ChartCard, ChartControls } from "./chart-card";

const TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// ---------------------------------------------------------------------------
// Gauge — slider-driven, functional-token status colours
// ---------------------------------------------------------------------------
export function ChartGauge({
  initialValue = 72,
  title = "Gauge",
  description = "Drag the slider — the arc recolours through the functional tokens.",
  unit = "health score",
}: {
  initialValue?: number;
  title?: string;
  description?: string;
  unit?: string;
}) {
  const [value, setValue] = React.useState(initialValue);
  const color = value < 40 ? "var(--destructive)" : value < 70 ? "var(--warning)" : "var(--success)";
  const status = value < 40 ? "critical" : value < 70 ? "at risk" : "healthy";
  return (
    <ChartCard title={title} description={description} exportData={[{ metric: unit, value, status }]}>
      <ChartControls>
        <span className="flex w-64 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Score {value}</Label>
          <Slider value={[value]} onValueChange={([v]) => setValue(v)} min={0} max={100} step={1} />
        </span>
        <span className="text-xs font-medium" style={{ color }}>{status}</span>
      </ChartControls>
      <div className="relative h-64">
        <ChartContainer config={{}} className="h-64 w-full">
          <RadialBarChart
            data={[{ name: "score", value }]}
            startAngle={210}
            endAngle={-30}
            innerRadius={86}
            outerRadius={108}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" fill={color} background={{ fill: "var(--muted)" }} cornerRadius={8} />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Bullet — movable target
// ---------------------------------------------------------------------------
export type BulletDatum = { label: string; value: number; bands: number[] };

const BULLETS: BulletDatum[] = [
  { label: "Revenue", value: 78, bands: [50, 75, 100] },
  { label: "NPS", value: 62, bands: [40, 60, 100] },
  { label: "Uptime", value: 96, bands: [90, 95, 100] },
];

export function ChartBullet({
  data = BULLETS,
  title = "Bullet",
  description = "Measure vs qualitative bands; move the shared target line.",
}: {
  data?: BulletDatum[];
  title?: string;
  description?: string;
}) {
  const [target, setTarget] = React.useState(85);
  const W = 560;
  const rowH = 48;
  const barH = 13;
  return (
    <ChartCard
      title={title}
      description={description}
      exportData={data.map((b) => ({ label: b.label, value: b.value, target }))}
    >
      <ChartControls>
        <span className="flex w-64 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Target {target}</Label>
          <Slider value={[target]} onValueChange={([v]) => setTarget(v)} min={20} max={100} step={1} />
        </span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${data.length * rowH}`} className="w-full">
        {data.map((b, i) => {
          const y = i * rowH + 16;
          const px = (v: number) => 76 + (v / 100) * (W - 90);
          const hit = b.value >= target;
          return (
            <g key={b.label}>
              <title>{`${b.label}: ${b.value} (target ${target})`}</title>
              <text x={68} y={y + barH - 2} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">
                {b.label}
              </text>
              {b.bands.map((band, j) => {
                const prev = j === 0 ? 0 : b.bands[j - 1];
                return (
                  <rect key={j} x={px(prev)} y={y} width={px(band) - px(prev)} height={barH} fill="var(--muted-foreground)" opacity={0.14 + j * 0.1} />
                );
              })}
              <rect x={px(0)} y={y + 3} width={px(b.value) - px(0)} height={barH - 6} rx={2} fill={hit ? "var(--success)" : "var(--chart-1)"} />
              <line x1={px(target)} x2={px(target)} y1={y - 4} y2={y + barH + 4} stroke="var(--foreground)" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Sparkline stat card — metric switcher
// ---------------------------------------------------------------------------
const SPARK = Array.from({ length: 20 }, (_, i) => ({
  i,
  sessions: Math.round(400 + 180 * Math.sin(i / 2.1) + i * 14),
  signups: Math.round(120 + 48 * Math.cos(i / 1.7) + i * 2.4),
  errors: Math.round((4 + 2 * Math.sin(i / 1.2 + 2) + (i % 5 === 0 ? 3 : 0)) * 10) / 10,
}));

export interface SparkMetric { key: string; label?: string; color?: string; kind?: "area" | "line" | "bar"; fmt?: (v: number) => string }

const SPARK_METRICS: SparkMetric[] = [
  { key: "sessions", label: "Sessions", color: TOKEN[0], kind: "area", fmt: (v) => `${(v / 1000).toFixed(1)}k` },
  { key: "signups", label: "Sign-ups", color: TOKEN[1], kind: "line", fmt: (v) => `${v}` },
  { key: "errors", label: "Errors", color: TOKEN[4], kind: "bar", fmt: (v) => `${v}%` },
];

export function ChartSparkline({
  data = SPARK,
  metrics = SPARK_METRICS,
  title = "Sparkline",
  description = "One stat card, several metrics — each with its own micro-chart idiom.",
}: {
  data?: Record<string, number>[];
  metrics?: SparkMetric[];
  title?: string;
  description?: string;
}) {
  const [metricKey, setMetricKey] = React.useState(metrics[0].key);
  const m = metrics.find((x) => x.key === metricKey) ?? metrics[0];
  const kind = m.kind ?? "line";
  const color = m.color ?? "var(--chart-1)";
  const fmt = m.fmt ?? ((v: number) => `${v}`);
  const latest = Number(data[data.length - 1][m.key]);
  const first = Number(data[0][m.key]);
  const change = first ? Math.round(((latest - first) / first) * 100) : 0;
  const cfg = { [m.key]: { label: m.label ?? m.key, color } } as ChartConfig;
  return (
    <ChartCard title={title} description={description} exportData={data}>
      <ChartControls>
        <SegmentedControl options={metrics.map((x) => x.key)} value={metricKey} onChange={setMetricKey} ariaLabel="Metric" />
      </ChartControls>
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">{m.label ?? m.key}</p>
        <p className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-foreground">{fmt(latest)}</span>
          <span className="text-xs font-medium" style={{ color: change >= 0 ? "var(--success)" : "var(--destructive)" }}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        </p>
        <ChartContainer config={cfg} className="mt-2 h-16 w-full">
          {kind === "area" ? (
            <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Area dataKey={m.key} type="monotone" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={1.5} />
            </AreaChart>
          ) : kind === "line" ? (
            <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Line dataKey={m.key} type="monotone" stroke={color} dot={false} strokeWidth={1.5} />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey={m.key} fill={color} radius={1} />
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Brush & zoom — with smoothing window
// ---------------------------------------------------------------------------
const BRUSH_RAW = Array.from({ length: 64 }, (_, i) => ({
  x: `W${i + 1}`,
  v: Math.round(50 + 24 * Math.sin(i / 4.2) + 12 * Math.sin(i / 1.6) + i * 0.5),
}));

const brushConfig = {
  v: { label: "Raw", color: "var(--chart-1)" },
  smooth: { label: "Smoothed", color: "var(--chart-3)" },
} satisfies ChartConfig;

function smoothRows(data: { x: string; v: number }[], win: number) {
  return data.map((d, i) => {
    const lo = Math.max(0, i - Math.floor(win / 2));
    const hi = Math.min(data.length, i + Math.ceil(win / 2));
    const seg = data.slice(lo, hi);
    return { ...d, smooth: Math.round(seg.reduce((a, p) => a + p.v, 0) / seg.length) };
  });
}

export function ChartBrush({
  data = BRUSH_RAW,
  title = "Brush & Zoom",
  description = "Drag the brush handles to zoom; smooth the series with a moving average.",
}: {
  data?: { x: string; v: number }[];
  title?: string;
  description?: string;
}) {
  const [win, setWin] = React.useState<"1" | "5" | "9">("5");
  const [showRaw, setShowRaw] = React.useState(true);
  const rows = smoothRows(data, Number(win));
  return (
    <ChartCard title={title} description={description} exportData={rows}>
      <ChartControls>
        <SegmentedControl options={["1", "5", "9"] as const} value={win} onChange={setWin} ariaLabel="Smoothing window" />
        <span className="flex items-center gap-2">
          <Switch id="br-raw" checked={showRaw} onCheckedChange={setShowRaw} />
          <Label htmlFor="br-raw" className="text-xs text-muted-foreground">Show raw</Label>
        </span>
      </ChartControls>
      <ChartContainer config={brushConfig} className="h-64 w-full">
        <LineChart data={rows} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} width={30} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showRaw && <Line dataKey="v" type="monotone" stroke="var(--chart-1)" strokeWidth={1.2} dot={false} opacity={0.5} />}
          <Line dataKey="smooth" type="monotone" stroke="var(--chart-3)" strokeWidth={2.2} dot={false} />
          <Brush dataKey="x" height={20} travellerWidth={8} stroke="var(--chart-1)" fill="var(--muted)" />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Candlestick — adjustable session count + hover readout
// ---------------------------------------------------------------------------
function makeCandles(n: number) {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let prev = 100;
  for (let i = 0; i < n; i++) {
    const o = prev;
    const c = o + 7 * Math.sin(i / 1.3 + 0.7) + 2.5 * Math.cos(i / 0.7);
    const h = Math.max(o, c) + 2 + 2 * Math.abs(Math.sin(i));
    const l = Math.min(o, c) - 2 - 2 * Math.abs(Math.cos(i * 1.7));
    out.push({ o, c, h, l });
    prev = c;
  }
  return out;
}

export interface Candle { o: number; c: number; h: number; l: number }

export function ChartCandlestick({
  data = makeCandles(30),
  title = "Candlestick",
  description = "OHLC sessions — change the window length and hover for the readout.",
}: {
  data?: Candle[];
  title?: string;
  description?: string;
}) {
  const [count, setCount] = React.useState<"12" | "18" | "30">("18");
  const [hover, setHover] = React.useState<string | null>(null);
  const candles = data.slice(0, Number(count));
  const W = 560;
  const H = 210;
  const min = Math.min(...candles.map((d) => d.l));
  const max = Math.max(...candles.map((d) => d.h));
  const y = (v: number) => H - 8 - ((v - min) / (max - min)) * (H - 16);
  const step = W / candles.length;
  return (
    <ChartCard
      title={title}
      description={description}
      exportData={candles.map((d, i) => ({ session: i + 1, open: d.o.toFixed(2), high: d.h.toFixed(2), low: d.l.toFixed(2), close: d.c.toFixed(2) }))}
    >
      <ChartControls>
        <SegmentedControl options={["12", "18", "30"] as const} value={count} onChange={setCount} ariaLabel="Sessions" />
        <span className="font-mono text-xs text-muted-foreground min-w-56">{hover ?? "hover a candle"}</span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {candles.map((d, i) => {
          const cx = i * step + step / 2;
          const up = d.c >= d.o;
          const color = up ? "var(--success)" : "var(--destructive)";
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(`#${i + 1}  O ${d.o.toFixed(1)}  H ${d.h.toFixed(1)}  L ${d.l.toFixed(1)}  C ${d.c.toFixed(1)}`)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`O ${d.o.toFixed(1)}  H ${d.h.toFixed(1)}  L ${d.l.toFixed(1)}  C ${d.c.toFixed(1)}`}</title>
              <line x1={cx} x2={cx} y1={y(d.h)} y2={y(d.l)} stroke={color} strokeWidth={1.2} />
              <rect
                x={cx - step * 0.28}
                y={y(Math.max(d.o, d.c))}
                width={step * 0.56}
                height={Math.max(2, Math.abs(y(d.o) - y(d.c)))}
                rx={1.5}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}
