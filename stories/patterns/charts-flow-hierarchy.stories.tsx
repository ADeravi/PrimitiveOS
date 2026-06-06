"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Sankey,
  Treemap,
  XAxis,
} from "recharts";
import { hierarchy, partition, type HierarchyRectangularNode } from "d3-hierarchy";
import {
  arc,
  area,
  curveBasis,
  stack,
  stackOffsetWiggle,
  stackOrderInsideOut,
} from "d3-shape";
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
  title: "Patterns/Charts Flow & Hierarchy",
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Part-to-whole and flow chart families: treemap, sankey, funnel, waterfall, sunburst, icicle and streamgraph. recharts where it has the primitive, d3 partition/stack math with token-themed SVG where it doesn't.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const GROUP_COLOR = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

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

// Entrance/hover styles driven by the motion tokens.
function VizStyles() {
  return (
    <style>{`
      @keyframes viz-fade { from { opacity: 0; } }
      .viz-fade { animation: viz-fade var(--duration-slow) var(--ease-enter) backwards; }
      .viz-hit { transition: opacity var(--duration-fast) var(--ease-standard), filter var(--duration-fast) var(--ease-standard); cursor: default; }
      .viz-hit:hover { opacity: 1 !important; filter: brightness(1.15); }
      @media (prefers-reduced-motion: reduce) {
        .viz-fade { animation: none; }
      }
    `}</style>
  );
}

// ---------------------------------------------------------------------------
// Treemap (recharts, custom token-filled cells)
// ---------------------------------------------------------------------------
const TREEMAP_DATA = [
  { name: "Platform", size: 34, fill: "var(--chart-1)" },
  { name: "Mobile", size: 22, fill: "var(--chart-2)" },
  { name: "Integrations", size: 16, fill: "var(--chart-3)" },
  { name: "Docs", size: 12, fill: "var(--chart-4)" },
  { name: "CLI", size: 9, fill: "var(--chart-5)" },
  { name: "Misc", size: 7, fill: "var(--chart-1)" },
];

