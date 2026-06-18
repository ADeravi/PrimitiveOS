"use client";
// Chart.tsx — the charts' guardrail component (the peer of <Diagram>).
//
// Meaning-only API: you pass the QUESTION (intent), the DATA, and optionally the
// takeaway title — never a chart type, never a baseline, never "make it 3D". The
// pipeline runs inside: pickChart (intent + data shape → chart, key quantity on
// position) → principled defaults (zero baseline, capped colour-blind-safe
// palette, one positional encoding) → validateChart (the gate) → render. A
// dishonest chart (non-zero bars, 3-D, a rainbow of categories) is unrepresentable,
// and every chart carries an alternative data table.

import * as React from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { pickChart, type DataShape, type FieldSpec, type FieldType, type ChartType } from "./pickChart";
import { validateChart, type ChartSpec } from "./chartLint";
import { oklchToRgb, ensureContrast } from "./contrast";
import { TYPE } from "../foundation/primitives"; // shared foundation tier (type ramp)

type Row = Record<string, string | number>;

// Okabe–Ito, colour-blind-safe, capped at 6 (Carbon / Healy ≤6). This is the
// FALLBACK — see usePalette: at runtime <Chart> prefers the active Design Layer's
// --chart-* tokens, contrast-gated, so it re-themes AND stays accessible.
const FALLBACK = ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#56B4E9", "#D55E00"];
const AXIS = "var(--muted-foreground, #777)";
const GRID = "var(--border, #e5e5e5)";

// Read the Design Layer's --chart-1…6 tokens, convert oklch→sRGB, and gate each
// against the background to the non-text 3:1 floor (Carbon SC 1.4.11). Any token
// that's missing or can't be made to clear the floor falls back to Okabe-Ito.
// Re-reads on layer/theme switches via a MutationObserver. Theming AND contrast.
function usePalette(ref: React.RefObject<HTMLElement | null>) {
  const [pal, setPal] = React.useState<string[]>(FALLBACK);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof getComputedStyle === "undefined") return;
    const read = () => {
      const cs = getComputedStyle(el);
      const bgRaw = cs.getPropertyValue("--background").trim() || "#ffffff";
      const bg = bgRaw.toLowerCase().startsWith("oklch") ? oklchToRgb(bgRaw) : bgRaw;
      const next = FALLBACK.map((fb, i) => {
        const raw = cs.getPropertyValue(`--chart-${i + 1}`).trim();
        if (!raw) return fb;
        const rgb = raw.toLowerCase().startsWith("oklch") ? oklchToRgb(raw) : raw;
        const gated = ensureContrast(rgb, bg, 3);
        return gated || fb;
      });
      setPal(next);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => mo.disconnect();
  }, [ref]);
  return pal;
}

function inferFields(data: Row[], fields?: FieldSpec[]): FieldSpec[] {
  if (fields?.length) return fields;
  const first = data[0] || {};
  return Object.keys(first).map((name) => {
    const vals = data.map((r) => r[name]);
    const allNum = vals.every((v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))));
    if (allNum) return { name, type: "quantitative" as FieldType };
    const allDate = vals.every((v) => typeof v === "string" && !isNaN(Date.parse(v)));
    return { name, type: (allDate ? "temporal" : "categorical") as FieldType };
  });
}

// merge categorical tail beyond the cap into "Other" so the palette never recycles.
function capCategories(data: Row[], key: string, valKey: string, cap = 6): Row[] {
  if (!key) return data;
  const sorted = [...data].sort((a, b) => Number(b[valKey] ?? 0) - Number(a[valKey] ?? 0));
  if (sorted.length <= cap) return sorted;
  const head = sorted.slice(0, cap - 1);
  const tail = sorted.slice(cap - 1);
  const other: Row = { [key]: `Other (${tail.length})`, [valKey]: tail.reduce((s, r) => s + Number(r[valKey] ?? 0), 0) };
  return [...head, other];
}

export interface ChartProps {
  /** the question the chart answers — never a chart type. */
  intent: string;
  data: Row[];
  /** field types; inferred from the data when omitted. */
  fields?: FieldSpec[];
  /** the takeaway (Tenet 1). Omitting it is allowed but the linter flags it. */
  title?: string;
  height?: number;
  showGrade?: boolean;
}

