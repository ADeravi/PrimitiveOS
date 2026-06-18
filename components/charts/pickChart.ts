// pickChart.ts — the chart-chooser (the charts' answer to diagram/idiomPicker).
//
// Form follows the question (Manifesto Tenet 1): the caller supplies an INTENT
// and the DATA SHAPE, never a chart type. This pure function maps that to one
// chart + an encoding that puts the key quantity on POSITION (the most accurate
// channel — Cleveland/Munzner; DATAVIZ-PRINCIPLES). The data can veto the intent,
// because a readable chart depends on what the data actually is.

export type FieldType = "quantitative" | "categorical" | "temporal" | "ordinal";
export interface FieldSpec { name: string; type: FieldType }
export interface DataShape {
  fields: FieldSpec[];
  rows?: number;
  /** distinct values in the primary categorical field, if known. */
  categories?: number;
}

export type ChartType =
  | "bignumber" | "bar" | "barH" | "line" | "area" | "slopegraph" | "bump"
  | "scatter" | "histogram" | "box" | "pie" | "treemap" | "waffle"
  | "sankey" | "dendrogram" | "choropleth" | "table";

export interface Encoding { x?: string; y?: string; color?: string; size?: string; note?: string;
  /** multiple quantitative series share one axis (grouped bars, multi-line, stacked area). */
  series?: string[];
}
export interface ChartPick {
  chart: ChartType;
  encoding: Encoding;
  reason: string;
  warnings: string[];
  alternatives: ChartType[];
}

const INTENT: Record<string, ChartType> = {
  trend: "line", time: "line", change: "line", evolution: "line", over_time: "line",
  rank: "bar", compare: "bar", magnitude: "bar", ranking: "bar", top: "bar",
  share: "pie", proportion: "pie", composition: "pie", part_to_whole: "pie",
  stacked: "area", area: "area", cumulative: "area",
  relationship: "scatter", correlation: "scatter", scatter: "scatter",
  distribution: "histogram", spread: "histogram",
  flow: "sankey", transfer: "sankey",
  hierarchy: "treemap", breakdown: "treemap", nesting: "treemap",
  slope: "slopegraph", two_points: "slopegraph",
  rank_over_time: "bump",
  single: "bignumber", kpi: "bignumber", number: "bignumber",
  geographic: "choropleth", map: "choropleth", spatial: "choropleth",
};

function resolveIntent(intent: string): ChartType {
  const k = String(intent).toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
  if (INTENT[k]) return INTENT[k];
  for (const [word, c] of Object.entries(INTENT)) if (k.includes(word.split("_")[0])) return c;
  return "bar";
}

const REASONS: Partial<Record<ChartType, string>> = {
  bignumber: "A single value reads best as the number itself, large and labelled.",
  bar: "Magnitude/rank compares most accurately as length on a common zero baseline.",
  barH: "Long category labels read better horizontal; still length on a zero baseline.",
  line: "Time owns the horizontal axis; the connected line carries the trend.",
  area: "Parts of a whole across an axis — stacked bands; total reads as the silhouette.",
  slopegraph: "Two time points — a slope shows each item's change directly.",
  scatter: "A relationship between two measures lives in position on both axes.",
  histogram: "A distribution is the shape of one measure binned along its axis.",
  box: "Comparing distributions across groups — boxes summarise each group's spread.",
  pie: "A few parts of one whole — angle reads the share (use sparingly).",
  treemap: "Many parts of one whole / a hierarchy — nested area, position = membership.",
  sankey: "A flow between stages — ribbon width carries the magnitude.",
  choropleth: "A value over geography — position is the map; colour is sequential.",
  table: "Mixed units or exact lookup — a table fades back and stays precise.",
};

export function pickChart(input: { intent: string; data: DataShape }): ChartPick {
  const { intent, data } = input;
  const f = data.fields || [];
  const quant = f.filter((x) => x.type === "quantitative");
  const cat = f.filter((x) => x.type === "categorical");
  const time = f.filter((x) => x.type === "temporal" || x.type === "ordinal");
  const cats = data.categories ?? (cat[0] ? data.rows ?? 0 : 0);
  const warnings: string[] = [];
  const alternatives: ChartType[] = [];
  let chart = resolveIntent(intent);

  // ── data vetoes ────────────────────────────────────────────────────────────
  if (chart === "line" && time.length === 0) {
    warnings.push("Trend intent but no temporal/ordinal field — time can't own an axis; ranking the values instead.");
    chart = "bar";
  }
  if (chart === "scatter" && quant.length < 2) {
    warnings.push("Relationship intent but fewer than two quantitative fields — a relationship needs two measures.");
    chart = quant.length === 1 ? "histogram" : "bar";
  }
  if (chart === "pie") {
    if (cats > 6) { warnings.push(`Share intent but ${cats} parts — angle stops being readable past ~6; use a bar or treemap.`); chart = cats > 12 ? "treemap" : "bar"; }
    else alternatives.push("waffle", "barH");
  }
  if (chart === "bar" && cat[0] && (data.categories ?? 0) > 12) {
    warnings.push("Many categories — sort descending and consider horizontal bars or a Top-N cut.");
    chart = "barH";
  }
  if (chart === "histogram" && quant.length === 0) {
    warnings.push("Distribution intent but no quantitative field.");
    chart = "bar";
  }
  if (chart === "area" && quant.length === 0) {
    warnings.push("Composition intent but no quantitative series to stack.");
    chart = "bar";
  }

  // ── encoding (position carries the key quantity) ───────────────────────────
  const enc: Encoding = {};
  const allQuant = quant.map((q) => q.name);
  switch (chart) {
    case "bar": case "barH": enc.x = cat[0]?.name ?? time[0]?.name; enc.y = quant[0]?.name; if (quant.length > 1) enc.series = allQuant; enc.note = quant.length > 1 ? "grouped — one bar per series, common zero baseline" : "zero baseline, sorted by value"; break;
    case "area": enc.x = time[0]?.name ?? cat[0]?.name; enc.y = quant[0]?.name; enc.series = allQuant; enc.note = "stacked — parts of a whole across the axis (non-negative only)"; break;
    case "line": case "bump": enc.x = time[0]?.name ?? cat[0]?.name; enc.y = quant[0]?.name; enc.color = cat[0]?.name; if (quant.length > 1) enc.series = allQuant; enc.note = "emphasise only the series that matter"; break;
    case "slopegraph": enc.x = time[0]?.name; enc.y = quant[0]?.name; enc.color = cat[0]?.name; break;
    case "scatter": enc.x = quant[0]?.name; enc.y = quant[1]?.name; enc.color = cat[0]?.name; enc.size = quant[2]?.name; break;
    case "histogram": case "box": enc.x = quant[0]?.name; enc.color = cat[0]?.name; break;
    case "pie": case "treemap": case "waffle": enc.color = cat[0]?.name; enc.size = quant[0]?.name; break;
    case "sankey": enc.note = "stage = position (rank), thickness = magnitude"; break;
    case "choropleth": enc.color = quant[0]?.name; enc.note = "sequential palette, luminance = magnitude"; break;
    case "bignumber": enc.y = quant[0]?.name; break;
    default: break;
  }

  return { chart, encoding: enc, reason: REASONS[chart] ?? REASONS.bar!, warnings, alternatives: [...new Set(alternatives)].filter((a) => a !== chart) };
}

export { INTENT as CHART_INTENT_MAP };
