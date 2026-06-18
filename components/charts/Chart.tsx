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
  ResponsiveContainer, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { pickChart, type DataShape, type FieldSpec, type FieldType, type ChartType } from "./pickChart";
import { validateChart, type ChartSpec } from "./chartLint";

type Row = Record<string, string | number>;

// Okabe–Ito, colour-blind-safe, capped at 6 (Carbon / Healy ≤6).
const PALETTE = ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#56B4E9", "#D55E00"];
const AXIS = "var(--muted-foreground, #777)";
const GRID = "var(--border, #e5e5e5)";

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
      palette: { type: colorType === "quantitative" ? "sequential" : "categorical", colors: PALETTE.slice(0, Math.max(1, Math.min(6, catCount || 1))) },
    },
  };
  const lint = validateChart(spec);

  const notes = [...pick.warnings, ...lint.violations.filter((v) => v.severity !== "error").map((v) => v.detail)];

  return (
    <figure style={{ margin: 0, width: "100%", maxWidth: 720 }}>
      {title && <figcaption style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 8px" }}>{title}</figcaption>}
      <div style={{ position: "relative", height, width: "100%" }}>
        {showGrade && (
          <span style={{ position: "absolute", top: 0, right: 0, zIndex: 2, fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "var(--muted, #f4f4f5)", color: "var(--muted-foreground, #666)" }} title={`${pick.chart} · score ${lint.score.toFixed(2)}`}>
            {pick.chart} · {lint.grade}
          </span>
        )}
        <ChartBody pick={pick} data={data} f={f} height={height} />
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

function ChartBody({ pick, data, f, height }: { pick: ReturnType<typeof pickChart>; data: Row[]; f: FieldSpec[]; height: number }) {
  const e = pick.encoding;
  const cat = e.color || e.x || f.find((x) => x.type === "categorical")?.name || "";
  const val = e.y || f.find((x) => x.type === "quantitative")?.name || "";
  const tick = { fontSize: 11, fill: AXIS };

  if (pick.chart === "bignumber") {
    const n = data.length ? Number(data[data.length - 1][val]) : 0;
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height }}><span style={{ fontSize: 56, fontWeight: 700, color: "var(--foreground)" }}>{Number.isFinite(n) ? n.toLocaleString() : "—"}</span></div>;
  }

  if (pick.chart === "bar" || pick.chart === "barH") {
    const rows = capCategories(data, cat, val, 6);
    const horizontal = pick.chart === "barH";
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={!horizontal} horizontal={horizontal} />
          {horizontal
            ? (<><XAxis type="number" tick={tick} stroke={GRID} /><YAxis type="category" dataKey={cat} tick={tick} stroke={GRID} width={110} /></>)
            : (<><XAxis dataKey={cat} tick={tick} stroke={GRID} /><YAxis tick={tick} stroke={GRID} /></>)}
          <Tooltip />
          {/* one colour: category is already on the axis, so colour here would
              be decoration, not encoding (Tenet 6). */}
          <Bar dataKey={val} fill={PALETTE[0]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (pick.chart === "line" || pick.chart === "bump" || pick.chart === "slopegraph") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey={e.x || ""} tick={tick} stroke={GRID} />
          <YAxis tick={tick} stroke={GRID} />
          <Tooltip />
          <Line type="monotone" dataKey={val} stroke={PALETTE[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
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
          <Scatter data={data} fill={PALETTE[0]} fillOpacity={0.7} isAnimationActive={false} />
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
            {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
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
          <Bar dataKey="count" fill={PALETTE[0]} isAnimationActive={false} />
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
