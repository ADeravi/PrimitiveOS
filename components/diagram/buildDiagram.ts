// buildDiagram.ts — layer ⑥, the orchestrator (Diagram › Policies).
//
// The ONE entry point the AI / MCP path calls. It ties the god layer together:
// pick idiom (②) → layout (④) → validate (⑤) → apply corrections / swap idiom →
// re-score, looping until the view PASSES or no longer improves. Deterministic:
// same input → same view. `layout` is injected so this stays engine-agnostic;
// the bundled `simpleLayout` is a dependency-free fallback (production injects
// cytoscape/ELK).

import { pickIdiom, type PickResult } from "./idiomPicker";
import { validate, separateOverlaps, thinLabels, clampPalette } from "./diagramLint";
import type { Contract, DNode, DEdge, DView, LintResult } from "./types";

type LayoutFn = (contract: string, nodes: DNode[], edges: DEdge[]) => DNode[];

function withSizes(nodes: DNode[], edges: DEdge[]): DNode[] {
  const deg = new Map<string, number>();
  edges.forEach((e) => {
    deg.set(e.source, (deg.get(e.source) || 0) + 1);
    deg.set(e.target, (deg.get(e.target) || 0) + 1);
  });
  return nodes.map((n) => {
    const d = deg.get(n.id) || 1;
    const s = Math.round(18 + Math.min(6, d) * 4);
    return { ...n, degree: d, w: n.w || s, h: n.h || s };
  });
}

export const simpleLayout: LayoutFn = (contract, nodes, edges) => {
  const W = 640, H = 420, cx = W / 2, cy = H / 2;
  const n = nodes.length || 1;
  const maxSize = Math.max(20, ...nodes.map((x) => x.w || 20));

  const placeGrid = (cols?: number): DNode[] => {
    const c = cols || Math.ceil(Math.sqrt(n));
    const gap = maxSize + 26;
    return nodes.map((nd, i) => ({ ...nd, x: 40 + (i % c) * gap, y: 40 + Math.floor(i / c) * gap }));
  };
  const placeRing = (items: DNode[], radius: number, cxx = cx, cyy = cy): DNode[] =>
    items.map((nd, i) => {
      const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
      return { ...nd, x: cxx + radius * Math.cos(a), y: cyy + radius * Math.sin(a) };
    });

  switch (contract) {
    case "grid":
    case "matrix":
      return placeGrid();
    case "circle":
      return placeRing(nodes, Math.max(120, n * 12));
    case "concentric": {
      const sorted = [...nodes].sort((a, b) => (b.degree || 0) - (a.degree || 0));
      const rings = Math.min(4, Math.max(1, Math.ceil(n / 6)));
      const per = Math.ceil(sorted.length / rings);
      let out: DNode[] = [];
      for (let r = 0; r < rings; r++) out = out.concat(placeRing(sorted.slice(r * per, (r + 1) * per), 60 + r * 80));
      return out;
    }
    case "hierarchy": {
      const adj = new Map<string, string[]>(nodes.map((nd) => [nd.id, []]));
      edges.forEach((e) => {
        if (adj.has(e.source) && adj.has(e.target)) { adj.get(e.source)!.push(e.target); adj.get(e.target)!.push(e.source); }
      });
      const root = [...nodes].sort((a, b) => adj.get(b.id)!.length - adj.get(a.id)!.length)[0]?.id;
      const depth = new Map<string, number>([[root, 0]]);
      const q = [root];
      while (q.length) {
        const u = q.shift()!;
        for (const v of adj.get(u) || []) if (!depth.has(v)) { depth.set(v, depth.get(u)! + 1); q.push(v); }
      }
      const byLayer = new Map<number, DNode[]>();
      nodes.forEach((nd) => {
        const d = depth.get(nd.id) ?? 0;
        if (!byLayer.has(d)) byLayer.set(d, []);
        byLayer.get(d)!.push(nd);
      });
      const out: DNode[] = [];
      for (const [d, layer] of byLayer) {
        const gap = maxSize + 28;
        const total = (layer.length - 1) * gap;
        layer.forEach((nd, i) => out.push({ ...nd, x: cx - total / 2 + i * gap, y: 50 + d * 78 }));
      }
      return out;
    }
    case "timeline": {
      const years = nodes.map((nd) => nd.year).filter((y): y is number => y != null);
      const minY = Math.min(...years, 0), maxY = Math.max(...years, 1);
      const lanes = [...new Set(nodes.map((nd) => nd.group ?? 0))];
      return nodes.map((nd, i) => {
        const t = nd.year != null && maxY > minY ? (nd.year - minY) / (maxY - minY) : i / n;
        const lane = lanes.indexOf(nd.group ?? 0);
        return { ...nd, x: 60 + t * (W - 120), y: 60 + lane * 70, offAxis: nd.dated === false };
      });
    }
    case "force":
    default: {
      let pos = placeRing(nodes, Math.max(120, n * 12));
      const idx = new Map(pos.map((p, i) => [p.id, i]));
      for (let it = 0; it < 40; it++) {
        const next = pos.map((p) => ({ ...p }));
        edges.forEach((e) => {
          const a = idx.get(e.source), b = idx.get(e.target);
          if (a == null || b == null) return;
          const mx = (pos[a].x! + pos[b].x!) / 2, my = (pos[a].y! + pos[b].y!) / 2;
          next[a].x! += (mx - pos[a].x!) * 0.06; next[a].y! += (my - pos[a].y!) * 0.06;
          next[b].x! += (mx - pos[b].x!) * 0.06; next[b].y! += (my - pos[b].y!) * 0.06;
        });
        pos = next;
      }
      return pos;
    }
  }
};

