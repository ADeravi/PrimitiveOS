"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterPill } from "@/components/ui/filter-pill";
import { ChartCard, ChartControls } from "./chart-card";

const TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// ---------------------------------------------------------------------------
// Deterministic samples
// ---------------------------------------------------------------------------
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const normalish = (i: number, s: number) =>
  rnd(i, s) + rnd(i + 7, s * 2) + rnd(i + 13, s * 3) + rnd(i + 29, s * 5) - 2;
const sample = (n: number, seed: number, mu: number, sd: number) =>
  Array.from({ length: n }, (_, i) => mu + normalish(i, seed) * sd);

const SAMPLES = {
  Alpha: sample(80, 1, 50, 16),
  Beta: sample(80, 2, 58, 11),
  Gamma: sample(80, 3, 42, 19),
};
type GroupName = keyof typeof SAMPLES;
const GROUP_NAMES = Object.keys(SAMPLES) as GroupName[];

const quantile = (sorted: number[], p: number) => {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
};

const kde = (values: number[], bw: number) => (x: number) =>
  values.reduce((acc, v) => acc + Math.exp(-0.5 * ((x - v) / bw) ** 2), 0) /
  (values.length * bw * Math.sqrt(2 * Math.PI));

const sampleCsv = (g: GroupName) => SAMPLES[g].map((v, i) => ({ index: i, group: g, value: v.toFixed(2) }));

