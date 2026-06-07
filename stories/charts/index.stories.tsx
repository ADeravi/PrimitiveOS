"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Charts/Index",
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 1200 },
    docs: {
      description: {
        component:
          "A visual index of every chart in the system. Each thumbnail is a hand-drawn token-themed SVG glyph — switch the Design Layer or dark mode and the whole index re-themes. Click any card to open its story.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const MUTED = "var(--muted)";
const MUTEDF = "var(--muted-foreground)";
const BORDER = "var(--border)";

// All glyphs share a 96×60 canvas.
function Thumb({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 96 60" className="w-full" aria-hidden>
      {children}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Glyphs — Core
// ---------------------------------------------------------------------------
const GLine = (
  <Thumb>
    <polyline points="8,44 28,28 48,34 68,16 88,22" fill="none" stroke={C[0]} strokeWidth={2.5} />
    <polyline points="8,50 28,42 48,46 68,34 88,38" fill="none" stroke={C[2]} strokeWidth={2} opacity={0.7} />
  </Thumb>
);

const GArea = (
  <Thumb>
    <path d="M8,46 L28,30 L48,36 L68,18 L88,26 L88,54 L8,54 Z" fill={C[0]} opacity={0.3} />
    <polyline points="8,46 28,30 48,36 68,18 88,26" fill="none" stroke={C[0]} strokeWidth={2.5} />
  </Thumb>
);

const GBar = (
  <Thumb>
    {[34, 18, 26, 10, 30].map((y, i) => (
      <rect key={i} x={10 + i * 16} y={y} width={11} height={54 - y} rx={2} fill={C[0]} opacity={0.85} />
    ))}
  </Thumb>
);

const GDonut = (
  <Thumb>
    <circle cx={48} cy={30} r={17} fill="none" stroke={MUTED} strokeWidth={9} />
    <path d="M48,13 A17,17 0 0 1 64.4,35.3" fill="none" stroke={C[0]} strokeWidth={9} />
    <path d="M64.4,35.3 A17,17 0 0 1 42,52" fill="none" stroke={C[2]} strokeWidth={9} />
  </Thumb>
);

const GRadar = (
  <Thumb>
    <polygon points="48,8 78,24 68,52 28,52 18,24" fill="none" stroke={BORDER} strokeWidth={1.2} />
    <polygon points="48,16 68,27 62,46 36,44 28,28" fill={C[0]} opacity={0.35} stroke={C[0]} strokeWidth={1.8} />
  </Thumb>
);

const GScatter = (
  <Thumb>
    {[[16, 44, 3], [28, 34, 4], [40, 40, 3], [50, 24, 5], [64, 30, 4], [78, 14, 6], [70, 44, 3], [86, 26, 4]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? C[2] : C[0]} opacity={0.8} />
    ))}
  </Thumb>
);

const GHeatmap = (
  <Thumb>
    {Array.from({ length: 24 }, (_, i) => {
      const x = i % 6;
      const y = Math.floor(i / 6);
      const v = (Math.sin(x * 2.1 + y * 1.3) + 1) / 2;
      return <rect key={i} x={12 + x * 12.5} y={6 + y * 12.5} width={10} height={10} rx={2} fill={C[0]} opacity={0.15 + v * 0.8} />;
    })}
  </Thumb>
);

const GDualAxis = (
  <Thumb>
    {[30, 22, 36, 18, 28].map((y, i) => (
      <rect key={i} x={10 + i * 16} y={y} width={11} height={54 - y} rx={2} fill={C[0]} opacity={0.6} />
    ))}
    <polyline points="8,40 28,26 48,32 68,14 88,20" fill="none" stroke={C[2]} strokeWidth={2.5} />
  </Thumb>
);

// ---------------------------------------------------------------------------
// Glyphs — Flow & Hierarchy
// ---------------------------------------------------------------------------
const GTreemap = (
  <Thumb>
    <rect x={8} y={6} width={44} height={48} rx={2} fill={C[0]} opacity={0.85} />
    <rect x={55} y={6} width={33} height={26} rx={2} fill={C[1]} opacity={0.85} />
    <rect x={55} y={35} width={18} height={19} rx={2} fill={C[2]} opacity={0.85} />
    <rect x={76} y={35} width={12} height={19} rx={2} fill={C[3]} opacity={0.85} />
  </Thumb>
);

const GSankey = (
  <Thumb>
    <rect x={8} y={10} width={5} height={36} rx={1} fill={C[0]} />
    <rect x={83} y={6} width={5} height={20} rx={1} fill={C[0]} />
    <rect x={83} y={34} width={5} height={18} rx={1} fill={C[0]} />
    <path d="M13,12 C50,12 50,9 83,9 L83,23 C50,23 50,28 13,28 Z" fill={C[1]} opacity={0.45} />
    <path d="M13,30 C50,30 50,37 83,37 L83,49 C50,49 50,44 13,44 Z" fill={C[2]} opacity={0.45} />
  </Thumb>
);

const GFunnel = (
  <Thumb>
    {[64, 48, 32, 18].map((w, i) => (
      <rect key={i} x={48 - w / 2} y={8 + i * 12} width={w} height={9} rx={2} fill={C[i]} opacity={0.85} />
    ))}
  </Thumb>
);

const GWaterfall = (
  <Thumb>
    <rect x={10} y={26} width={11} height={28} rx={2} fill={C[0]} />
    <rect x={26} y={16} width={11} height={10} rx={2} fill={C[1]} />
    <rect x={42} y={16} width={11} height={8} rx={2} fill={C[4]} />
    <rect x={58} y={10} width={11} height={14} rx={2} fill={C[1]} />
    <rect x={74} y={10} width={11} height={44} rx={2} fill={C[0]} />
  </Thumb>
);

const GStreamgraph = (
  <Thumb>
    <path d="M8,30 C30,18 60,38 88,24 L88,34 C60,48 30,28 8,40 Z" fill={C[0]} opacity={0.8} />
    <path d="M8,24 C30,12 60,30 88,16 L88,24 C60,38 30,18 8,30 Z" fill={C[1]} opacity={0.8} />
    <path d="M8,40 C30,28 60,48 88,34 L88,42 C60,54 30,38 8,48 Z" fill={C[2]} opacity={0.8} />
  </Thumb>
);

const GSunburst = (
  <Thumb>
    <path d="M48,30 L48,8 A22,22 0 0 1 69,36 Z" fill={C[0]} opacity={0.9} />
    <path d="M48,30 L69,36 A22,22 0 0 1 34,47 Z" fill={C[1]} opacity={0.9} />
    <path d="M48,30 L34,47 A22,22 0 0 1 48,8 Z" fill={C[2]} opacity={0.9} />
    <circle cx={48} cy={30} r={9} fill="var(--background)" />
  </Thumb>
);

// ---------------------------------------------------------------------------
// Glyphs — KPI & Time
// ---------------------------------------------------------------------------
const GGauge = (
  <Thumb>
    <path d="M18,48 A32,32 0 1 1 78,48" fill="none" stroke={MUTED} strokeWidth={8} strokeLinecap="round" />
    <path d="M18,48 A32,32 0 0 1 48,14" fill="none" stroke={C[0]} strokeWidth={8} strokeLinecap="round" />
    <circle cx={48} cy={42} r={3.5} fill={MUTEDF} />
  </Thumb>
);

const GBullet = (
  <Thumb>
    {[10, 26, 42].map((y, i) => (
      <g key={i}>
        <rect x={10} y={y} width={76} height={9} rx={2} fill={MUTED} />
        <rect x={10} y={y + 2.5} width={[58, 40, 66][i]} height={4} rx={1.5} fill={C[0]} />
        <line x1={[68, 56, 74][i]} x2={[68, 56, 74][i]} y1={y - 2} y2={y + 11} stroke="var(--foreground)" strokeWidth={2} />
      </g>
    ))}
  </Thumb>
);

const GSparkline = (
  <Thumb>
    <rect x={10} y={8} width={76} height={44} rx={6} fill="none" stroke={BORDER} strokeWidth={1.5} />
    <rect x={17} y={15} width={22} height={5} rx={2} fill={MUTED} />
    <rect x={17} y={24} width={14} height={7} rx={2} fill={MUTEDF} opacity={0.6} />
    <polyline points="17,46 32,40 46,43 60,35 74,38 80,32" fill="none" stroke={C[0]} strokeWidth={2} />
  </Thumb>
);

const GBrush = (
  <Thumb>
    <polyline points="8,34 24,20 40,28 56,12 72,22 88,16" fill="none" stroke={C[0]} strokeWidth={2.5} />
    <rect x={8} y={44} width={80} height={9} rx={2} fill={MUTED} />
    <rect x={30} y={44} width={28} height={9} rx={2} fill={C[0]} opacity={0.4} />
    <rect x={28} y={42} width={4} height={13} rx={1} fill={C[0]} />
    <rect x={56} y={42} width={4} height={13} rx={1} fill={C[0]} />
  </Thumb>
);

const GCandlestick = (
  <Thumb>
    {[[14, 18, 14, "u"], [28, 12, 18, "d"], [42, 16, 12, "u"], [56, 8, 16, "u"], [70, 14, 18, "d"], [84, 10, 14, "u"]].map(([x, y, h, k], i) => (
      <g key={i}>
        <line x1={x as number} x2={x as number} y1={(y as number) - 5} y2={(y as number) + (h as number) + 5} stroke={k === "u" ? "var(--success)" : "var(--destructive)"} strokeWidth={1.5} />
        <rect x={(x as number) - 4} y={y as number} width={8} height={h as number} rx={1.5} fill={k === "u" ? "var(--success)" : "var(--destructive)"} />
      </g>
    ))}
  </Thumb>
);

// ---------------------------------------------------------------------------
// Glyphs — Distributions
// ---------------------------------------------------------------------------
const GHistogram = (
  <Thumb>
    {[40, 30, 18, 10, 14, 24, 36, 44].map((y, i) => (
      <rect key={i} x={9 + i * 10} y={y} width={8} height={54 - y} rx={1.5} fill={C[0]} opacity={0.85} />
    ))}
  </Thumb>
);

const GBoxPlot = (
  <Thumb>
    {[30, 64].map((cx, i) => (
      <g key={i}>
        <line x1={cx} x2={cx} y1={8} y2={52} stroke={C[i * 2]} strokeWidth={1.5} />
        <rect x={cx - 11} y={i ? 24 : 18} width={22} height={i ? 18 : 22} rx={3} fill={C[i * 2]} opacity={0.35} stroke={C[i * 2]} strokeWidth={1.5} />
        <line x1={cx - 11} x2={cx + 11} y1={i ? 33 : 28} y2={i ? 33 : 28} stroke={C[i * 2]} strokeWidth={2.5} />
      </g>
    ))}
  </Thumb>
);

const GViolin = (
  <Thumb>
    <path d="M30,8 C38,18 40,24 30,30 C20,36 22,46 30,52 C38,46 40,36 30,30 C20,24 22,18 30,8 Z" fill={C[0]} opacity={0.55} stroke={C[0]} strokeWidth={1.2} />
    <path d="M66,8 C76,16 78,28 66,34 C54,40 58,48 66,52 C74,48 78,40 66,34 C54,28 56,16 66,8 Z" fill={C[2]} opacity={0.55} stroke={C[2]} strokeWidth={1.2} />
  </Thumb>
);

const GBeeswarm = (
  <Thumb>
    <line x1={8} x2={88} y1={30} y2={30} stroke={BORDER} strokeDasharray="3 3" />
    {[[16, 30], [26, 30], [34, 26], [34, 34], [42, 30], [50, 24], [50, 36], [50, 30], [58, 27], [58, 33], [66, 30], [76, 28], [84, 31]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={3.5} fill={C[0]} opacity={0.8} />
    ))}
  </Thumb>
);

const GWaffle = (
  <Thumb>
    {Array.from({ length: 40 }, (_, i) => {
      const x = i % 8;
      const y = Math.floor(i / 8);
      const color = i < 18 ? C[0] : i < 30 ? C[2] : C[1];
      return <rect key={i} x={14 + x * 9} y={6 + y * 10} width={7} height={8} rx={1.5} fill={color} />;
    })}
  </Thumb>
);

const GDumbbell = (
  <Thumb>
    {[14, 30, 46].map((y, i) => (
      <g key={i}>
        <line x1={[20, 30, 14][i]} x2={[70, 80, 56][i]} y1={y} y2={y} stroke={BORDER} strokeWidth={2.5} />
        <circle cx={[20, 30, 14][i]} cy={y} r={5} fill={C[0]} />
        <circle cx={[70, 80, 56][i]} cy={y} r={5} fill={C[2]} />
      </g>
    ))}
  </Thumb>
);

// ---------------------------------------------------------------------------
// Glyphs — Dashboard, states, gallery extras
// ---------------------------------------------------------------------------
const GDashboard = (
  <Thumb>
    <rect x={8} y={6} width={38} height={22} rx={3} fill="none" stroke={BORDER} strokeWidth={1.5} />
    <rect x={50} y={6} width={38} height={22} rx={3} fill="none" stroke={BORDER} strokeWidth={1.5} />
    <rect x={8} y={32} width={38} height={22} rx={3} fill="none" stroke={BORDER} strokeWidth={1.5} />
    <rect x={50} y={32} width={38} height={22} rx={3} fill="none" stroke={BORDER} strokeWidth={1.5} />
    {[12, 19, 26].map((x, i) => (
      <rect key={i} x={x} y={[16, 12, 19][i]} width={5} height={[9, 13, 6][i]} rx={1} fill={C[i]} />
    ))}
    <polyline points="54,22 62,14 70,18 78,10 84,13" fill="none" stroke={C[1]} strokeWidth={2} />
    <polyline points="12,50 20,42 28,46 36,38 42,41" fill="none" stroke={C[0]} strokeWidth={2} />
    <path d="M68,50 A8,8 0 1 1 76,42" fill="none" stroke={C[2]} strokeWidth={4} />
  </Thumb>
);

const GStates = (
  <Thumb>
    {[36, 20, 30, 12, 26, 40, 18].map((y, i) => (
      <rect key={i} x={10 + i * 11} y={y} width={8} height={54 - y} rx={2} fill={MUTED} />
    ))}
  </Thumb>
);

const GRadialBars = (
  <Thumb>
    <path d="M48,12 A18,18 0 1 1 30,30" fill="none" stroke={C[0]} strokeWidth={5} strokeLinecap="round" />
    <path d="M48,20 A10,10 0 1 1 38,30" fill="none" stroke={C[1]} strokeWidth={5} strokeLinecap="round" />
    <path d="M48,4 A26,26 0 0 1 74,30" fill="none" stroke={C[2]} strokeWidth={5} strokeLinecap="round" />
  </Thumb>
);

const GConfidence = (
  <Thumb>
    <path d="M8,38 C30,24 60,36 88,18 L88,30 C60,46 30,36 8,50 Z" fill={C[0]} opacity={0.2} />
    <polyline points="8,44 30,30 60,36 88,24" fill="none" stroke={C[0]} strokeWidth={2.5} />
  </Thumb>
);

const GWordCloud = (
  <Thumb>
    <text x={14} y={28} fontSize={15} fontWeight={700} fill={C[0]}>aaa</text>
    <text x={52} y={24} fontSize={9} fontWeight={500} fill={C[2]}>bbb</text>
    <text x={50} y={40} fontSize={12} fontWeight={600} fill={C[1]}>ccc</text>
    <text x={16} y={46} fontSize={8} fontWeight={500} fill={C[3]}>ddd</text>
  </Thumb>
);

const GRidgeline = (
  <Thumb>
    {[20, 32, 44].map((base, i) => (
      <path key={i} d={`M10,${base} C30,${base - 16} 40,${base - 14} 50,${base} C64,${base - 10} 74,${base - 8} 86,${base}`} fill={C[i]} opacity={0.4} stroke={C[i]} strokeWidth={1.4} />
    ))}
  </Thumb>
);

const GHexbin = (
  <Thumb>
    {[[34, 22, 0.9], [48, 14, 0.6], [48, 30, 1], [62, 22, 0.7], [62, 38, 0.4], [34, 38, 0.5], [20, 30, 0.3], [76, 30, 0.3]].map(([x, y, o], i) => (
      <path key={i} d="M0,-8 L7,-4 L7,4 L0,8 L-7,4 L-7,-4 Z" transform={`translate(${x},${y})`} fill={C[0]} opacity={o as number} />
    ))}
  </Thumb>
);

const GParallel = (
  <Thumb>
    {[16, 48, 80].map((x) => (
      <line key={x} x1={x} x2={x} y1={8} y2={52} stroke={BORDER} strokeWidth={2} />
    ))}
    <polyline points="16,16 48,30 80,20" fill="none" stroke={C[0]} strokeWidth={2} opacity={0.8} />
    <polyline points="16,30 48,16 80,38" fill="none" stroke={C[2]} strokeWidth={2} opacity={0.8} />
    <polyline points="16,44 48,40 80,48" fill="none" stroke={C[0]} strokeWidth={2} opacity={0.5} />
  </Thumb>
);

const GSlope = (
  <Thumb>
    {[[14, 22, C[1]], [30, 16, C[1]], [40, 48, C[4]], [48, 36, C[1]]].map(([a, b, col], i) => (
      <g key={i}>
        <line x1={26} x2={70} y1={a as number} y2={b as number} stroke={col as string} strokeWidth={2} />
        <circle cx={26} cy={a as number} r={3.5} fill={col as string} />
        <circle cx={70} cy={b as number} r={3.5} fill={col as string} />
      </g>
    ))}
  </Thumb>
);

const GLollipop = (
  <Thumb>
    {[[14, 70], [26, 56], [38, 44], [50, 30]].map(([y, x], i) => (
      <g key={i}>
        <line x1={12} x2={x} y1={y} y2={y} stroke={C[0]} strokeWidth={2} opacity={0.5} />
        <circle cx={x} cy={y} r={5} fill={C[0]} />
      </g>
    ))}
  </Thumb>
);

const GIcicle = (
  <Thumb>
    <rect x={8} y={6} width={80} height={14} rx={2} fill={C[0]} opacity={0.9} />
    <rect x={8} y={23} width={38} height={14} rx={2} fill={C[1]} opacity={0.85} />
    <rect x={49} y={23} width={39} height={14} rx={2} fill={C[2]} opacity={0.85} />
    <rect x={8} y={40} width={18} height={14} rx={2} fill={C[1]} opacity={0.5} />
    <rect x={29} y={40} width={17} height={14} rx={2} fill={C[1]} opacity={0.35} />
    <rect x={49} y={40} width={20} height={14} rx={2} fill={C[2]} opacity={0.5} />
  </Thumb>
);

const GChoropleth = (
  <Thumb>
    <path d="M10,20 C16,10 30,8 36,16 C44,12 52,18 48,26 C54,32 46,40 36,38 C28,44 14,40 14,32 C8,28 8,24 10,20 Z" fill={C[0]} opacity={0.85} />
    <path d="M54,34 C60,26 74,24 80,32 C88,34 86,44 78,46 C70,52 58,48 56,42 C52,40 52,36 54,34 Z" fill={C[0]} opacity={0.45} />
    <path d="M62,8 C68,4 78,6 80,12 C84,16 78,22 70,20 C64,22 58,14 62,8 Z" fill={C[0]} opacity={0.25} />
  </Thumb>
);

const GDotMap = (
  <Thumb>
    <path d="M12,24 C20,8 50,6 62,14 C80,12 88,26 82,38 C76,50 50,54 34,48 C18,50 6,38 12,24 Z" fill={MUTED} opacity={0.8} />
    {[[28, 26, 6], [48, 20, 4], [60, 32, 7], [40, 40, 3], [72, 24, 4]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={C[0]} opacity={0.7} stroke="var(--background)" strokeWidth={1} />
    ))}
  </Thumb>
);

