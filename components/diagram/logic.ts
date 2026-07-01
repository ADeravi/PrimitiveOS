// logic.ts — the dependency-free DIAGRAM god-layer (pick → layout → validate →
// auto-correct), published for consumers that need the brain without the React
// component layer. This is the canonical source the Symantic Visualiser's
// src/lint/ fork should be deleted in favour of (see SCNTW-CONSISTENCY.md).
//
// No "@/" aliases, no React, no cytoscape/elk — pure TS. The ELK layout is
// INJECTED (buildDiagram takes a layout fn; `simpleLayout` is the bundled
// fallback), so this module has zero runtime dependencies.
//
// Exposed as `scntw-ds/diagram` via package.json "exports". The React guardrail
// components (Diagram, SequenceDiagram, GroupLayer) need a library build and
// ship separately (see components/diagram/index.ts + SCNTW-CONSISTENCY.md).

export { pickIdiom, computeShape } from "./idiomPicker";

export { buildDiagram, simpleLayout } from "./buildDiagram";
export type { BuildResult } from "./buildDiagram";

export {
  validate, separateOverlaps, thinLabels, clampPalette, computeMetrics, DEFAULTS,
} from "./diagramLint";

export { mdsPositions, graphDistances } from "./mds";
export type { MdsResult } from "./mds";

export {
  detectGroups, groupOf, convexHull, hullPath, laneBands,
  proximityReport, regionOverlaps, edgeLengthReport, chooseEncoding,
} from "./grouping";
export type { ProximityReport, Pt, GNode, GEdge } from "./grouping";

export type {
  Contract, DNode, DEdge, DView, LintResult, Violation, Correction,
  DiagramKind, NodeRole, EdgeKind, SNode, SEdge,
} from "./types";
