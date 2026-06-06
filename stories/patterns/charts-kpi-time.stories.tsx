"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ComposedChart,
  ErrorBar,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
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

const meta: Meta = {
  title: "Patterns/Charts KPI & Time",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Single-value, uncertainty and time-series families: gauge, bullet, sparklines, confidence bands with error bars, brush-zoom, candlestick and a tag-style word cloud — all themed by the chart tokens.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

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
// Gauge
// ---------------------------------------------------------------------------
function Gauge({ value }: { value: number }) {
  return (
    <div className="relative h-56">
      <ChartContainer config={{}} className="h-56 w-full">
        <RadialBarChart
          data={[{ name: "score", value }]}
          startAngle={210}
          endAngle={-30}
          innerRadius={76}
          outerRadius={96}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            fill="var(--chart-1)"
            background={{ fill: "var(--muted)" }}
            cornerRadius={8}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">health score</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bullet chart (pure SVG)
// ---------------------------------------------------------------------------
const BULLETS = [
  { label: "Revenue", value: 78, target: 85, bands: [50, 75, 100] },
  { label: "NPS", value: 62, target: 55, bands: [40, 60, 100] },
  { label: "Uptime", value: 96, target: 99, bands: [90, 95, 100] },
];

function BulletChart() {
  const W = 420;
  const rowH = 44;
  const barH = 12;
  return (
    <svg viewBox={`0 0 ${W} ${BULLETS.length * rowH}`} className="w-full">
      {BULLETS.map((b, i) => {
        const y = i * rowH + 14;
        const px = (v: number) => 70 + (v / 100) * (W - 80);
        return (
          <g key={b.label}>
            <text x={62} y={y + barH - 2} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">
              {b.label}
            </text>
            {b.bands.map((band, j) => {
              const prev = j === 0 ? 0 : b.bands[j - 1];
              return (
                <rect
                  key={j}
                  x={px(prev)}
                  y={y}
                  width={px(band) - px(prev)}
                  height={barH}
                  fill="var(--muted-foreground)"
                  opacity={0.14 + j * 0.1}
                />
              );
            })}
            <rect x={px(0)} y={y + 3} width={px(b.value) - px(0)} height={barH - 6} rx={2} fill="var(--chart-1)" />
            <line
              x1={px(b.target)}
              x2={px(b.target)}
              y1={y - 3}
              y2={y + barH + 3}
              stroke="var(--foreground)"
              strokeWidth={2}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sparklines
// ---------------------------------------------------------------------------
const SPARK = Array.from({ length: 16 }, (_, i) => ({
  i,
  a: 40 + 18 * Math.sin(i / 2.1) + i * 1.4,
  b: 30 + 12 * Math.cos(i / 1.7) + i * 0.6,
  c: 20 + 10 * Math.sin(i / 1.2 + 2),
}));

const sparkConfig = { v: { label: "Value", color: "var(--chart-1)" } } satisfies ChartConfig;

function Sparkline({ dataKey, kind }: { dataKey: "a" | "b" | "c"; kind: "area" | "line" | "bar" }) {
  return (
    <ChartContainer config={sparkConfig} className="h-10 w-full">
      {kind === "area" ? (
        <AreaChart data={SPARK} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Area dataKey={dataKey} type="monotone" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} />
        </AreaChart>
      ) : kind === "line" ? (
        <LineChart data={SPARK} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Line dataKey={dataKey} type="monotone" stroke="var(--chart-2)" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </LineChart>
      ) : (
        <BarChart data={SPARK} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Bar dataKey={dataKey} fill="var(--chart-3)" radius={1} isAnimationActive={false} />
        </BarChart>
      )}
    </ChartContainer>
  );
}

function SparklineRow() {
  const items: { label: string; value: string; key: "a" | "b" | "c"; kind: "area" | "line" | "bar" }[] = [
    { label: "Sessions", value: "12.4k", key: "a", kind: "area" },
    { label: "Sign-ups", value: "1,205", key: "b", kind: "line" },
    { label: "Errors", value: "0.42%", key: "c", kind: "bar" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((s) => (
        <div key={s.label} className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{s.value}</p>
          <Sparkline dataKey={s.key} kind={s.kind} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confidence band + error bars
// ---------------------------------------------------------------------------
const BAND = Array.from({ length: 10 }, (_, i) => {
  const mean = 40 + 14 * Math.sin(i / 1.8) + i * 1.2;
  const e = 4 + 2.5 * Math.abs(Math.sin(i / 1.1));
  return { x: `T${i + 1}`, mean: Math.round(mean), range: [Math.round(mean - e * 1.8), Math.round(mean + e * 1.8)], err: Math.round(e) };
});

const bandConfig = {
  mean: { label: "Mean", color: "var(--chart-1)" },
  range: { label: "95% CI", color: "var(--chart-1)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Brush & zoom
// ---------------------------------------------------------------------------
const BRUSH_DATA = Array.from({ length: 48 }, (_, i) => ({
  x: `W${i + 1}`,
  v: Math.round(50 + 24 * Math.sin(i / 4.2) + 12 * Math.sin(i / 1.6) + i * 0.5),
}));

const brushConfig = { v: { label: "Value", color: "var(--chart-1)" } } satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Candlestick (pure SVG)
// ---------------------------------------------------------------------------
const CANDLES = (() => {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let prev = 100;
  for (let i = 0; i < 18; i++) {
    const o = prev;
    const c = o + 7 * Math.sin(i / 1.3 + 0.7) + 2.5 * Math.cos(i / 0.7);
    const h = Math.max(o, c) + 2 + 2 * Math.abs(Math.sin(i));
    const l = Math.min(o, c) - 2 - 2 * Math.abs(Math.cos(i * 1.7));
    out.push({ o, c, h, l });
    prev = c;
  }
  return out;
})();

function Candlestick() {
  const W = 420;
  const H = 180;
  const min = Math.min(...CANDLES.map((d) => d.l));
  const max = Math.max(...CANDLES.map((d) => d.h));
  const y = (v: number) => H - 8 - ((v - min) / (max - min)) * (H - 16);
  const step = W / CANDLES.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {CANDLES.map((d, i) => {
        const cx = i * step + step / 2;
        const up = d.c >= d.o;
        const color = up ? "var(--chart-2)" : "var(--chart-5)";
        return (
          <g key={i}>
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
  );
}

// ---------------------------------------------------------------------------
// Word cloud (tag style — deterministic, no layout solver)
// ---------------------------------------------------------------------------
const WORDS = [
  ["tokens", 5], ["components", 4], ["theming", 4], ["layout", 3], ["charts", 5],
  ["graphs", 3], ["a11y", 2], ["dark-mode", 3], ["radix", 2], ["tailwind", 4],
  ["storybook", 3], ["patterns", 2], ["oklch", 2], ["design", 4], ["system", 3],
  ["shadcn", 3], ["motion", 1], ["radius", 1], ["elevation", 2], ["spacing", 1],
] as [string, number][];

function WordCloud() {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 py-4">
      {WORDS.map(([w, weight], i) => (
        <span
          key={w}
          style={{
            fontSize: 11 + weight * 5,
            color: `var(--chart-${(i % 5) + 1})`,
            fontWeight: weight >= 4 ? 700 : 500,
            opacity: 0.55 + weight * 0.09,
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export const KpiTimeGallery: Story = {
  name: "KPI & Time Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Charts — KPI & Time</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Single values, uncertainty and time series. All colour from the chart tokens.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Gauge" description="Single bounded value on a 240° arc.">
            <Gauge value={72} />
          </ChartCard>

          <ChartCard title="Bullet" description="Measure vs target vs qualitative bands — three KPIs.">
            <div className="flex h-56 items-center">
              <BulletChart />
            </div>
          </ChartCard>

          <ChartCard title="Sparklines" description="Axis-free micro charts inside stat cards.">
            <div className="flex h-56 items-center">
              <SparklineRow />
            </div>
          </ChartCard>

          <ChartCard title="Confidence band" description="Mean with 95% band and per-point error bars.">
            <ChartContainer config={bandConfig} className="h-56 w-full">
              <ComposedChart data={BAND} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area dataKey="range" stroke="none" fill="var(--color-range)" fillOpacity={0.18} isAnimationActive={false} />
                <Line dataKey="mean" type="monotone" stroke="var(--color-mean)" strokeWidth={2} isAnimationActive={false}>
                  <ErrorBar dataKey="err" width={4} strokeWidth={1.2} stroke="var(--chart-3)" />
                </Line>
              </ComposedChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Brush & zoom" description="Drag the handles below the chart to zoom the range.">
            <ChartContainer config={brushConfig} className="h-56 w-full">
              <LineChart data={BRUSH_DATA} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line dataKey="v" type="monotone" stroke="var(--color-v)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Brush dataKey="x" height={20} travellerWidth={8} stroke="var(--chart-1)" fill="var(--muted)" />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Candlestick" description="OHLC sessions — up in teal, down in the fifth token.">
            <div className="flex h-56 items-center">
              <Candlestick />
            </div>
          </ChartCard>

          <ChartCard title="Word cloud" description="Tag-style weights — deterministic, no layout solver.">
            <div className="flex h-56 items-center">
              <WordCloud />
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  ),
};