const GNetwork = (
  <Thumb>
    {[[[20, 18], [48, 30]], [[48, 30], [76, 14]], [[48, 30], [30, 48]], [[48, 30], [70, 46]], [[20, 18], [30, 48]], [[76, 14], [70, 46]]].map(([[x1, y1], [x2, y2]], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BORDER} strokeWidth={1.5} />
    ))}
    <circle cx={48} cy={30} r={7} fill={C[0]} />
    <circle cx={20} cy={18} r={5} fill={C[1]} />
    <circle cx={76} cy={14} r={5} fill={C[2]} />
    <circle cx={30} cy={48} r={5} fill={C[1]} />
    <circle cx={70} cy={46} r={5} fill={C[2]} />
  </Thumb>
);

const GArcDiagram = (
  <Thumb>
    <line x1={8} x2={88} y1={46} y2={46} stroke={BORDER} />
    <path d="M16,46 A16,16 0 0 1 48,46" fill="none" stroke={C[0]} strokeWidth={1.8} />
    <path d="M32,46 A24,24 0 0 1 80,46" fill="none" stroke={C[2]} strokeWidth={1.8} />
    <path d="M48,46 A8,8 0 0 1 64,46" fill="none" stroke={C[1]} strokeWidth={1.8} />
    {[16, 32, 48, 64, 80].map((x, i) => (
      <circle key={x} cx={x} cy={46} r={4} fill={C[i % 3]} />
    ))}
  </Thumb>
);