const snap = (contract: string, result: LintResult, phase: string) => ({
  phase, contract, grade: result.grade, score: Number(result.score.toFixed(3)),
  pass: result.pass, violations: result.violations.map((v) => v.rule),
});

export interface BuildResult {
  contract: Contract | string;
  view: DView;
  score: number;
  grade: string;
  passed: boolean;
  pick: PickResult;
  rounds: ReturnType<typeof snap>[];
  notes: string[];
}

export function buildDiagram(
  input: { intent?: string; nodes: DNode[]; edges: DEdge[]; hints?: object; zoom?: number; palette?: { maxColors?: number } },
  opts: { layout?: LayoutFn; maxRounds?: number; validateOpts?: object } = {}
): BuildResult {
  const { layout = simpleLayout, maxRounds = 4, validateOpts = {} } = opts;
  const pick = pickIdiom(input);
  let contract: string = pick.contract;

  const sized = withSizes(input.nodes || [], input.edges || []);
  let view: DView = {
    contract,
    nodes: layout(contract, sized, input.edges || []),
    edges: input.edges || [],
    zoom: input.zoom ?? 1,
    palette: input.palette || {},
  };
  let result = validate(view, validateOpts);
  const rounds = [snap(contract, result, "initial")];
  let best = { view, result, contract };

  let round = 0;
  while (!result.pass && round < maxRounds) {
    round++;
    let changed = false;
    const has = (a: string) => result.corrections.some((c) => c.action === a);

    if (has("clampPalette")) { view = { ...view, nodes: clampPalette(view.nodes, view.palette?.maxColors) }; changed = true; }
    if (has("separateOverlaps")) { view = { ...view, nodes: separateOverlaps(view.nodes) }; changed = true; }
    if (has("thinLabels")) { view = { ...view, nodes: thinLabels(view.nodes) }; changed = true; }
    if (changed) result = validate(view, validateOpts);

    const swap = result.corrections.find((c) => c.action === "suggestIdiom");
    if (!result.pass && swap?.to && swap.to !== contract) {
      contract = swap.to;
      view = { ...view, contract, nodes: layout(contract, withSizes(input.nodes, input.edges), input.edges || []) };
      result = validate(view, validateOpts);
      changed = true;
    }

    rounds.push(snap(contract, result, `round ${round}`));
    if (result.score > best.result.score) best = { view, result, contract };
    if (!changed) break;
  }

  const final = result.pass ? { view, result, contract } : best;
  const notes = [
    ...pick.warnings,
    ...(final.result.pass ? [] : ["Could not fully pass — showing the best-scoring view; some elements reduced for readability."]),
  ];
  return { contract: final.contract, view: final.view, score: final.result.score, grade: final.result.grade, passed: final.result.pass, pick, rounds, notes };
}
