// logic.ts — the dependency-free CHART brain, published for consumers (the
// Symantic Visualiser + the MCP render service) that need the chooser + linter
// WITHOUT the React component layer. No "@/" aliases, no React, no recharts —
// pure TS, so a bundler (Vite/esbuild) can consume it straight from source.
//
// Exposed as `scntw-ds/charts` via package.json "exports". The full React
// components (ChartBar, ChartSankey, …) require a library build and ship
// separately (see components/charts/index.ts + SCNTW-CONSISTENCY.md, Phase 2).

export { pickChart, CHART_INTENT_MAP } from "./pickChart";
export type {
  FieldType, FieldSpec, DataShape, ChartType, Encoding, ChartPick,
} from "./pickChart";

export { validateChart } from "./chartLint";
export type {
  ChartSpec, ChartViolation, ChartCorrection, ChartLintResult,
} from "./chartLint";

export { contrastRatio } from "./contrast";
