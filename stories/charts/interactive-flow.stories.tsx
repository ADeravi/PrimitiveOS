"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
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
  stackOffsetExpand,
  stackOffsetNone,
  stackOffsetSilhouette,
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const meta: Meta = {
  title: "Charts/Interactive/Flow & Hierarchy",
  parameters: {
    layout: "centered",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Interactive flow and part-to-whole charts: treemap with small-tile merging, sankey with layout controls, funnel with conversion labels, waterfall with period switching, streamgraph with selectable baselines and a sunburst with group focus. All colour comes from the --chart-* tokens.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// ---------------------------------------------------------------------------
// Shared controls
// ---------------------------------------------------------------------------
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

function Pill({
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
      <span className="size-2 rounded-full" style={{ background: color, opacity: active ? 1 : 0.4 }} />
      {label}
    </button>
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

// ---------------------------------------------------------------------------
// 1. Treemap — merge tiles below a share threshold into "Other"
// ---------------------------------------------------------------------------
const TREE_PARTS = [
  { name: "Platform", size: 34 },
  { name: "Mobile", size: 22 },
  { name: "Integrations", size: 16 },
  { name: "Docs", size: 12 },
  { name: "CLI", size: 9 },
  { name: "SDKs", size: 4 },
  { name: "Misc", size: 3 },
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
      <rect x={x} y={y} width={width} height={height} rx={4} fill={fill ?? TOKEN[0]} stroke="var(--background)" strokeWidth={2} />
      {width > 52 && height > 26 && (
        <text x={x + 8} y={y + 18} fontSize={11} fontWeight={600} fill="var(--background)">
          {name}
        </text>
      )}
    </g>
  );
}

function InteractiveTreemap() {
  const [minShare, setMinShare] = React.useState(0);
  const total = TREE_PARTS.reduce((a, p) => a + p.size, 0);
  const keep = TREE_PARTS.filter((p) => (p.size / total) * 100 >= minShare);
  const merged = TREE_PARTS.filter((p) => (p.size / total) * 100 < minShare);
  const data = [
    ...keep.map((p, i) => ({ ...p, fill: TOKEN[i % 5] })),
    ...(merged.length
      ? [{ name: "Other", size: merged.reduce((a, p) => a + p.size, 0), fill: "var(--muted-foreground)" }]
      : []),
  ];
  return (
    <Frame title="Treemap" description="Slide the threshold to merge small tiles into an honest 'Other'.">
      <Controls>
        <span className="flex w-56 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Min share {minShare}%</Label>
          <Slider value={[minShare]} onValueChange={([v]) => setMinShare(v)} min={0} max={15} step={1} />
        </span>
        <span className="text-xs text-muted-foreground">{data.length} tiles</span>
      </Controls>
      <ChartContainer config={{}} className="h-64 w-full">
        <Treemap data={data} dataKey="size" content={<TreemapCell />} />
      </ChartContainer>
    </Frame>
  );
}

export const TreemapStory: Story = { name: "Treemap", render: () => <InteractiveTreemap /> };

// ---------------------------------------------------------------------------
// 2. Sankey — node padding + link opacity
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

function InteractiveSankey() {
  const [padding, setPadding] = React.useState(28);
  const [opacity, setOpacity] = React.useState(35);
  return (
    <Frame title="Sankey" description="Tune node padding and link opacity to balance flow legibility.">
      <Controls>
        <span className="flex w-48 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Padding {padding}</Label>
          <Slider value={[padding]} onValueChange={([v]) => setPadding(v)} min={8} max={56} step={4} />
        </span>
        <span className="flex w-48 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Links {opacity}%</Label>
          <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={10} max={80} step={5} />
        </span>
      </Controls>
      <ChartContainer config={{}} className="h-64 w-full">
        <Sankey
          data={SANKEY_DATA}
          nodePadding={padding}
          margin={{ top: 8, right: 70, bottom: 8, left: 8 }}
          node={{ fill: "var(--chart-1)", stroke: "none" }}
          link={{ stroke: "var(--chart-2)", strokeOpacity: opacity / 100 }}
        />
      </ChartContainer>
    </Frame>
  );
}

export const SankeyStory: Story = { name: "Sankey", render: () => <InteractiveSankey /> };

// ---------------------------------------------------------------------------
// 3. Funnel — stage count + conversion labels
// ---------------------------------------------------------------------------
const FUNNEL_ALL = [
  { name: "Visited", value: 1000 },
  { name: "Signed up", value: 620 },
  { name: "Activated", value: 410 },
  { name: "Subscribed", value: 190 },
  { name: "Renewed", value: 120 },
];

function InteractiveFunnel() {
  const [stages, setStages] = React.useState<"3" | "4" | "5">("5");
  const [percent, setPercent] = React.useState(true);
  const data = FUNNEL_ALL.slice(0, Number(stages)).map((d, i) => ({
    ...d,
    fill: TOKEN[i % 5],
    label: percent ? `${d.name} · ${Math.round((d.value / FUNNEL_ALL[0].value) * 100)}%` : d.name,
  }));
  return (
    <Frame title="Funnel" description="Choose the number of stages and switch between names and conversion rates.">
      <Controls>
        <Seg options={["3", "4", "5"] as const} value={stages} onChange={setStages} ariaLabel="Stages" />
        <span className="flex items-center gap-2">
          <Switch id="fn-pct" checked={percent} onCheckedChange={setPercent} />
          <Label htmlFor="fn-pct" className="text-xs text-muted-foreground">Conversion %</Label>
        </span>
      </Controls>
      <ChartContainer config={{}} className="h-64 w-full">
        <FunnelChart margin={{ left: 8, right: 130 }}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Funnel dataKey="value" data={data}>
            <LabelList position="right" dataKey="label" className="fill-foreground" fontSize={11} />
          </Funnel>
        </FunnelChart>
      </ChartContainer>
    </Frame>
  );
}

export const FunnelStory: Story = { name: "Funnel", render: () => <InteractiveFunnel /> };

// ---------------------------------------------------------------------------
// 4. Waterfall — switch period
// ---------------------------------------------------------------------------
type WfStep = { name: string; delta: number; kind: "total" | "up" | "down" };

const WF_PERIODS: Record<string, WfStep[]> = {
  H1: [
    { name: "Q1", delta: 40, kind: "total" },
    { name: "Mkt", delta: 12, kind: "up" },
    { name: "Ops", delta: -5, kind: "down" },
    { name: "Sales", delta: 18, kind: "up" },
    { name: "Refunds", delta: -8, kind: "down" },
    { name: "Q2", delta: 0, kind: "total" },
  ],
  H2: [
    { name: "Q3", delta: 57, kind: "total" },
    { name: "Mkt", delta: 9, kind: "up" },
    { name: "Ops", delta: -11, kind: "down" },
    { name: "Sales", delta: 24, kind: "up" },
    { name: "Refunds", delta: -4, kind: "down" },
    { name: "Q4", delta: 0, kind: "total" },
  ],
};

const wfFill = (kind: string) => (kind === "total" ? TOKEN[0] : kind === "up" ? TOKEN[1] : TOKEN[4]);

const waterfallConfig = { delta: { label: "Change ($k)" } } satisfies ChartConfig;

function buildWaterfall(steps: WfStep[]) {
  let run = 0;
  return steps.map((s, i) => {
    if (s.kind === "total") {
      const value = i === 0 ? s.delta : run;
      if (i === 0) run = s.delta;
      return { name: s.name, base: 0, delta: value, kind: s.kind };
    }
    const base = s.delta >= 0 ? run : run + s.delta;
    run += s.delta;
    return { name: s.name, base, delta: Math.abs(s.delta), kind: s.kind };
  });
}

function InteractiveWaterfall() {
  const [period, setPeriod] = React.useState<"H1" | "H2">("H1");
  const data = buildWaterfall(WF_PERIODS[period]);
  return (
    <Frame title="Waterfall" description="Running total decomposed into gains and losses; switch the period.">
      <Controls>
        <Seg options={["H1", "H2"] as const} value={period} onChange={setPeriod} ariaLabel="Period" />
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: TOKEN[1] }} /> gain</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: TOKEN[4] }} /> loss</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: TOKEN[0] }} /> total</span>
        </span>
      </Controls>
      <ChartContainer config={waterfallConfig} className="h-64 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
          <Bar dataKey="base" stackId="w" fill="transparent" />
          <Bar dataKey="delta" stackId="w" radius={4}>
            {data.map((d) => (
              <Cell key={d.name} fill={wfFill(d.kind)} />
            ))}
            <LabelList dataKey="delta" position="top" className="fill-muted-foreground" fontSize={10} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Frame>
  );
}