// ---------------------------------------------------------------------------
// Histogram — bin count slider + sample switcher
// ---------------------------------------------------------------------------
export function ChartHistogram({
  title = "Histogram",
  description = "Slide the bin count to see how binning changes the story.",
}: {
  title?: string;
  description?: string;
}) {
  const [bins, setBins] = React.useState(14);
  const [group, setGroup] = React.useState<GroupName>("Alpha");
  const data = SAMPLES[group];
  const W = 560, H = 200;
  const min = Math.min(...data), max = Math.max(...data);
  const counts = Array(bins).fill(0) as number[];
  data.forEach((v) => counts[Math.min(bins - 1, Math.floor(((v - min) / (max - min)) * bins))]++);
  const peak = Math.max(...counts);
  const bw = W / bins;
  const gi = GROUP_NAMES.indexOf(group);
  return (
    <ChartCard title={title} description={description} exportData={sampleCsv(group)}>
      <ChartControls>
        <SegmentedControl options={GROUP_NAMES} value={group} onChange={setGroup} ariaLabel="Sample" />
        <span className="flex w-52 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">{bins} bins</Label>
          <Slider value={[bins]} onValueChange={([v]) => setBins(v)} min={4} max={32} step={1} />
        </span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={0} x2={W} y1={H - 14} y2={H - 14} stroke="var(--border)" />
        {counts.map((c, i) => {
          const h = (c / peak) * (H - 26);
          return (
            <rect key={i} x={i * bw + 1.5} y={H - 14 - h} width={Math.max(1, bw - 3)} height={h} rx={2.5} fill={TOKEN[gi]} opacity={0.85}>
              <title>{`${c} values`}</title>
            </rect>
          );
        })}
        <text x={2} y={H - 2} fontSize={8} fontFamily="monospace" fill="var(--muted-foreground)">{Math.round(min)}</text>
        <text x={W - 2} y={H - 2} textAnchor="end" fontSize={8} fontFamily="monospace" fill="var(--muted-foreground)">{Math.round(max)}</text>
      </svg>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Box plot — toggleable groups + outlier display
// ---------------------------------------------------------------------------
export function ChartBoxPlot({
  title = "Box Plot",
  description = "Toggle groups; show or hide points beyond the 1.5·IQR whiskers.",
}: {
  title?: string;
  description?: string;
}) {
  const [on, setOn] = React.useState<Record<GroupName, boolean>>({ Alpha: true, Beta: true, Gamma: true });
  const [outliers, setOutliers] = React.useState(true);
  const groups = GROUP_NAMES.filter((g) => on[g]);
  const all = groups.flatMap((g) => SAMPLES[g]);
  const W = 560, H = 230;
  const lo = Math.min(...(all.length ? all : [0])), hi = Math.max(...(all.length ? all : [100]));
  const y = (v: number) => H - 26 - ((v - lo) / (hi - lo || 1)) * (H - 44);
  const slot = W / (groups.length + 1);
  return (
    <ChartCard title={title} description={description} exportData={groups.flatMap(sampleCsv)}>
      <ChartControls>
        <span className="flex items-center gap-1.5">
          {GROUP_NAMES.map((g, i) => (
            <FilterPill key={g} label={g} color={TOKEN[i]} active={on[g]} onClick={() => setOn((s) => ({ ...s, [g]: !s[g] }))} />
          ))}
        </span>
        <span className="flex items-center gap-2">
          <Switch id="bp-out" checked={outliers} onCheckedChange={setOutliers} />
          <Label htmlFor="bp-out" className="text-xs text-muted-foreground">Outliers</Label>
        </span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {groups.map((g, i) => {
          const gi = GROUP_NAMES.indexOf(g);
          const s = [...SAMPLES[g]].sort((a, b) => a - b);
          const q1 = quantile(s, 0.25), q2 = quantile(s, 0.5), q3 = quantile(s, 0.75);
          const iqr = q3 - q1;
          const loW = q1 - 1.5 * iqr, hiW = q3 + 1.5 * iqr;
          const wLo = Math.max(s[0], loW), wHi = Math.min(s[s.length - 1], hiW);
          const outs = s.filter((v) => v < loW || v > hiW);
          const cx = slot * (i + 1);
          return (
            <g key={g}>
              <title>{`${g} — median ${Math.round(q2)}, IQR ${Math.round(q1)}–${Math.round(q3)}`}</title>
              <line x1={cx} x2={cx} y1={y(wHi)} y2={y(wLo)} stroke={TOKEN[gi]} strokeWidth={1.5} />
              <line x1={cx - 18} x2={cx + 18} y1={y(wHi)} y2={y(wHi)} stroke={TOKEN[gi]} strokeWidth={1.5} />
              <line x1={cx - 18} x2={cx + 18} y1={y(wLo)} y2={y(wLo)} stroke={TOKEN[gi]} strokeWidth={1.5} />
              <rect x={cx - 30} y={y(q3)} width={60} height={y(q1) - y(q3)} rx={4} fill={TOKEN[gi]} opacity={0.35} stroke={TOKEN[gi]} strokeWidth={1.5} />
              <line x1={cx - 30} x2={cx + 30} y1={y(q2)} y2={y(q2)} stroke={TOKEN[gi]} strokeWidth={2.5} />
              {outliers &&
                outs.map((v, k) => (
                  <circle key={k} cx={cx + (k % 2 ? 6 : -6)} cy={y(v)} r={2.5} fill="none" stroke={TOKEN[gi]} strokeWidth={1.2} />
                ))}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">{g}</text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Violin — bandwidth slider
// ---------------------------------------------------------------------------
export function ChartViolin({
  title = "Violin",
  description = "The kernel bandwidth trades smoothness against detail.",
}: {
  title?: string;
  description?: string;
}) {
  const [bw, setBw] = React.useState(6);
  const W = 560, H = 230;
  const all = GROUP_NAMES.flatMap((g) => SAMPLES[g]);
  const lo = Math.min(...all) - 6, hi = Math.max(...all) + 6;
  const y = (v: number) => H - 26 - ((v - lo) / (hi - lo)) * (H - 44);
  const slot = W / (GROUP_NAMES.length + 1);
  return (
    <ChartCard title={title} description={description} exportData={GROUP_NAMES.flatMap(sampleCsv)}>
      <ChartControls>
        <span className="flex w-56 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Bandwidth {bw}</Label>
          <Slider value={[bw]} onValueChange={([v]) => setBw(v)} min={2} max={16} step={1} />
        </span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {GROUP_NAMES.map((g, i) => {
          const f = kde(SAMPLES[g], bw);
          const steps = Array.from({ length: 50 }, (_, k) => lo + ((hi - lo) * k) / 49);
          const peak = Math.max(...steps.map(f));
          const cx = slot * (i + 1);
          const half = (v: number) => (f(v) / peak) * 44;
          const right = steps.map((v) => `${cx + half(v)},${y(v)}`).join(" L");
          const left = [...steps].reverse().map((v) => `${cx - half(v)},${y(v)}`).join(" L");
          return (
            <g key={g}>
              <title>{`${g} — n=${SAMPLES[g].length}`}</title>
              <path d={`M${right} L${left} Z`} fill={TOKEN[i]} opacity={0.5} stroke={TOKEN[i]} strokeWidth={1.2} />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">{g}</text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Beeswarm — point radius + sample switcher
// ---------------------------------------------------------------------------
export function ChartBeeswarm({
  title = "Beeswarm",
  description = "Every point shown; the radius controls packing density.",
}: {
  title?: string;
  description?: string;
}) {
  const [group, setGroup] = React.useState<GroupName>("Alpha");
  const [radius, setRadius] = React.useState(4);
  const data = SAMPLES[group];
  const gi = GROUP_NAMES.indexOf(group);
  const W = 560, H = 190;
  const lo = Math.min(...data), hi = Math.max(...data);
  const x = (v: number) => 12 + ((v - lo) / (hi - lo)) * (W - 24);
  const placed: { x: number; y: number }[] = [];
  const pts = [...data]
    .sort((a, b) => a - b)
    .map((v) => {
      const px = x(v);
      let row = 0;
      const collides = (yy: number) =>
        placed.some((p) => Math.abs(p.x - px) < radius * 2 && Math.abs(p.y - yy) < radius * 2);
      let yy = H / 2;
      while (collides(yy)) {
        row = row >= 0 ? -(row + 1) : -row;
        yy = H / 2 + row * (radius * 2 + 1);
      }
      placed.push({ x: px, y: yy });
      return { x: px, y: yy, v };
    });
  return (
    <ChartCard title={title} description={description} exportData={sampleCsv(group)}>
      <ChartControls>
        <SegmentedControl options={GROUP_NAMES} value={group} onChange={setGroup} ariaLabel="Sample" />
        <span className="flex w-48 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">r = {radius}</Label>
          <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={2} max={8} step={1} />
        </span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={8} x2={W - 8} y1={H / 2} y2={H / 2} stroke="var(--border)" strokeDasharray="3 3" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={radius} fill={TOKEN[gi]} opacity={0.8}>
            <title>{p.v.toFixed(1)}</title>
          </circle>
        ))}
      </svg>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Waffle — adjustable split
// ---------------------------------------------------------------------------
export function ChartWaffle({
  title = "Waffle",
  description = "Two sliders, one honest part-to-whole — referral takes the remainder.",
}: {
  title?: string;
  description?: string;
}) {
  const [organic, setOrganic] = React.useState(46);
  const [paid, setPaid] = React.useState(32);
  const referral = Math.max(0, 100 - organic - paid);
  const clampedPaid = Math.min(paid, 100 - organic);
  const parts = [
    { name: "Organic", n: organic, color: TOKEN[0] },
    { name: "Paid", n: clampedPaid, color: TOKEN[2] },
    { name: "Referral", n: referral, color: TOKEN[1] },
  ];
  const cells = parts.flatMap((p) => Array(p.n).fill(p) as typeof parts);
  const size = 15;
  return (
    <ChartCard title={title} description={description} exportData={parts.map(({ name, n }) => ({ name, percent: n }))}>
      <ChartControls>
        <span className="flex w-52 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Organic {organic}%</Label>
          <Slider value={[organic]} onValueChange={([v]) => setOrganic(v)} min={0} max={100} step={1} />
        </span>
        <span className="flex w-52 items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Paid {clampedPaid}%</Label>
          <Slider value={[paid]} onValueChange={([v]) => setPaid(v)} min={0} max={100} step={1} />
        </span>
      </ChartControls>
      <div className="flex items-center justify-center gap-8">
        <svg viewBox={`0 0 ${10 * size} ${10 * size}`} className="h-48">
          {cells.slice(0, 100).map((p, i) => (
            <rect
              key={i}
              x={(i % 10) * size + 1.5}
              y={Math.floor(i / 10) * size + 1.5}
              width={size - 3}
              height={size - 3}
              rx={3}
              fill={p.color}
            >
              <title>{`${p.name} — ${p.n}%`}</title>
            </rect>
          ))}
        </svg>
        <div className="space-y-2">
          {parts.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-sm" style={{ background: p.color }} />
              <span className="text-muted-foreground">{p.name}</span>
              <span className="font-mono text-xs text-foreground">{p.n}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Dumbbell — sortable
// ---------------------------------------------------------------------------
export type DumbbellDatum = { name: string; a: number; b: number };

const DUMBBELL: DumbbellDatum[] = [
  { name: "AMER", a: 42, b: 61 },
  { name: "EMEA", a: 38, b: 49 },
  { name: "APAC", a: 25, b: 47 },
  { name: "LATAM", a: 18, b: 26 },
  { name: "MEA", a: 12, b: 21 },
];

export function ChartDumbbell({
  data = DUMBBELL,
  title = "Dumbbell",
  description = "Before/after per region; re-rank by name, change or latest value.",
}: {
  data?: DumbbellDatum[];
  title?: string;
  description?: string;
}) {
  const [sort, setSort] = React.useState<"name" | "change" | "latest">("name");
  const rows = [...data].sort((p, q) =>
    sort === "name" ? p.name.localeCompare(q.name) : sort === "change" ? q.b - q.a - (p.b - p.a) : q.b - p.b
  );
  const W = 560, H = 210;
  const x = (v: number) => 76 + (v / 70) * (W - 100);
  return (
    <ChartCard title={title} description={description} exportData={rows}>
      <ChartControls>
        <SegmentedControl options={["name", "change", "latest"] as const} value={sort} onChange={setSort} ariaLabel="Sort" />
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: TOKEN[0] }} /> 2024</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: TOKEN[2] }} /> 2026</span>
        </span>
      </ChartControls>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {rows.map((d, i) => {
          const yy = 26 + i * 38;
          return (
            <g key={d.name}>
              <title>{`${d.name}: ${d.a} → ${d.b} (+${d.b - d.a})`}</title>
              <text x={68} y={yy + 3} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">{d.name}</text>
              <line x1={x(d.a)} x2={x(d.b)} y1={yy} y2={yy} stroke="var(--border)" strokeWidth={2.5} />
              <circle cx={x(d.a)} cy={yy} r={6} fill={TOKEN[0]} />
              <circle cx={x(d.b)} cy={yy} r={6} fill={TOKEN[2]} />
              <text x={x(d.b) + 12} y={yy + 3} fontSize={9} fontFamily="monospace" fill="var(--muted-foreground)">
                +{d.b - d.a}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}
