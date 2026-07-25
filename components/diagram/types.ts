// Shared types for the Diagram guardrail family. See the Diagram › Policies
// docs (DIAGRAM-QUALITY, GUARDRAIL-COMPONENTS) for the rules these enforce.

export type Contract =
  | "force"
  | "hierarchy"
  | "similarity"
  | "concentric"
  | "circle"
  | "grid"
  | "matrix"
  | "timeline";

/** A node. AI supplies id/label/group/year/dated; layout adds x/y/w/h. */
export interface DNode {
  id: string;
  label?: string;
  group?: number | string;
  degree?: number;
  year?: number;
  dated?: boolean;
  sim?: number;
  embedded?: boolean;
  // added by layout / corrections:
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  showLabel?: boolean;
  offAxis?: boolean;
}

export interface DEdge {
  source: string;
  target: string;
}

/** A laid-out view handed to the linter. */
export interface DView {
  contract: Contract | string;
  nodes: DNode[];
  edges: DEdge[];
  zoom?: number;
  palette?: { maxColors?: number };
}

export interface Violation {
  rule: string;
  severity: "error" | "warn";
  detail: string;
  ids?: string[];
}

export interface Correction {
  action: string;
  reason?: string;
  to?: string;
  max?: number;
}

export interface LintResult {
  score: number;
  grade: string;
  pass: boolean;
  metrics: Record<string, unknown>;
  violations: Violation[];
  corrections: Correction[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured-diagram family (box-and-arrow). Distinct from the network/graph
// contracts above: here a node is a typed *element* (step, state, entity, actor)
// and an edge is a typed *connector* (flow, transition, relation, message). The
// caller supplies meaning (kind + roles + labels); the engine owns the form
// (orthogonal routing, layering, lane bands) — never the other way round.
// ─────────────────────────────────────────────────────────────────────────────

/** Which diagram idiom. Picked from intent; the data can still veto it. */
export type DiagramKind = "flow" | "tree" | "state" | "er" | "swimlane" | "cluster" | "similarity" | "sequence";

/** The semantic role of an element — drives shape, never colour-by-hand. */
export type NodeRole =
  | "start"
  | "end"
  | "process"
  | "decision"
  | "io"
  | "subprocess"
  | "state"
  | "entity"
  | "actor"
  | "node";

/** A typed connector. `kind` drives arrowhead + dashing; labels ride the edge. */
export type EdgeKind =
  | "flow"
  | "yes"
  | "no"
  | "transition"
  | "relation"
  | "message"
  | "return"
  | "async";

/** A structured element. Meaning only — no x/y/colour. */
export interface SNode {
  id: string;
  label?: string;
  role?: NodeRole;
  /** community / category — drives colour + common-region enclosure (hulls). */
  group?: string | number;
  /** MULTI-MEMBERSHIP. A node genuinely in two groups sits in their INTERSECTION —
   *  the overlap of the two regions — and is held there: it moves whenever either
   *  group moves and cannot drift out of the shared zone. This is the only thing
   *  that earns an overlap; regions with no shared node are pushed apart, because
   *  an overlap with nothing in it asserts a shared membership that isn't real. */
  groups?: string[];
  /** swimlane assignment (lane name). */
  lane?: string;
  /** ER entity attributes, rendered inside the box. */
  attrs?: string[];
  /** state-machine markers. */
  initial?: boolean;
  final?: boolean;
  /** uncertain / unknown provenance — shown and MARKED, never silently dropped
   *  (Tenet 8). Renders dashed + muted with a "?" so it can't pass as certain. */
  unknown?: boolean;
  /** AI-derived, not asserted fact (Tenet 9). Rendered in the --rose provenance
   *  accent so inference is never mistaken for ground truth. */
  inferred?: boolean;
}

/** A structured connector. Meaning only. */
export interface SEdge {
  source: string;
  target: string;
  label?: string;
  kind?: EdgeKind;
  /** ER cardinality, e.g. "1", "*", "1..N". */
  card?: string;
  /** uncertain connection — rendered dashed + faint (Tenet 8). */
  unknown?: boolean;
  /** AI-inferred connection (Tenet 9) — rendered dashed in the --rose provenance
   *  accent, so it can't pass as ground truth. */
  inferred?: boolean;
}
