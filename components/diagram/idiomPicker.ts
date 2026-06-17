// idiomPicker.ts — layer ② of the diagram god-layer (Diagram › Policies).
//
// The AI proposes an INTENT, never a chart type. This pure function turns intent
// + the shape of the data into exactly ONE contract, and lets the DATA veto or
// override the intent — because a readable diagram depends on structure, not
// wishes. Pairs with the linter's `suggestIdiom` (same vocabulary).

import type { Contract, DNode, DEdge } from "./types";

const INTENT_MAP: Record<string, Contract> = {
  explore: "force", overview: "force", connections: "force", network: "force", related: "force",
  flow: "hierarchy", hierarchy: "hierarchy", dependency: "hierarchy", tree: "hierarchy",
  process: "hierarchy", rank: "hierarchy", pipeline: "hierarchy", lineage: "hierarchy",
  similarity: "similarity", similar: "similarity", cluster: "similarity", embedding: "similarity",
  importance: "concentric", hubs: "concentric", centrality: "concentric", core: "concentric",
  time: "timeline", timeline: "timeline", chronology: "timeline", when: "timeline",
  trend: "timeline", evolution: "timeline", history: "timeline",
  matrix: "matrix", adjacency: "matrix", dense: "matrix", allpairs: "matrix",
  sequence: "circle", cycle: "circle", ring: "circle", circular: "circle",
  catalog: "grid", index: "grid", roster: "grid",
};

function resolveIntent(intent?: string): Contract {
  if (!intent) return "force";
  const k = String(intent).toLowerCase().trim();
  if (INTENT_MAP[k]) return INTENT_MAP[k];
  for (const [word, contract] of Object.entries(INTENT_MAP)) if (k.includes(word)) return contract;
  return "force";
}

export interface Shape {
  n: number; m: number; density: number; dense: boolean;
  hasDates: boolean; hasSimilarity: boolean; acyclic: boolean;
  treeLike: boolean; hubDominated: boolean;
}

export function computeShape(nodes: DNode[] = [], edges: DEdge[] = [], hints: Partial<Shape> = {}): Shape {
  const n = nodes.length;
  const m = edges.length;
  const density = n > 1 ? m / ((n * (n - 1)) / 2) : 0;

  const hasDates = hints.hasDates ?? nodes.some((x) => x.year != null || x.dated === true);
  const hasSimilarity = hints.hasSimilarity ?? nodes.some((x) => x.sim != null || x.embedded === true);

  const parent = new Map<string, string>(nodes.map((x) => [x.id, x.id]));
  const find = (a: string): string => {
    if (!parent.has(a)) return a;
    while (parent.get(a) !== a) { parent.set(a, parent.get(parent.get(a)!)!); a = parent.get(a)!; }
    return a;
  };
  let cycle = false;
  for (const e of edges) {
    if (!parent.has(e.source) || !parent.has(e.target)) continue;
    const ra = find(e.source), rb = find(e.target);
    if (ra === rb) cycle = true; else parent.set(ra, rb);
  }
  const acyclic = !cycle;
  const treeLike = acyclic && m === n - 1 && n > 2;

  const deg = new Map<string, number>();
  edges.forEach((e) => {
    deg.set(e.source, (deg.get(e.source) || 0) + 1);
    deg.set(e.target, (deg.get(e.target) || 0) + 1);
  });
  const degs = [...deg.values()];
  const mean = degs.length ? degs.reduce((a, b) => a + b, 0) / degs.length : 0;
  const max = degs.length ? Math.max(...degs) : 0;
  const hubDominated = n > 6 && mean > 0 && max > mean * 2.5;

  return { n, m, density, dense: density > 0.4, hasDates, hasSimilarity, acyclic, treeLike, hubDominated };
}

const REASONS: Record<string, string> = {
  force: "Exploratory first look — clusters and hubs emerge from the layout.",
  hierarchy: "Directional / tree structure reads cleanest as ranked layers.",
  similarity: "Distance-true: position earns meaning from real similarity.",
  concentric: "Hub-and-periphery: importance descends from the centre.",
  circle: "Single ring — ordering carries the relationship.",
  grid: "Tidy lattice for predictable scanning of a small set.",
  matrix: "Dense relationships read better as an adjacency matrix than a hairball.",
  timeline: "Time owns the horizontal axis; order and trend are the message.",
};

export interface PickResult {
  contract: Contract;
  confidence: "high" | "medium" | "low";
  reason: string;
  warnings: string[];
  alternatives: string[];
  shape: Shape;
}

export function pickIdiom(
  input: { intent?: string; nodes?: DNode[]; edges?: DEdge[]; hints?: Partial<Shape> } = {}
): PickResult {
  const { intent = "explore", nodes = [], edges = [], hints = {} } = input;
  const shape = computeShape(nodes, edges, hints);
  let contract = resolveIntent(intent);
  let confidence: PickResult["confidence"] = "high";
  const warnings: string[] = [];
  const alternatives: string[] = [];

  if (contract === "timeline" && !shape.hasDates) {
    warnings.push("Timeline intent but no dated nodes — can't put time on the axis.");
    contract = shape.treeLike ? "hierarchy" : "force";
    confidence = "low";
  }
  if (contract === "similarity" && !shape.hasSimilarity) {
    warnings.push("Similarity intent but no similarity/embedding — distance would be accidental; using a structural layout instead.");
    contract = "force";
    confidence = "low";
  }
  if (contract === "hierarchy" && !shape.acyclic) {
    warnings.push("Hierarchy intent but the graph has cycles — layering will break them; force or matrix may read truer.");
    alternatives.push("force", "matrix");
    confidence = "medium";
  }

  if (contract === "force" && shape.dense && shape.n <= 60) {
    warnings.push(`Dense graph (density ${shape.density.toFixed(2)}) — an adjacency matrix reads better than a force hairball.`);
    contract = "matrix";
    confidence = "medium";
  } else if (contract === "force" && shape.n > 120) {
    warnings.push(`Large graph (${shape.n} nodes) — force will hairball; matrix or a clustered view scales better.`);
    alternatives.push("matrix");
    confidence = "medium";
  }

  if (contract === "force" && shape.treeLike) {
    warnings.push("Data is tree-shaped — hierarchy reads cleaner than force.");
    contract = "hierarchy";
  }
  if (contract === "force" && shape.hubDominated) alternatives.push("concentric");

  const alts = [...new Set(alternatives)].filter((a) => a !== contract);
  return { contract, confidence, reason: REASONS[contract] ?? REASONS.force, warnings, alternatives: alts, shape };
}

export { INTENT_MAP };
