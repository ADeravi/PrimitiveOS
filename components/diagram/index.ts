// The Diagram guardrail family — components whose API IS the policy.
export { Diagram, default } from "./Diagram";
export type { DiagramProps } from "./Diagram";
export { SequenceDiagram } from "./SequenceDiagram";
export type { SequenceDiagramProps } from "./SequenceDiagram";
// Structured-diagram meaning types (flow / tree / state / er / swimlane / sequence).
export type { DiagramKind, NodeRole, EdgeKind, SNode, SEdge } from "./types";
// God-layer internals (used by Policies / Linter docs + the network family).
export { buildDiagram, simpleLayout } from "./buildDiagram";
export type { BuildResult } from "./buildDiagram";
export { validate, separateOverlaps, thinLabels, clampPalette, computeMetrics, DEFAULTS } from "./diagramLint";
export { pickIdiom, computeShape } from "./idiomPicker";
export type { Contract, DNode, DEdge, DView, LintResult, Violation, Correction } from "./types";
