"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { hexbin as d3hexbin } from "d3-hexbin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta: Meta = {
  title: "Nests/Charts/Distributions",
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Distribution and comparison families — histogram, box, violin, ridgeline, beeswarm, hexbin, parallel coordinates, slope, dumbbell, lollipop and waffle. Hand-rolled token-themed SVG with motion-token entrance animations and hover tooltips; deterministic pseudo-random data so visual tests stay stable.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

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

// Shared entrance/hover styles driven by the motion tokens.
function VizStyles() {
  return (
    <style>{`
      @keyframes viz-fade { from { opacity: 0; } }
      @keyframes viz-grow-y { from { transform: scaleY(0); } }
      @keyframes viz-grow-x { from { transform: scaleX(0); } }
      @keyframes viz-pop { from { transform: scale(0); } }
      .viz-fade { animation: viz-fade var(--duration-slow) var(--ease-enter) backwards; }
      .viz-grow-y { animation: viz-grow-y var(--duration-slow) var(--ease-enter) backwards; transform-box: fill-box; transform-origin: bottom; }
      .viz-grow-x { animation: viz-grow-x var(--duration-slow) var(--ease-enter) backwards; transform-box: fill-box; transform-origin: left; }
      .viz-pop { animation: viz-pop var(--duration-normal) var(--ease-spring) backwards; transform-box: fill-box; transform-origin: center; }
      .viz-hit { transition: opacity var(--duration-fast) var(--ease-standard), filter var(--duration-fast) var(--ease-standard); cursor: default; }
      .viz-hit:hover { opacity: 1 !important; filter: brightness(1.15); }
      @media (prefers-reduced-motion: reduce) {
        .viz-fade, .viz-grow-y, .viz-grow-x, .viz-pop { animation: none; }
      }
    `}</style>
  );
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random samples (stable across builds)
// ---------------------------------------------------------------------------
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const normalish = (i: number, s: number) =>
  rnd(i, s) + rnd(i + 7, s * 2) + rnd(i + 13, s * 3) + rnd(i + 29, s * 5) - 2;

const sample = (n: number, seed: number, mu: number, sd: number) =>
  Array.from({ length: n }, (_, i) => mu + normalish(i, seed) * sd);

const A = sample(60, 1, 50, 16);
const B = sample(60, 2, 58, 11);
const D3 = sample(60, 3, 42, 19);
const GROUPS = [
  { name: "Alpha", values: A },
  { name: "Beta", values: B },
  { name: "Gamma", values: D3 },
];

const quantile = (sorted: number[], p: number) => {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
};

const kde = (values: number[], bw: number) => (x: number) =>
  values.reduce((acc, v) => acc + Math.exp(-0.5 * ((x - v) / bw) ** 2), 0) /
  (values.length * bw * Math.sqrt(2 * Math.PI));

// ---------------------------------------------------------------------------
// 1. Histogram
// ---------------------------------------------------------------------------
function Histogram() {
  const W = 420, H = 170, BINS = 14;
  const min = Math.min(...A), max = Math.max(...A);
  const counts = Array(BINS).fill(0);
  A.forEach((v) => counts[Math.min(BINS - 1, Math.floor(((v - min) / (max - min)) * BINS))]++);
  const peak = Math.max(...counts);
  const bw = W / BINS;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={0} x2={W} y1={H - 14} y2={H - 14} stroke="var(--border)" />
      {counts.map((c, i) => {
        const h = (c / peak) * (H - 26);
        return (
          <rect
            key={i}
            className="viz-grow-y viz-hit"
            style={{ animationDelay: `${i * 35}ms` }}
            x={i * bw + 2}
            y={H - 14 - h}
            width={bw - 4}
            height={h}
            rx={3}
            fill={C[0]}
            opacity={0.85}
          >
            <title>{`${c} values`}</title>
          </rect>
        );
      })}
      <text x={2} y={H - 2} fontSize={8} fontFamily="monospace" fill="var(--muted-foreground)">{Math.round(min)}</text>
      <text x={W - 2} y={H - 2} textAnchor="end" fontSize={8} fontFamily="monospace" fill="var(--muted-foreground)">{Math.round(max)}</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 2. Box plot
// ---------------------------------------------------------------------------
function BoxPlot() {
  const W = 420, H = 190;
  const all = [...A, ...B, ...D3];
  const lo = Math.min(...all), hi = Math.max(...all);
  const y = (v: number) => H - 24 - ((v - lo) / (hi - lo)) * (H - 40);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {GROUPS.map((g, i) => {
        const s = [...g.values].sort((a, b) => a - b);
        const q1 = quantile(s, 0.25), q2 = quantile(s, 0.5), q3 = quantile(s, 0.75);
        const iqr = q3 - q1;
        const wLo = Math.max(s[0], q1 - 1.5 * iqr), wHi = Math.min(s[s.length - 1], q3 + 1.5 * iqr);
        const cx = 80 + i * 130;
        return (
          <g key={g.name} className="viz-fade viz-hit" style={{ animationDelay: `${i * 130}ms` }}>
            <title>{`${g.name} — median ${Math.round(q2)}, IQR ${Math.round(q1)}–${Math.round(q3)}`}</title>
            <line x1={cx} x2={cx} y1={y(wHi)} y2={y(wLo)} stroke={C[i]} strokeWidth={1.5} />
            <line x1={cx - 16} x2={cx + 16} y1={y(wHi)} y2={y(wHi)} stroke={C[i]} strokeWidth={1.5} />
            <line x1={cx - 16} x2={cx + 16} y1={y(wLo)} y2={y(wLo)} stroke={C[i]} strokeWidth={1.5} />
            <rect x={cx - 26} y={y(q3)} width={52} height={y(q1) - y(q3)} rx={4} fill={C[i]} opacity={0.35} stroke={C[i]} strokeWidth={1.5} />
            <line x1={cx - 26} x2={cx + 26} y1={y(q2)} y2={y(q2)} stroke={C[i]} strokeWidth={2.5} />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">{g.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3. Violin
// ---------------------------------------------------------------------------
function Violin() {
  const W = 420, H = 190;
  const all = [...A, ...B, ...D3];
  const lo = Math.min(...all) - 6, hi = Math.max(...all) + 6;
  const y = (v: number) => H - 24 - ((v - lo) / (hi - lo)) * (H - 40);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {GROUPS.map((g, i) => {
        const f = kde(g.values, 6);
        const steps = Array.from({ length: 40 }, (_, k) => lo + ((hi - lo) * k) / 39);
        const peak = Math.max(...steps.map(f));
        const cx = 80 + i * 130;
        const half = (v: number) => (f(v) / peak) * 34;
        const right = steps.map((v) => `${cx + half(v)},${y(v)}`).join(" L");
        const left = [...steps].reverse().map((v) => `${cx - half(v)},${y(v)}`).join(" L");
        return (
          <g key={g.name} className="viz-fade viz-hit" style={{ animationDelay: `${i * 130}ms` }}>
            <title>{`${g.name} — n=${g.values.length}`}</title>
            <path d={`M${right} L${left} Z`} fill={C[i]} opacity={0.5} stroke={C[i]} strokeWidth={1.2} />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">{g.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. Ridgeline
// ---------------------------------------------------------------------------
function Ridgeline() {
  const W = 420, H = 190;
  const series = [
    { name: "2023", values: sample(60, 4, 40, 14) },
    { name: "2024", values: sample(60, 5, 48, 13) },
    { name: "2025", values: sample(60, 6, 55, 12) },
    { name: "2026", values: sample(60, 7, 60, 10) },
  ];
  const lo = 0, hi = 100;
  const rowH = 38, amp = 52;
  const x = (v: number) => 50 + ((v - lo) / (hi - lo)) * (W - 60);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {series.map((sr, i) => {
        const base = 36 + i * rowH;
        const f = kde(sr.values, 6);
        const steps = Array.from({ length: 60 }, (_, k) => lo + ((hi - lo) * k) / 59);
        const peak = Math.max(...steps.map(f));
        const pts = steps.map((v) => `${x(v)},${base - (f(v) / peak) * amp}`).join(" L");
        return (
          <g key={sr.name} className="viz-fade viz-hit" style={{ animationDelay: `${i * 110}ms` }}>
            <title>{sr.name}</title>
            <path d={`M${x(lo)},${base} L${pts} L${x(hi)},${base} Z`} fill={C[i % 5]} opacity={0.55} stroke={C[i % 5]} strokeWidth={1.2} />
            <text x={44} y={base} textAnchor="end" fontSize={9} fontFamily="monospace" fill="var(--muted-foreground)">{sr.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 5. Beeswarm
// ---------------------------------------------------------------------------
function Beeswarm() {
  const W = 420, H = 150, R = 4;
  const lo = Math.min(...A), hi = Math.max(...A);
  const x = (v: number) => 12 + ((v - lo) / (hi - lo)) * (W - 24);
  const placed: { x: number; y: number }[] = [];
  const pts = [...A]
    .sort((a, b) => a - b)
    .map((v) => {
      const px = x(v);
      let row = 0;
      const collides = (yy: number) => placed.some((p) => Math.abs(p.x - px) < R * 2 && Math.abs(p.y - yy) < R * 2);
      // search outward: 0, +1, -1, +2, -2 …
      let yy = H / 2;
      while (collides(yy)) {
        row = row >= 0 ? -(row + 1) : -row;
        yy = H / 2 + row * (R * 2 + 1);
      }
      placed.push({ x: px, y: yy });
      return { x: px, y: yy, v };
    });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={8} x2={W - 8} y1={H / 2} y2={H / 2} stroke="var(--border)" strokeDasharray="3 3" />
      {pts.map((p, i) => (
        <circle
          key={i}
          className="viz-pop viz-hit"
          style={{ animationDelay: `${i * 8}ms` }}
          cx={p.x}
          cy={p.y}
          r={R}
          fill={C[0]}
          opacity={0.8}
        >
          <title>{p.v.toFixed(1)}</title>
        </circle>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. Hexbin density
// ---------------------------------------------------------------------------
function HexbinDensity() {
  const W = 420, H = 190;
  const pts: [number, number][] = [];
  for (let i = 0; i < 160; i++) {
    const cluster = i % 2;
    const cx = cluster ? W * 0.62 : W * 0.32;
    const cy = cluster ? H * 0.42 : H * 0.6;
    pts.push([cx + normalish(i, 11 + cluster) * 56, cy + normalish(i, 17 + cluster) * 34]);
  }
  const hb = d3hexbin<[number, number]>().radius(13).extent([[0, 0], [W, H]]);
  const bins = hb(pts.filter(([px, py]) => px > 0 && px < W && py > 0 && py < H));
  const peak = Math.max(...bins.map((b) => b.length));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {bins.map((b, i) => (
        <path
          key={i}
          className="viz-fade viz-hit"
          style={{ animationDelay: `${i * 14}ms` }}
          d={hb.hexagon(12)}
          transform={`translate(${b.x},${b.y})`}
          fill={C[0]}
          opacity={0.15 + (b.length / peak) * 0.85}
        >
          <title>{`${b.length} points`}</title>
        </path>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. Parallel coordinates
// ---------------------------------------------------------------------------
const PC_DIMS = ["Speed", "Cost", "Quality", "Scale"];
const PC_ROWS = Array.from({ length: 14 }, (_, i) => ({
  group: i % 2,
  vals: PC_DIMS.map((_, d) => 20 + rnd(i * 4 + d, 23 + d) * 70 + (i % 2 ? 8 : -4)),
}));

function ParallelCoords() {
  const W = 420, H = 180;
  const ax = (d: number) => 40 + (d * (W - 80)) / (PC_DIMS.length - 1);
  const y = (v: number) => H - 26 - ((v - 10) / 90) * (H - 44);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {PC_DIMS.map((d, i) => (
        <g key={d}>
          <line x1={ax(i)} x2={ax(i)} y1={14} y2={H - 26} stroke="var(--border)" strokeWidth={1.5} />
          <text x={ax(i)} y={H - 10} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">{d}</text>
        </g>
      ))}
      {PC_ROWS.map((r, i) => (
        <polyline
          key={i}
          className="viz-fade viz-hit"
          style={{ animationDelay: `${i * 45}ms` }}
          points={r.vals.map((v, d) => `${ax(d)},${y(v)}`).join(" ")}
          fill="none"
          stroke={C[r.group === 0 ? 0 : 2]}
          strokeWidth={1.4}
          opacity={0.55}
        >
          <title>{`Record ${i + 1} (${r.group === 0 ? "Plan A" : "Plan B"})`}</title>
        </polyline>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 8. Slope graph
// ---------------------------------------------------------------------------
const SLOPE = [
  { name: "Search", a: 64, b: 71 },
  { name: "Social", a: 48, b: 32 },
  { name: "Direct", a: 35, b: 44 },
  { name: "Email", a: 28, b: 25 },
  { name: "Referral", a: 18, b: 30 },
];

function SlopeGraph() {
  const W = 420, H = 190;
  const y = (v: number) => H - 26 - (v / 80) * (H - 48);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[120, 300].map((xx, i) => (
        <text key={i} x={xx} y={14} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--muted-foreground)">
          {i === 0 ? "2024" : "2026"}
        </text>
      ))}
      {SLOPE.map((s, i) => {
        const up = s.b >= s.a;
        const col = up ? C[1] : C[4];
        return (
          <g key={s.name} className="viz-fade viz-hit" style={{ animationDelay: `${i * 90}ms` }}>
            <line x1={120} x2={300} y1={y(s.a)} y2={y(s.b)} stroke={col} strokeWidth={2} />
            <circle cx={120} cy={y(s.a)} r={4} fill={col} />
            <circle cx={300} cy={y(s.b)} r={4} fill={col} />
            <text x={110} y={y(s.a) + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">{s.name} {s.a}</text>
            <text x={310} y={y(s.b) + 3} fontSize={9} fill="var(--muted-foreground)">{s.b}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 9. Dumbbell
// ---------------------------------------------------------------------------
const DUMBBELL = [
  { name: "AMER", a: 42, b: 61 },
  { name: "EMEA", a: 38, b: 49 },
  { name: "APAC", a: 25, b: 47 },
  { name: "LATAM", a: 18, b: 26 },
  { name: "MEA", a: 12, b: 21 },
];

function Dumbbell() {
  const W = 420, H = 180;
  const x = (v: number) => 70 + (v / 70) * (W - 90);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {DUMBBELL.map((d, i) => {
        const yy = 24 + i * 32;
        return (
          <g key={d.name} className="viz-fade viz-hit" style={{ animationDelay: `${i * 90}ms` }}>
            <title>{`${d.name}: ${d.a} → ${d.b}`}</title>
            <text x={62} y={yy + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">{d.name}</text>
            <line x1={x(d.a)} x2={x(d.b)} y1={yy} y2={yy} stroke="var(--border)" strokeWidth={2.5} />
            <circle cx={x(d.a)} cy={yy} r={5.5} fill={C[0]} />
            <circle cx={x(d.b)} cy={yy} r={5.5} fill={C[2]} />
          </g>
        );
      })}
      <g fontSize={9} fill="var(--muted-foreground)">
        <circle cx={150} cy={H - 8} r={4} fill={C[0]} />
        <text x={158} y={H - 5}>2024</text>
        <circle cx={200} cy={H - 8} r={4} fill={C[2]} />
        <text x={208} y={H - 5}>2026</text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 10. Lollipop
// ---------------------------------------------------------------------------
const LOLLI = [
  { name: "Checkout", v: 64 },
  { name: "Search", v: 51 },
  { name: "Profile", v: 43 },
  { name: "Settings", v: 31 },
  { name: "Billing", v: 24 },
  { name: "Admin", v: 12 },
];

function Lollipop() {
  const W = 420, H = 180;
  const x = (v: number) => 76 + (v / 70) * (W - 110);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {LOLLI.map((d, i) => {
        const yy = 18 + i * 28;
        return (
          <g key={d.name} className="viz-fade viz-hit" style={{ animationDelay: `${i * 70}ms` }}>
            <title>{`${d.name}: ${d.v}`}</title>
            <text x={68} y={yy + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">{d.name}</text>
            <line x1={76} x2={x(d.v)} y1={yy} y2={yy} stroke={C[0]} strokeWidth={2} opacity={0.5} />
            <circle cx={x(d.v)} cy={yy} r={6} fill={C[0]} />
            <text x={x(d.v) + 11} y={yy + 3} fontSize={9} fontFamily="monospace" fill="var(--muted-foreground)">{d.v}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 11. Waffle
// ---------------------------------------------------------------------------
function Waffle() {
  const parts = [
    { name: "Organic", n: 46, color: C[0] },
    { name: "Paid", n: 32, color: C[2] },
    { name: "Referral", n: 22, color: C[1] },
  ];
  const cells = parts.flatMap((p) => Array(p.n).fill(p) as typeof parts);
  const size = 15;
  return (
    <div className="flex h-56 items-center justify-center gap-8">
      <svg viewBox={`0 0 ${10 * size} ${10 * size}`} className="h-44">
        {cells.map((p, i) => (
          <rect
            key={i}
            className="viz-pop viz-hit"
            style={{ animationDelay: `${i * 7}ms` }}
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
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
const CARDS: { title: string; description: string; Component: () => React.ReactElement }[] = [
  { title: "Histogram", description: "Binned frequency of one sample.", Component: Histogram },
  { title: "Box plot", description: "Quartiles, median and 1.5·IQR whiskers, three groups.", Component: BoxPlot },
  { title: "Violin", description: "Kernel density, mirrored — shape plus spread.", Component: Violin },
  { title: "Ridgeline", description: "Densities per year, overlapped rows show drift.", Component: Ridgeline },
  { title: "Beeswarm", description: "Every point shown, collision-packed on one axis.", Component: Beeswarm },
  { title: "Hexbin density", description: "Point clouds aggregated into hexagonal bins.", Component: HexbinDensity },
  { title: "Parallel coordinates", description: "Multivariate records as polylines across axes.", Component: ParallelCoords },
  { title: "Slope graph", description: "Two time points, change as slope.", Component: SlopeGraph },
  { title: "Dumbbell", description: "Before/after per category on a shared scale.", Component: Dumbbell },
  { title: "Lollipop", description: "Ranked values — a lighter bar chart.", Component: Lollipop },
  { title: "Waffle", description: "Part-to-whole as 100 squares — more honest than pie.", Component: Waffle },
];

export const DistributionsGallery: Story = {
  name: "Distributions Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <VizStyles />
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Charts — Distributions & Comparisons</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Eleven statistical idioms in token-themed SVG with deterministic sample data.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map(({ title, description, Component }) => (
            <ChartCard key={title} title={title} description={description}>
              <Component />
            </ChartCard>
          ))}
        </div>
      </div>
    </div>
  ),
};