const GMatrix = (
  <Thumb>
    {Array.from({ length: 25 }, (_, i) => {
      const x = i % 5;
      const y = Math.floor(i / 5);
      const onDiag = x === y;
      const filled = [1, 3, 5, 9, 11, 15, 19, 21, 23].includes(i);
      return (
        <rect key={i} x={24 + x * 10} y={5 + y * 10} width={8.5} height={8.5} rx={1.5}
          fill={onDiag ? MUTEDF : filled ? C[x % 3] : MUTED} opacity={onDiag ? 0.4 : filled ? 0.9 : 0.6} />
      );
    })}
  </Thumb>
);

const GChord = (
  <Thumb>
    <path d="M48,7 A23,23 0 0 1 69,40" fill="none" stroke={C[0]} strokeWidth={5} />
    <path d="M66,44 A23,23 0 0 1 30,44" fill="none" stroke={C[1]} strokeWidth={5} />
    <path d="M27,40 A23,23 0 0 1 44,7" fill="none" stroke={C[2]} strokeWidth={5} />
    <path d="M48,10 C48,30 30,30 30,41 L36,44 C42,34 54,32 54,10 Z" fill={C[0]} opacity={0.4} />
    <path d="M64,40 C52,32 44,36 33,42 L36,46 C48,42 56,46 62,44 Z" fill={C[1]} opacity={0.4} />
  </Thumb>
);