export const WaterfallStory: Story = { name: "Waterfall", render: () => <InteractiveWaterfall /> };

// ---------------------------------------------------------------------------
// 5. Streamgraph — selectable baseline offset
// ---------------------------------------------------------------------------
const STREAM_KEYS = ["s1", "s2", "s3", "s4"] as const;
const STREAM_DATA = Array.from({ length: 13 }, (_, i) => ({
  i,
  s1: 4 + 3 * Math.sin(i / 1.7) + 3,
  s2: 3 + 2.4 * Math.sin(i / 2.3 + 1.4) + 2.6,
  s3: 2.5 + 2 * Math.sin(i / 1.4 + 2.8) + 2.2,
  s4: 2 + 1.6 * Math.sin(i / 2.0 + 4.1) + 1.8,
}));

const OFFSETS = {
  wiggle: stackOffsetWiggle,
  silhouette: stackOffsetSilhouette,
  stacked: stackOffsetNone,
  expand: stackOffsetExpand,
} as const;

function InteractiveStreamgraph() {
  const [mode, setMode] = React.useState<keyof typeof OFFSETS>("wiggle");
  const W = 560;
  const H = 200;
  const layers = stack<(typeof STREAM_DATA)[number]>()
    .keys(STREAM_KEYS as unknown as string[])
    .offset(OFFSETS[mode])
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
  const y = (v: number) => ((v - min) / (max - min || 1)) * (H - 8) + 4;
  const areaGen = area<[number, number]>()
    .x((_, i) => x(i))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(curveBasis);
  return (
    <Frame title="Streamgraph" description="The same stack on four baselines — wiggle, silhouette, zero and 100%.">
      <Controls>
        <Seg
          options={["wiggle", "silhouette", "stacked", "expand"] as const}
          value={mode}
          onChange={setMode}
          ariaLabel="Baseline"
        />
      </Controls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {layers.map((l, i) => (
          <path
            key={l.key}
            d={areaGen(l as unknown as [number, number][]) ?? ""}
            fill={TOKEN[i % 5]}
            opacity={0.8}
            style={{ transition: "d 400ms var(--ease-standard)" }}
          >
            <title>{`Series ${l.key}`}</title>
          </path>
        ))}
      </svg>
    </Frame>
  );
}

