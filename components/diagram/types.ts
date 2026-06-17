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