const GHive = (
  <Thumb>
    <line x1={48} y1={28} x2={48} y2={6} stroke={BORDER} strokeWidth={2.5} />
    <line x1={48} y1={32} x2={70} y2={50} stroke={BORDER} strokeWidth={2.5} />
    <line x1={48} y1={32} x2={26} y2={50} stroke={BORDER} strokeWidth={2.5} />
    <path d="M48,12 Q62,28 64,44" fill="none" stroke={C[0]} strokeWidth={1.5} opacity={0.8} />
    <path d="M48,20 Q36,32 32,46" fill="none" stroke={C[1]} strokeWidth={1.5} opacity={0.8} />
    <path d="M34,44 Q48,40 62,46" fill="none" stroke={C[2]} strokeWidth={1.5} opacity={0.8} />
    {[[48, 12], [48, 20], [64, 44], [32, 46], [58, 41]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={3} fill={C[i % 3]} />
    ))}
  </Thumb>
);

const GBundling = (
  <Thumb>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <circle key={i} cx={48 + Math.cos(a) * 24} cy={30 + Math.sin(a) * 24} r={2.8} fill={C[i % 3]} />;
    })}
    <path d="M72,30 C52,22 44,22 28,16" fill="none" stroke={C[0]} strokeWidth={1.3} opacity={0.7} />
    <path d="M68,44 C50,30 46,30 28,16" fill="none" stroke={C[1]} strokeWidth={1.3} opacity={0.7} />
    <path d="M62,11 C48,26 46,28 28,44" fill="none" stroke={C[2]} strokeWidth={1.3} opacity={0.7} />
  </Thumb>
);

