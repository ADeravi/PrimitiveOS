// chartLint.ts — the readability gate for charts (the charts' answer to
// diagram/diagramLint). It scores a chart SPEC against the policies that destroy
// quantitative comprehension — dishonest scales, the wrong palette for the data,
// banned encodings, missing takeaway, low contrast — and returns corrections in
// the same vocabulary the pipeline uses. Pure; reuses the DS contrast helper.

import { contrastRatio } from "./contrast";
import type { ChartType, DataShape, Encoding, FieldType } from "./pickChart";

export interface ChartSpec {
  chart: ChartType;
  encoding?: Encoding;
  data?: DataShape;
  options?: {
    /** bar/area baseline — must be 0 (Tenet 8 / Ben Jones). */
    baseline?: number;
    palette?: { type?: "categorical" | "sequential" | "diverging" | "gradient"; colors?: string[] };
    /** a descriptive, takeaway title (Tenet 1 / Knaflic). */
    title?: string;
    dualAxis?: boolean;
    threeD?: boolean;
    exploded?: boolean;
    /** background the marks/labels sit on, for the contrast check. */
    background?: string;
  };
}

export interface ChartViolation { rule: string; severity: "error" | "warn"; detail: string }
export interface ChartCorrection { action: string; reason: string }
export interface ChartLintResult {
  score: number; grade: string; pass: boolean;
  violations: ChartViolation[]; corrections: ChartCorrection[];
  metrics: Record<string, unknown>;
}

const CAP = 6;                 // categorical colour cap (Carbon / Okabe-Ito)
const MIN_NONTEXT = 3;         // WCAG SC 1.4.11 non-text contrast
const BAR = new Set<ChartType>(["bar", "barH"]);
const QUANT_BANNED_GRADIENT = true;

function fieldType(spec: ChartSpec, name?: string): FieldType | undefined {
  if (!name) return undefined;
  return spec.data?.fields?.find((f) => f.name === name)?.type;
}

export function validateChart(spec: ChartSpec): ChartLintResult {
  const o = spec.options || {};
  const v: ChartViolation[] = [];
  const c: ChartCorrection[] = [];
  let penalty = 0;
  const add = (vi: ChartViolation, p: number, corr?: ChartCorrection) => { v.push(vi); penalty += p; if (corr) c.push(corr); };

  // ── banned encodings (they distort the quantity) ───────────────────────────
  if (o.threeD) add({ rule: "banned.threeD", severity: "error", detail: "3-D distorts every length and area — drop the third dimension." }, 0.3, { action: "removeThreeD", reason: "banned.threeD" });
  if (o.exploded) add({ rule: "banned.exploded", severity: "error", detail: "Exploded slices break the shared centre that makes angle readable." }, 0.2, { action: "unexplode", reason: "banned.exploded" });
  if (o.dualAxis) add({ rule: "banned.dualAxis", severity: "error", detail: "Dual axes invite false correlation — split into two charts or index to a base." }, 0.25, { action: "splitAxes", reason: "banned.dualAxis" });
  if (QUANT_BANNED_GRADIENT && o.palette?.type === "gradient") add({ rule: "banned.gradientForMeaning", severity: "error", detail: "A gradient implies a progression it doesn't measure — use a sequential palette." }, 0.2, { action: "useSequential", reason: "banned.gradientForMeaning" });

  // ── scale honesty (Tenet 8) ────────────────────────────────────────────────
  if (BAR.has(spec.chart) && o.baseline != null && o.baseline !== 0)
    add({ rule: "scale.barBaseline", severity: "error", detail: `Bars start at ${o.baseline}, not 0 — length stops encoding magnitude truthfully.` }, 0.3, { action: "zeroBaseline", reason: "scale.barBaseline" });

  // ── palette type matches the data (Carbon) ─────────────────────────────────
  const colorType = fieldType(spec, spec.encoding?.color);
  const pType = o.palette?.type;
  if (colorType === "quantitative" && pType === "categorical")
    add({ rule: "palette.quantitativeAsCategorical", severity: "warn", detail: "A quantitative field is coloured categorically — use a sequential ramp (luminance = magnitude)." }, 0.12, { action: "useSequential", reason: "palette.quantitativeAsCategorical" });
  if ((colorType === "categorical") && (pType === "sequential" || pType === "diverging"))
    add({ rule: "palette.categoricalAsOrdered", severity: "warn", detail: "Unordered categories on an ordered ramp imply a rank that isn't there — use a categorical palette." }, 0.1, { action: "useCategorical", reason: "palette.categoricalAsOrdered" });

  // ── palette cap (Carbon / Okabe-Ito) ───────────────────────────────────────
  const nColors = o.palette?.colors?.length ?? spec.data?.categories ?? 0;
  if ((pType === "categorical" || colorType === "categorical") && nColors > CAP)
    add({ rule: "palette.overflow", severity: "error", detail: `${nColors} categorical colours exceed the cap of ${CAP} — merge the tail into "Other".` }, 0.16, { action: "clampPalette", reason: "palette.overflow" });

  // ── too many slices (pie) ──────────────────────────────────────────────────
  if (spec.chart === "pie" && (spec.data?.categories ?? 0) > CAP)
    add({ rule: "pie.tooManySlices", severity: "warn", detail: `${spec.data?.categories} slices — angle isn't readable past ~6; switch to a bar or treemap.` }, 0.12, { action: "swapChart", reason: "pie.tooManySlices" });

  // ── takeaway title (Tenet 1) ───────────────────────────────────────────────
  if (!o.title || !o.title.trim())
    add({ rule: "title.missing", severity: "warn", detail: "No title — give it the descriptive takeaway, not the metric name (form follows the question)." }, 0.08, { action: "addTakeawayTitle", reason: "title.missing" });

  // ── non-text contrast for the series colours (Carbon SC 1.4.11) ────────────
  let lowContrast = 0;
  if (o.palette?.colors && o.background) {
    for (const col of o.palette.colors) if (contrastRatio(col, o.background) < MIN_NONTEXT) lowContrast++;
    if (lowContrast > 0)
      add({ rule: "contrast.series", severity: "warn", detail: `${lowContrast} series colour(s) under ${MIN_NONTEXT}:1 against the background — darken/strengthen them.` }, 0.1, { action: "gateContrast", reason: "contrast.series" });
  }

  // ── accessibility — always offer the alternative table (Carbon) ────────────
  c.push({ action: "provideAltTable", reason: "accessibility" });

  const score = Math.max(0, Math.min(1, 1 - penalty));
  const grade = score >= 0.9 ? "A" : score >= 0.75 ? "B" : score >= 0.6 ? "C" : score >= 0.4 ? "D" : "F";
  return {
    score, grade,
    pass: grade <= "C" && !v.some((x) => x.severity === "error"),
    violations: v, corrections: c,
    metrics: { colorType, paletteType: pType, nColors, lowContrast },
  };
}