function TreemapCell(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  fill?: string;
  depth?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name, fill, depth } = props;
  if (!depth) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={fill ?? "var(--chart-1)"}
        stroke="var(--background)"
        strokeWidth={2}
      />
      {width > 52 && height > 26 && (
        <text x={x + 8} y={y + 18} fontSize={11} fontWeight={600} fill="var(--background)">
          {name}
        </text>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Sankey (recharts)
// ---------------------------------------------------------------------------
const SANKEY_DATA = {
  nodes: [
    { name: "Visits" },
    { name: "Signups" },
    { name: "Bounced" },
    { name: "Free" },
    { name: "Pro" },
    { name: "Retained" },
    { name: "Churned" },
  ],
  links: [
    { source: 0, target: 1, value: 60 },
    { source: 0, target: 2, value: 40 },
    { source: 1, target: 3, value: 42 },
    { source: 1, target: 4, value: 18 },
    { source: 3, target: 5, value: 30 },
    { source: 3, target: 6, value: 12 },
    { source: 4, target: 5, value: 15 },
    { source: 4, target: 6, value: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Funnel (recharts)
// ---------------------------------------------------------------------------
const FUNNEL_DATA = [
  { name: "Visited", value: 1000, fill: "var(--chart-1)" },
  { name: "Signed up", value: 620, fill: "var(--chart-2)" },
  { name: "Activated", value: 410, fill: "var(--chart-3)" },
  { name: "Subscribed", value: 190, fill: "var(--chart-4)" },
  { name: "Renewed", value: 120, fill: "var(--chart-5)" },
];

// ---------------------------------------------------------------------------
// Waterfall (recharts stacked-bar trick)
// ---------------------------------------------------------------------------
const WATERFALL = [
  { name: "Q1", base: 0, delta: 40, kind: "total" },
  { name: "Mkt", base: 40, delta: 12, kind: "up" },
  { name: "Ops", base: 47, delta: 5, kind: "down" },
  { name: "Sales", base: 47, delta: 18, kind: "up" },
  { name: "Refunds", base: 57, delta: 8, kind: "down" },
  { name: "Q2", base: 0, delta: 57, kind: "total" },
];

const waterfallFill = (kind: string) =>
  kind === "total" ? "var(--chart-1)" : kind === "up" ? "var(--chart-2)" : "var(--chart-5)";

const waterfallConfig = {
  delta: { label: "Change ($k)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// Sunburst + Icicle (d3 partition)
// ---------------------------------------------------------------------------
type SunDatum = { id: string; size?: number; children?: SunDatum[] };

const SUN_TREE: SunDatum = {
  id: "root",
  children: [
    {
      id: "Alpha",
      children: [
        { id: "A1", size: 9 },
        { id: "A2", size: 6 },
        { id: "A3", size: 4 },
      ],
    },
    {
      id: "Beta",
      children: [
        { id: "B1", size: 8 },
        { id: "B2", size: 5 },
        { id: "B3", size: 3 },
        { id: "B4", size: 2 },
      ],
    },
    {
      id: "Gamma",
      children: [
        { id: "C1", size: 7 },
        { id: "C2", size: 4 },
      ],
    },
  ],
};

function groupIndex(n: HierarchyRectangularNode<SunDatum>) {
  const a = n.ancestors();
  const top = a[a.length - 2] ?? n;
  return Math.max(0, (top.parent?.children?.indexOf(top) ?? 0) % 3);
}

function Sunburst() {
  const R = 100;
  const root = hierarchy<SunDatum>(SUN_TREE).sum((d) => d.size ?? 0);
  partition<SunDatum>().size([2 * Math.PI, R * R])(root);
  const arcGen = arc<HierarchyRectangularNode<SunDatum>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(0.012)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1.5);
  const nodes = (root.descendants() as HierarchyRectangularNode<SunDatum>[]).filter(
    (d) => d.depth > 0
  );
  return (
    <svg viewBox="-105 -105 210 210" className="w-full max-h-64 mx-auto">
      {nodes.map((n, i) => (
        <path
          key={n.data.id}
          className="viz-fade viz-hit"
          style={{ animationDelay: `${n.depth * 160 + i * 20}ms` }}
          d={arcGen(n) ?? ""}
          fill={GROUP_COLOR[groupIndex(n)]}
          opacity={n.depth === 1 ? 0.95 : 0.55}
        >
          <title>{`${n.data.id}: ${n.value}`}</title>
        </path>
      ))}
      {nodes
        .filter((n) => n.depth === 1)
        .map((n) => {
          const mid = (n.x0 + n.x1) / 2 - Math.PI / 2;
          const r = (Math.sqrt(n.y0) + Math.sqrt(n.y1)) / 2;
          return (
            <text
              key={`l-${n.data.id}`}
              x={Math.cos(mid) * r}
              y={Math.sin(mid) * r + 3}
              textAnchor="middle"
              fontSize={8}
              fontWeight={600}
              fill="var(--background)"
            >
              {n.data.id}
            </text>
          );
        })}
    </svg>
  );
}

function Icicle() {
  const W = 420;
  const H = 150;
  const root = hierarchy<SunDatum>(SUN_TREE).sum((d) => d.size ?? 0);
  partition<SunDatum>().size([W, H])(root);
  const nodes = (root.descendants() as HierarchyRectangularNode<SunDatum>[]).filter(
    (d) => d.depth > 0
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {nodes.map((n, i) => (
        <g key={n.data.id} className="viz-fade viz-hit" style={{ animationDelay: `${n.depth * 160 + i * 20}ms` }}>
          <title>{`${n.data.id}: ${n.value}`}</title>
          <rect
            x={n.x0 + 1}
            y={n.y0 + 1}
            width={Math.max(0, n.x1 - n.x0 - 2)}
            height={Math.max(0, n.y1 - n.y0 - 2)}
            rx={3}
            fill={GROUP_COLOR[groupIndex(n)]}
            opacity={n.depth === 1 ? 0.95 : 0.55}
          />
          {n.x1 - n.x0 > 34 && (
            <text
              x={(n.x0 + n.x1) / 2}
              y={(n.y0 + n.y1) / 2 + 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              fill="var(--background)"
            >
              {n.data.id}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Streamgraph (d3 stack, wiggle offset)
// ---------------------------------------------------------------------------
const STREAM_KEYS = ["s1", "s2", "s3", "s4"] as const;
const STREAM_DATA = Array.from({ length: 13 }, (_, i) => ({
  i,
  s1: 4 + 3 * Math.sin(i / 1.7) + 3,
  s2: 3 + 2.4 * Math.sin(i / 2.3 + 1.4) + 2.6,
  s3: 2.5 + 2 * Math.sin(i / 1.4 + 2.8) + 2.2,
  s4: 2 + 1.6 * Math.sin(i / 2.0 + 4.1) + 1.8,
}));

function Streamgraph() {
  const W = 420;
  const H = 160;
  const layers = stack<(typeof STREAM_DATA)[number]>()
    .keys(STREAM_KEYS as unknown as string[])
    .offset(stackOffsetWiggle)
    .order(stackOrderInsideOut)(STREAM_DATA);
  let min = Infinity;
  let max = -Infinity;
  layers.forEach((l) =>
    l.forEach(([a, b]) => {
      min = Math.min(min, a);
      max = Math.max(max, b);
    })
  );
  const x = (i: number) => (i / (STREAM_DATA.length - 1)) * W;
  const y = (v: number) => ((v - min) / (max - min)) * (H - 8) + 4;
  const areaGen = area<[number, number]>()
    .x((_, i) => x(i))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(curveBasis);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {layers.map((l, i) => (
        <path
          key={l.key}
          className="viz-fade viz-hit"
          style={{ animationDelay: `${i * 130}ms` }}
          d={areaGen(l as unknown as [number, number][]) ?? ""}
          fill={GROUP_COLOR[i % 5]}
          opacity={0.8}
        >
          <title>{`Series ${l.key}`}</title>
        </path>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export const FlowHierarchyGallery: Story = {
  name: "Flow & Hierarchy Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <VizStyles />
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Charts — Flow & Hierarchy</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Part-to-whole and flow families. Series colours come from the chart tokens;
            switch the Design Layer to re-theme everything.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title="Treemap" description="Area encodes share; labels on large tiles only.">
            <ChartContainer config={{}} className="h-56 w-full">
              <Treemap
                data={TREEMAP_DATA}
                dataKey="size"
                               content={<TreemapCell />}
              />
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Sankey" description="Acquisition flow from visit to retention.">
            <ChartContainer config={{}} className="h-56 w-full">
              <Sankey
                data={SANKEY_DATA}
                nodePadding={28}
                margin={{ top: 8, right: 70, bottom: 8, left: 8 }}
                node={{ fill: "var(--chart-1)", stroke: "none" }}
                link={{ stroke: "var(--chart-2)", strokeOpacity: 0.35 }}
              />
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Funnel" description="Stage conversion, width = volume.">
            <ChartContainer config={{}} className="h-56 w-full">
              <FunnelChart margin={{ left: 8, right: 90 }}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Funnel dataKey="value" data={FUNNEL_DATA}>
                  <LabelList position="right" dataKey="name" className="fill-foreground" fontSize={11} />
                </Funnel>
              </FunnelChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Waterfall" description="Running total decomposed into gains and losses.">
            <ChartContainer config={waterfallConfig} className="h-56 w-full">
              <BarChart data={WATERFALL}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <Bar dataKey="base" stackId="w" fill="transparent" />
                <Bar dataKey="delta" stackId="w" radius={4}>
                  {WATERFALL.map((d) => (
                    <Cell key={d.name} fill={waterfallFill(d.kind)} />
                  ))}
                  <LabelList dataKey="delta" position="top" className="fill-muted-foreground" fontSize={10} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Sunburst" description="The radial sibling of the treemap — depth = ring.">
            <Sunburst />
          </ChartCard>

          <ChartCard title="Icicle" description="The same partition laid out linearly.">
            <Icicle />
          </ChartCard>

          <ChartCard title="Streamgraph" description="Stacked series on a wiggle baseline — themes over time.">
            <Streamgraph />
          </ChartCard>
        </div>
      </div>
    </div>
  ),
};