const GTree = (
  <Thumb>
    <line x1={48} y1={12} x2={24} y2={34} stroke={BORDER} strokeWidth={1.5} />
    <line x1={48} y1={12} x2={72} y2={34} stroke={BORDER} strokeWidth={1.5} />
    <line x1={24} y1={34} x2={14} y2={50} stroke={BORDER} strokeWidth={1.5} />
    <line x1={24} y1={34} x2={34} y2={50} stroke={BORDER} strokeWidth={1.5} />
    <line x1={72} y1={34} x2={62} y2={50} stroke={BORDER} strokeWidth={1.5} />
    <line x1={72} y1={34} x2={82} y2={50} stroke={BORDER} strokeWidth={1.5} />
    <circle cx={48} cy={12} r={6} fill={C[0]} />
    <circle cx={24} cy={34} r={5} fill={C[1]} />
    <circle cx={72} cy={34} r={5} fill={C[2]} />
    {[[14, 50], [34, 50], [62, 50], [82, 50]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4} fill={i < 2 ? C[1] : C[2]} opacity={0.7} />
    ))}
  </Thumb>
);

const GPacking = (
  <Thumb>
    <circle cx={48} cy={30} r={26} fill="none" stroke={BORDER} strokeWidth={1.5} />
    <circle cx={38} cy={24} r={12} fill={C[0]} opacity={0.7} />
    <circle cx={60} cy={34} r={9} fill={C[1]} opacity={0.7} />
    <circle cx={44} cy={44} r={6} fill={C[2]} opacity={0.7} />
    <circle cx={60} cy={18} r={4} fill={C[2]} opacity={0.5} />
  </Thumb>
);

