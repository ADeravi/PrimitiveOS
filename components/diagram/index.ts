// The Diagram guardrail family — components whose API IS the policy.
export { Diagram, default } from "./Diagram";
export type { DiagramProps } from "./Diagram";
export { buildDiagram, simpleLayout } from "./buildDiagram";
export type { BuildResult } from "./buildDiagram";
export { validate, separateOverlaps, thinLabels, clampPalette, computeMetrics, DEFAULTS } from "./diagramLint";
export { pickIdiom, computeShape } from "./idiomPicker";
export type { Contract, DNode, DEdge, DView, LintResult, Violation, Correction } from "./types";
