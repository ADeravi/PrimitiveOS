import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { pickChart } from "@/components/charts/pickChart";
import { validateChart, type ChartSpec } from "@/components/charts/chartLint";

// Living documentation for the chart policy model — the same pipeline as the
// diagram guardrails, with the rule set swapped for charts. Canonical source:
// components/charts/CHART-POLICIES.md.

const wrap: React.CSSProperties = { maxWidth: 820, color: "var(--foreground)", fontFamily: "var(--font-sans, inherit)", lineHeight: 1.55, fontSize: 14 };
const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, margin: "0 0 4px" };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: "22px 0 6px" };
const lead: React.CSSProperties = { color: "var(--muted-foreground)", margin: "0 0 8px" };
const code: React.CSSProperties = { fontFamily: "var(--font-mono, ui-monospace, monospace)", background: "var(--muted)", padding: "1px 5px", borderRadius: 4, fontSize: 12.5 };
const card: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", background: "var(--card, var(--background))" };
const th: React.CSSProperties = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" };
const tdc: React.CSSProperties = { padding: "6px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top" };

const TENETS: [string, string][] = [
  ["1 · Form follows the question", "pickChart(intent, dataShape) chooses the chart; the title is the takeaway, not the metric."],
  ["3 · Position first", "the key quantity goes on an axis — the most accurate channel; colour = category, size = coarse."],
  ["6 · One accent, consistent colour", "grey the field, spend one accent; capped, colour-blind-safe palette."],
  ["7 · Declutter to the data", "drop gridlines, borders, redundant axes — data-ink."],
  ["8 · Tell the truth", "bars hit zero, no dual axis, honest aspect, mark unknown, count dropped rows."],
];

const RULES: [string, string][] = [
  ["banned.threeD / exploded / dualAxis", "distorted length/area, false correlation"],
  ["scale.barBaseline", "bars not starting at 0 — length stops being truthful"],
  ["palette.quantitativeAsCategorical", "ordered data on a categorical palette → use sequential"],
  ["palette.overflow", "> 6 categorical colours → merge tail to “Other”"],
  ["pie.tooManySlices", "angle unreadable past ~6 → bar / treemap"],
  ["title.missing", "no takeaway title (Tenet 1)"],
  ["contrast.series", "series colour < 3:1 on its background (Carbon SC 1.4.11)"],
];

function Policies() {
  return (
    <article style={wrap}>
      <h1 style={h1}>Chart policies — the same model, swapped rule set</h1>
      <p style={lead}>Charts share the diagram pipeline (schema gate → principled defaults → <span style={code}>validate()</span> → alt-table) and the 10-tenet manifesto. Only the rules change: a chart is judged on <em>encoding effectiveness, scale honesty, palette fit</em>. Full text + citations in <span style={code}>components/charts/CHART-POLICIES.md</span>.</p>
      <div style={card}><strong>The chooser:</strong> <span style={code}>pickChart(intent, dataShape)</span> picks the chart and puts the key quantity on position; the data can veto the intent. <strong>The gate:</strong> <span style={code}>validateChart(spec)</span> refuses the dishonest result.</div>

      <h2 style={h2}>The manifesto, on charts</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead><tr><th style={th}>Tenet</th><th style={th}>On a chart</th></tr></thead>
        <tbody>{TENETS.map(([a, b]) => <tr key={a}><td style={tdc}><strong>{a}</strong></td><td style={tdc}>{b}</td></tr>)}</tbody>
      </table>

      <h2 style={h2}>What validateChart enforces</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead><tr><th style={th}>Rule</th><th style={th}>Catches</th></tr></thead>
        <tbody>{RULES.map(([a, b]) => <tr key={a}><td style={tdc}><span style={code}>{a}</span></td><td style={tdc}>{b}</td></tr>)}</tbody>
      </table>
    </article>
  );
}

function Report({ spec, note }: { spec: ChartSpec; note: string }) {
  const r = validateChart(spec);
  const mono = { fontFamily: "var(--font-mono, ui-monospace, monospace)" } as const;
  return (
    <div style={{ ...card, marginBottom: 14 }}>
      <div style={{ ...mono, fontWeight: 700 }}>{spec.chart} · {note} → {r.grade} · {r.score.toFixed(2)} {r.pass ? "✓ pass" : "✗ fix"}</div>
      <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
        {r.violations.length === 0 && <li style={{ color: "var(--muted-foreground)" }}>no violations.</li>}
        {r.violations.map((v, i) => <li key={i}><span style={{ color: v.severity === "error" ? "var(--destructive, #c0392b)" : "var(--muted-foreground)" }}>[{v.severity}] {v.rule}</span> — {v.detail}</li>)}
      </ul>
    </div>
  );
}

const GOOD: ChartSpec = {
  chart: "bar", encoding: { x: "region", y: "revenue", color: "region" },
  data: { fields: [{ name: "region", type: "categorical" }, { name: "revenue", type: "quantitative" }], categories: 4 },
  options: { baseline: 0, title: "Revenue is concentrated in the top three regions", palette: { type: "categorical", colors: ["#0072B2", "#009E73", "#CC79A7", "#56B4E9"] }, background: "#ffffff" },
};
const BAD: ChartSpec = {
  chart: "bar", encoding: { color: "region" },
  data: { fields: [{ name: "region", type: "categorical" }], categories: 9 },
  options: { baseline: 50, threeD: true, palette: { type: "categorical", colors: ["#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777"] }, background: "#ffffff" },
};

function Linter() {
  return (
    <article style={wrap}>
      <h1 style={h1}>The chart linter, exposed</h1>
      <p style={lead}>Two specs through <span style={code}>validateChart</span> — the rules are inspectable, not just asserted. (Picker example: <span style={code}>pickChart("trend over time", …)</span> → <strong>{pickChart({ intent: "trend over time", data: { fields: [{ name: "m", type: "temporal" }, { name: "v", type: "quantitative" }] } }).chart}</strong>.)</p>
      <Report spec={GOOD} note="honest bar" />
      <Report spec={BAD} note="3D, non-zero baseline, 9 colours, no title" />
    </article>
  );
}

const meta: Meta = { title: "Charts/Policies", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

export const Policies_: S = { name: "Policies (the model)", render: () => <Policies /> };
export const Linter_: S = { name: "Linter (good vs bad spec)", render: () => <Linter /> };
