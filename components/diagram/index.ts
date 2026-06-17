// The Diagram guardrail family — components whose API IS the policy.
export { Diagram, default } from "./Diagram";
export type { DiagramProps } from "./Diagram";
export { SequenceDiagram } from "./SequenceDiagram";
export type { SequenceDiagramProps } from "./SequenceDiagram";
export { GroupLayer } from "./GroupLayer";
export type { GroupLayerProps } from "./GroupLayer";
// Shared Grouping & Proximity layer (used by both diagram families + the linter).
export { detectGroups, groupOf, convexHull, hullPath, laneBands, proximityReport, regionOverlaps, edgeLengthReport, chooseEncoding } from "./grouping";
export type { ProximityReport, Pt, GNode, GEdge } from "./grouping";
// Structured-diagram meaning types (flow / tree / state / er / swimlane / sequence).
export type { DiagramKind, NodeRole, EdgeKind, SNode, SEdge } from "./types";
// WCAG contrast helpers (Policy 2 / Tenet 6 — text colour by measured contrast).
export { contrastRatio, readableOn, ensureContrast } from "../charts/network";
// God-layer internals (used by Policies / Linter docs + the network family).
export { buildDiagram, simpleLayout } from "./buildDiagram";
export type { BuildResult } from "./buildDiagram";
export { validate, separateOverlaps, thinLabels, clampPalette, computeMetrics, DEFAULTS } from "./diagramLint";
export { pickIdiom, computeShape } from "./idiomPicker";
export type { Contract, DNode, DEdge, DView, LintResult, Violation, Correction } from "./types";