const GTripleAxis = (
  <Thumb>
    {[30, 22, 34, 18, 28].map((y, i) => (
      <rect key={i} x={10 + i * 16} y={y} width={11} height={54 - y} rx={2} fill={C[0]} opacity={0.5} />
    ))}
    <polyline points="8,36 28,24 48,30 68,16 88,22" fill="none" stroke={C[1]} strokeWidth={2} />
    <polyline points="8,46 28,40 48,42 68,32 88,36" fill="none" stroke={C[2]} strokeWidth={2} strokeDasharray="4 3" />
  </Thumb>
);

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
type ThumbEntry = { label: string; story: string; glyph: React.ReactNode };
type Family = { name: string; items: ThumbEntry[] };

const FAMILIES: Family[] = [
  {
    name: "Interactive · Core",
    items: [
      { label: "Line", story: "charts-interactive-core--line-story", glyph: GLine },
      { label: "Area", story: "charts-interactive-core--area-story", glyph: GArea },
      { label: "Bar", story: "charts-interactive-core--bar-story", glyph: GBar },
      { label: "Donut", story: "charts-interactive-core--donut-story", glyph: GDonut },
      { label: "Radar", story: "charts-interactive-core--radar-story", glyph: GRadar },
      { label: "Scatter / Bubble", story: "charts-interactive-core--scatter-story", glyph: GScatter },
      { label: "Heatmap", story: "charts-interactive-core--heatmap-story", glyph: GHeatmap },
      { label: "Dual Axis", story: "charts-interactive-core--dual-axis-story", glyph: GDualAxis },
    ],
  },
  {
    name: "Interactive · Flow & Hierarchy",
    items: [
      { label: "Treemap", story: "charts-interactive-flow-hierarchy--treemap-story", glyph: GTreemap },
      { label: "Sankey", story: "charts-interactive-flow-hierarchy--sankey-story", glyph: GSankey },
      { label: "Funnel", story: "charts-interactive-flow-hierarchy--funnel-story", glyph: GFunnel },
      { label: "Waterfall", story: "charts-interactive-flow-hierarchy--waterfall-story", glyph: GWaterfall },
      { label: "Streamgraph", story: "charts-interactive-flow-hierarchy--streamgraph-story", glyph: GStreamgraph },
      { label: "Sunburst", story: "charts-interactive-flow-hierarchy--sunburst-story", glyph: GSunburst },
    ],
  },
  {
    name: "Interactive · KPI & Time",
    items: [
      { label: "Gauge", story: "charts-interactive-kpi-time--gauge-story", glyph: GGauge },
      { label: "Bullet", story: "charts-interactive-kpi-time--bullet-story", glyph: GBullet },
      { label: "Sparkline", story: "charts-interactive-kpi-time--sparkline-story", glyph: GSparkline },
      { label: "Brush & Zoom", story: "charts-interactive-kpi-time--brush-story", glyph: GBrush },
      { label: "Candlestick", story: "charts-interactive-kpi-time--candlestick-story", glyph: GCandlestick },
    ],
  },
  {
    name: "Interactive · Distributions",
    items: [
      { label: "Histogram", story: "charts-interactive-distributions--histogram-story", glyph: GHistogram },
      { label: "Box Plot", story: "charts-interactive-distributions--box-plot-story", glyph: GBoxPlot },
      { label: "Violin", story: "charts-interactive-distributions--violin-story", glyph: GViolin },
      { label: "Beeswarm", story: "charts-interactive-distributions--beeswarm-story", glyph: GBeeswarm },
      { label: "Waffle", story: "charts-interactive-distributions--waffle-story", glyph: GWaffle },
      { label: "Dumbbell", story: "charts-interactive-distributions--dumbbell-story", glyph: GDumbbell },
    ],
  },
  {
    name: "Dashboards & States",
    items: [
      { label: "Linked Dashboard", story: "charts-interactive-linked-dashboard--linked-dashboard-story", glyph: GDashboard },
      { label: "States (loading / empty / error)", story: "charts-states--all-three", glyph: GStates },
    ],
  },
  {
    name: "Gallery · Time & KPI extras",
    items: [
      { label: "Radial Bars", story: "charts-overview--chart-gallery", glyph: GRadialBars },
      { label: "Triple Axis", story: "charts-overview--chart-gallery", glyph: GTripleAxis },
      { label: "Confidence Band", story: "charts-kpi-time--kpi-time-gallery", glyph: GConfidence },
      { label: "Word Cloud", story: "charts-kpi-time--kpi-time-gallery", glyph: GWordCloud },
      { label: "Icicle", story: "charts-flow-hierarchy--flow-hierarchy-gallery", glyph: GIcicle },
    ],
  },
  {
    name: "Gallery · Distribution extras",
    items: [
      { label: "Ridgeline", story: "charts-distributions--distributions-gallery", glyph: GRidgeline },
      { label: "Hexbin Density", story: "charts-distributions--distributions-gallery", glyph: GHexbin },
      { label: "Parallel Coordinates", story: "charts-distributions--distributions-gallery", glyph: GParallel },
      { label: "Slope Graph", story: "charts-distributions--distributions-gallery", glyph: GSlope },
      { label: "Lollipop", story: "charts-distributions--distributions-gallery", glyph: GLollipop },
    ],
  },
  {
    name: "Maps & Networks",
    items: [
      { label: "Choropleth", story: "charts-maps--map-gallery", glyph: GChoropleth },
      { label: "Dot Map", story: "charts-maps--map-gallery", glyph: GDotMap },
      { label: "Network Layouts (×22)", story: "charts-network-graphs--layout-gallery", glyph: GNetwork },
    ],
  },
  {
    name: "Graph Idioms",
    items: [
      { label: "Arc Diagram", story: "charts-graph-idioms--idiom-gallery", glyph: GArcDiagram },
      { label: "Adjacency Matrix", story: "charts-graph-idioms--idiom-gallery", glyph: GMatrix },
      { label: "Chord Diagram", story: "charts-graph-idioms--idiom-gallery", glyph: GChord },
      { label: "Hive Plot", story: "charts-graph-idioms--idiom-gallery", glyph: GHive },
      { label: "Edge Bundling", story: "charts-graph-idioms--idiom-gallery", glyph: GBundling },
      { label: "Tidy Tree", story: "charts-graph-idioms--idiom-gallery", glyph: GTree },
      { label: "Circle Packing", story: "charts-graph-idioms--idiom-gallery", glyph: GPacking },
    ],
  },
];