export const StreamgraphStory: Story = { name: "Streamgraph", render: () => <InteractiveStreamgraph /> };

// ---------------------------------------------------------------------------
// 6. Sunburst — group focus
// ---------------------------------------------------------------------------
type SunDatum = { id: string; size?: number; children?: SunDatum[] };

const SUN_TREE: SunDatum = {
  id: "root",
  children: [
    { id: "Alpha", children: [{ id: "A1", size: 9 }, { id: "A2", size: 6 }, { id: "A3", size: 4 }] },
    { id: "Beta", children: [{ id: "B1", size: 8 }, { id: "B2", size: 5 }, { id: "B3", size: 3 }, { id: "B4", size: 2 }] },
    { id: "Gamma", children: [{ id: "C1", size: 7 }, { id: "C2", size: 4 }] },
  ],
};

const SUN_GROUPS = ["Alpha", "Beta", "Gamma"];

function topGroup(n: HierarchyRectangularNode<SunDatum>) {
  const a = n.ancestors();
  return (a[a.length - 2] ?? n).data.id;
}

function InteractiveSunburst() {
  const [focus, setFocus] = React.useState<string | null>(null);
  const R = 100;
  const root = hierarchy<SunDatum>(SUN_TREE).sum((d) => d.size ?? 0);
  partition<SunDatum>().size([2 * Math.PI, R * R])(root);
  const arcGen = arc<HierarchyRectangularNode<SunDatum>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(0.012)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1.5);
  const nodes = (root.descendants() as HierarchyRectangularNode<SunDatum>[]).filter((d) => d.depth > 0);
  return (
    <Frame title="Sunburst" description="Click a group pill to focus its ring segment; click again to clear.">
      <Controls>
        <span className="flex items-center gap-1.5">
          {SUN_GROUPS.map((g, i) => (
            <Pill
              key={g}
              label={g}
              color={TOKEN[i % 5]}
              active={focus === null || focus === g}
              onClick={() => setFocus((f) => (f === g ? null : g))}
            />
          ))}
        </span>
      </Controls>
      <svg viewBox="-105 -105 210 210" className="mx-auto w-full max-h-64">
        {nodes.map((n) => {
          const g = topGroup(n);
          const gi = SUN_GROUPS.indexOf(g);
          const dim = focus !== null && focus !== g;
          return (
            <path
              key={n.data.id}
              d={arcGen(n) ?? ""}
              fill={TOKEN[gi % 5]}
              opacity={dim ? 0.12 : n.depth === 1 ? 0.95 : 0.55}
              style={{ transition: "opacity var(--duration-fast) var(--ease-standard)" }}
            >
              <title>{`${n.data.id}: ${n.value}`}</title>
            </path>
          );
        })}
      </svg>
    </Frame>
  );
}

export const SunburstStory: Story = { name: "Sunburst", render: () => <InteractiveSunburst /> };

// ---------------------------------------------------------------------------
// Interaction test
// ---------------------------------------------------------------------------
export const FunnelStagesInteraction: Story = {
  name: "Interaction: funnel stages",
  render: () => <InteractiveFunnel />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const three = canvas.getByRole("button", { name: "3" });
    await userEvent.click(three);
    await expect(three).toHaveAttribute("aria-pressed", "true");
  },
};