export function Chart({ intent, data = [], fields, title, height = 300, showGrade = false }: ChartProps) {
  const hostRef = React.useRef<HTMLElement>(null);
  const palette = usePalette(hostRef);
  const f = React.useMemo(() => inferFields(data, fields), [data, fields]);
  const catField = f.find((x) => x.type === "categorical");
  const catCount = catField ? new Set(data.map((r) => r[catField.name])).size : 0;
  const shape: DataShape = { fields: f, rows: data.length, categories: catCount };

  const pick = React.useMemo(() => pickChart({ intent, data: shape }), [intent, shape]);
  const colorType = f.find((x) => x.name === pick.encoding.color)?.type;

  const spec: ChartSpec = {
    chart: pick.chart, encoding: pick.encoding, data: shape,
    options: {
      baseline: 0, title,
      palette: { type: colorType === "quantitative" ? "sequential" : "categorical", colors: palette.slice(0, Math.max(1, Math.min(6, catCount || 1))) },
    },
  };
  const lint = validateChart(spec);

  const notes = [...pick.warnings, ...lint.violations.filter((v) => v.severity !== "error").map((v) => v.detail)];

  return (
    <figure ref={hostRef} style={{ margin: 0, width: "100%", maxWidth: 720 }}>
      {title && <figcaption style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 8px" }}>{title}</figcaption>}
      <div style={{ position: "relative", height, width: "100%" }}>
        {showGrade && (
          <span style={{ position: "absolute", top: 0, right: 0, zIndex: 2, fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "var(--muted, #f4f4f5)", color: "var(--muted-foreground, #666)" }} title={`${pick.chart} · score ${lint.score.toFixed(2)}`}>
            {pick.chart} · {lint.grade}
          </span>
        )}
        <ChartBody pick={pick} data={data} f={f} height={height} palette={palette} />
      </div>
      {notes.length > 0 && (
        <figcaption style={{ marginTop: 8, fontSize: 11.5, color: "var(--muted-foreground, #777)", lineHeight: 1.45 }}>{notes.join(" · ")}</figcaption>
      )}
      <details style={{ marginTop: 6, fontSize: 11.5, color: "var(--muted-foreground, #777)" }}>
        <summary style={{ cursor: "pointer" }}>Data table</summary>
        <table style={{ borderCollapse: "collapse", fontSize: 11, marginTop: 8 }}>
          <thead><tr>{f.map((c) => <th key={c.name} style={{ textAlign: "left", padding: "2px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>{c.name}</th>)}</tr></thead>
          <tbody>{data.slice(0, 50).map((r, i) => <tr key={i}>{f.map((c) => <td key={c.name} style={{ padding: "2px 8px", borderBottom: "1px solid var(--border)", color: "var(--foreground)" }}>{String(r[c.name])}</td>)}</tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

function ChartBody({ pick, data, f, height, palette }: { pick: ReturnType<typeof pickChart>; data: Row[]; f: FieldSpec[]; height: number; palette: string[] }) {
  const e = pick.encoding;
  const cat = e.color || e.x || f.find((x) => x.type === "categorical")?.name || "";
  const val = e.y || f.find((x) => x.type === "quantitative")?.name || "";
  const series = (e.series && e.series.length ? e.series : [val]).filter(Boolean);
  const multi = series.length > 1;
  const tick = { fontSize: TYPE.caption.size, fill: AXIS }; // on the shared type ramp

  if (pick.chart === "bignumber") {
    const n = data.length ? Number(data[data.length - 1][val]) : 0;
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height }}><span style={{ fontSize: 56, fontWeight: 700, color: "var(--foreground)" }}>{Number.isFinite(n) ? n.toLocaleString() : "—"}</span></div>;
  }

  if (pick.chart === "bar" || pick.chart === "barH") {
    const horizontal = pick.chart === "barH";
    // single series → sort + cap (rank); grouped series → keep data order.
    const rows = multi ? data : capCategories(data, cat, val, 6);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={!horizontal} horizontal={horizontal} />
          {horizontal
            ? (<><XAxis type="number" tick={tick} stroke={GRID} /><YAxis type="category" dataKey={e.x || cat} tick={tick} stroke={GRID} width={110} /></>)
            : (<><XAxis dataKey={e.x || cat} tick={tick} stroke={GRID} /><YAxis tick={tick} stroke={GRID} /></>)}
          <Tooltip />
          {multi && <Legend />}
          {/* single series: ONE colour (category is already on the axis, so colour
              would be decoration — Tenet 6). grouped: colour now encodes series. */}
          {series.map((s, i) => (
            <Bar key={s} dataKey={s} fill={palette[i % palette.length]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (pick.chart === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={e.x || cat} tick={tick} stroke={GRID} />
          <YAxis tick={tick} stroke={GRID} />
          <Tooltip />
          {multi && <Legend />}
          {/* stacked from a zero baseline — the silhouette reads as the total. */}
          {series.map((s, i) => (
            <Area key={s} type="monotone" dataKey={s} stackId="1" stroke={palette[i % palette.length]} fill={palette[i % palette.length]} fillOpacity={0.45} isAnimationActive={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (pick.chart === "line" || pick.chart === "bump" || pick.chart === "slopegraph") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey={e.x || cat} tick={tick} stroke={GRID} />
          <YAxis tick={tick} stroke={GRID} />
          <Tooltip />
          {multi && <Legend />}
          {series.map((s, i) => (
            <Line key={s} type="monotone" dataKey={s} stroke={palette[i % palette.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (pick.chart === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis type="number" dataKey={e.x || ""} name={e.x} tick={tick} stroke={GRID} />
          <YAxis type="number" dataKey={e.y || ""} name={e.y} tick={tick} stroke={GRID} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill={palette[0]} fillOpacity={0.7} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (pick.chart === "pie") {
    const rows = capCategories(data, cat, val, 6);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={rows} dataKey={val} nameKey={cat} startAngle={90} endAngle={-270} innerRadius={0} outerRadius={Math.min(height, 280) / 2.6} isAnimationActive={false} label>
            {rows.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          </Pie>
          <Legend /><Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // histogram → bin the quantitative field into bars
  if (pick.chart === "histogram") {
    const q = e.x || val;
    const nums = data.map((r) => Number(r[q])).filter((n) => Number.isFinite(n));
    const min = Math.min(...nums), max = Math.max(...nums);
    const bins = 10, w = (max - min) / bins || 1;
    const hist = Array.from({ length: bins }, (_, i) => ({ bin: `${Math.round(min + i * w)}`, count: nums.filter((n) => n >= min + i * w && n < min + (i + 1) * w).length }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={hist} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="bin" tick={tick} stroke={GRID} /><YAxis tick={tick} stroke={GRID} /><Tooltip />
          <Bar dataKey="count" fill={palette[0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // not yet rendered (treemap / sankey / box / choropleth) → the data table is the honest fallback.
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, color: "var(--muted-foreground)", fontSize: 12.5, textAlign: "center", padding: 16 }}>
      <span><strong>{pick.chart}</strong> isn&apos;t rendered by &lt;Chart&gt; yet — see the data table below. The policy still chose it as the right idiom.</span>
    </div>
  );
}

export default Chart;
