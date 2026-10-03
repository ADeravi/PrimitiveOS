// edgePolicy.ts — the EDGE policy for the structured diagram family, pure and
// shared with the headless probe. It decides, for every edge, which VERTEX of
// the source and target it should attach to (a port side) from the fan-out and
// direction, plus a corner budget and its semantics (dashed / directed). ELK
// then routes orthogonally to those fixed ports and returns the exact bend
// points — so what we verify offline is what gets drawn.
//
// The rules (Manifesto: declutter to the data, tell the truth):
//   · chain  (1→1)            out the bottom, into the next top            ≤1 corner
//   · split  (1→2)            out the two SIDES, into each child's top     ≤2
//   · fanout (1→many)         out the bottom, into each child's top        ≤2
//   · merge  (n→1)            out the bottom, into the shared top          ≤2
//   · decision primary        out the BOTTOM (straight pass-through)       ≤1
//   · decision secondary      out the near SIDE                            ≤2
//   · semantics               "no"/async/return/uncertain → dashed; ER undirected

import { elkOptions } from "./layout";
import type { DiagramKind, NodeRole, SNode, SEdge } from "./types";

export type Side = "NORTH" | "SOUTH" | "EAST" | "WEST";
export type Fan = "chain" | "split" | "fanout" | "merge" | "branchPrimary" | "branchSecondary";

export interface EdgePlan {
  index: number;
  source: string;
  target: string;
  sourceSide: Side;
  targetSide: Side;
  fan: Fan;
  budget: number;          // max corners this edge is allowed
  dashed: boolean;
  directed: boolean;
  inferred: boolean;       // AI-derived (Tenet 9) → --rose provenance accent
}

export function planEdges(
  kind: DiagramKind,
  nodes: SNode[],
  edges: SEdge[],
  roleOf: (id: string) => NodeRole
): EdgePlan[] {
  const horizontal = kind === "er" || kind === "swimlane";
  const IN: Side = horizontal ? "WEST" : "NORTH";
  const OUT: Side = horizontal ? "EAST" : "SOUTH";
  const SIDE_A: Side = horizontal ? "NORTH" : "WEST";
  const SIDE_B: Side = horizontal ? "SOUTH" : "EAST";

  const outIdx = new Map<string, number[]>();
  edges.forEach((e, i) => { const a = outIdx.get(e.source) ?? []; a.push(i); outIdx.set(e.source, a); });
  const inCount = new Map<string, number>();
  edges.forEach((e) => inCount.set(e.target, (inCount.get(e.target) || 0) + 1));

  return edges.map((e, i) => {
    const role = roleOf(e.source);
    const sib = outIdx.get(e.source)!;
    const pos = sib.indexOf(i);
    const n = sib.length;
    const inferred = !!e.inferred;
    const dashed = e.kind === "no" || e.kind === "async" || e.kind === "return" || !!e.unknown || inferred;
    const directed = kind !== "er";

    let sourceSide: Side = OUT, fan: Fan = "chain", budget = 1;
    if (role === "decision" && n >= 2) {
      if (pos === 0) { sourceSide = OUT; fan = "branchPrimary"; budget = 1; }
      else { sourceSide = pos % 2 ? SIDE_B : SIDE_A; fan = "branchSecondary"; budget = 2; }
    } else if (n === 2) {
      sourceSide = pos === 0 ? SIDE_A : SIDE_B; fan = "split"; budget = 2;
    } else if (n >= 3) {
      sourceSide = OUT; fan = "fanout"; budget = 2;
    } else if ((inCount.get(e.target) || 0) >= 2) {
      sourceSide = OUT; fan = "merge"; budget = 2;
    }
    return { index: i, source: e.source, target: e.target, sourceSide, targetSide: IN, fan, budget, dashed, directed, inferred };
  });
}

// Build the ELK graph with FIXED_SIDE ports derived from the plan, so ELK routes
// orthogonally to exactly those vertices. Pure (returns JSON); the caller runs
// elkjs (browser or the probe). Node sizes come from layout.uniformSizes.
const portId = (node: string, side: Side) => `${node}@@${side}`;

export function buildElkGraph(
  kind: DiagramKind,
  nodeIds: string[],
  sizeOf: (id: string) => { w: number; h: number },
  plans: EdgePlan[],
  /** optional lane index per node → ELK partitioning (swimlanes as bands). */
  partitionOf?: (id: string) => number
): unknown {
  const sides = new Map<string, Set<Side>>();
  nodeIds.forEach((id) => sides.set(id, new Set<Side>()));
  plans.forEach((p) => { sides.get(p.source)?.add(p.sourceSide); sides.get(p.target)?.add(p.targetSide); });

  const layoutOptions: Record<string, string> = {};
  for (const [k, v] of Object.entries(elkOptions(kind))) layoutOptions[k] = String(v);
  layoutOptions["elk.edgeRouting"] = "ORTHOGONAL";
  if (partitionOf) layoutOptions["elk.partitioning.activate"] = "true"; // lanes as ordered bands

  return {
    id: "root",
    layoutOptions,
    children: nodeIds.map((id) => {
      const { w, h } = sizeOf(id);
      return {
        id, width: w, height: h,
        layoutOptions: {
          "elk.portConstraints": "FIXED_SIDE",
          ...(partitionOf ? { "elk.partitioning.partition": String(partitionOf(id)) } : {}),
        },
        ports: [...sides.get(id)!].map((side) => ({ id: portId(id, side), layoutOptions: { "elk.port.side": side } })),
      };
    }),
    edges: plans.map((p) => ({ id: "e" + p.index, sources: [portId(p.source, p.sourceSide)], targets: [portId(p.target, p.targetSide)] })),
  };
}

// Pull a clean {positions, routes} view out of an ELK result (positions = node
// top-left + size; routes = absolute polyline points per edge index).
export interface RoutedEdge { index: number; points: { x: number; y: number }[] }
export interface NodeBox { id: string; x: number; y: number; w: number; h: number }

export function extractRoutes(elkResult: any): { boxes: NodeBox[]; routes: RoutedEdge[] } {
  const boxes: NodeBox[] = (elkResult.children ?? []).map((c: any) => ({ id: c.id, x: c.x, y: c.y, w: c.width, h: c.height }));
  const routes: RoutedEdge[] = (elkResult.edges ?? []).map((e: any) => {
    const s = e.sections?.[0];
    const points = s ? [s.startPoint, ...(s.bendPoints ?? []), s.endPoint] : [];
    return { index: Number(String(e.id).replace(/^e/, "")), points };
  });
  return { boxes, routes };
}