// Resolve the manager URL from inside the canvas iframe, so links work
// locally and on the GitHub Pages subpath alike.
function storyHref(id: string) {
  if (typeof window === "undefined") return "#";
  const base = window.location.pathname.replace(/iframe\.html.*$/, "");
  return `${base}?path=/story/${id}`;
}

function ThumbCard({ entry }: { entry: ThumbEntry }) {
  return (
    <a
      href={storyHref(entry.story)}
      target="_top"
      className="group flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 transition-all hover:border-ring hover:shadow-md"
      style={{ transitionDuration: "var(--duration-fast)" }}
    >
      <div className="overflow-hidden rounded-md bg-background p-1">{entry.glyph}</div>
      <span className="text-xs font-medium text-foreground group-hover:text-primary">{entry.label}</span>
    </a>
  );
}

export const VisualIndex: Story = {
  name: "Visual Index",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chart Index</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Every chart idiom in the system at a glance — {FAMILIES.reduce((a, f) => a + f.items.length, 0)} thumbnails,
            all drawn from the chart tokens. Click any card to open its story; switch the Design Layer to re-theme the index.
          </p>
        </div>
        {FAMILIES.map((family) => (
          <section key={family.name} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{family.name}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {family.items.map((entry) => (
                <ThumbCard key={entry.label} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  ),
};
