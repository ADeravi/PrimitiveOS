// diagramLint.ts — layers ④⑤, the readability gate (Diagram › Policies).
//
// No layout engine guarantees a *readable* diagram — it only produces positions.
// validate() scores an already-laid-out view against the failure modes that
// destroy comprehension (overlap, bad grouping, bad labelling, illegible text,
// clutter) and returns concrete corrections. Pure and dependency-free.

import type { DNode, DView, LintResult, Violation, Correction } from "./types";

const DEFAULTS = {
  maxColors: 6,
  minLabelPx: 5,
  labelCharW: 0.58,
  labelPadY: 4,
  weights: {
    nodeOverlap: 0.30, labelOverlap: 0.22, edgeCrossings: 0.18,
    paletteOverflow: 0.12, legibility: 0.10, aspect: 0.04, contract: 0.20,
  },
};

type Rect = { x: number; y: number; w: number; h: number };
type Pt = { x: number; y: number };

const nodeRect = (n: DNode): Rect => ({ x: (n.x ?? 0) - (n.w ?? 0) / 2, y: (n.y ?? 0) - (n.h ?? 0) / 2, w: n.w ?? 0, h: n.h ?? 0 });

function rectsOverlap(a: Rect, b: Rect, pad = 0): boolean {
  return a.x - pad < b.x + b.w && a.x + a.w + pad > b.x && a.y - pad < b.y + b.h && a.y + a.h + pad > b.y;
}

function labelRect(n: DNode, fontPx: number, cfg: typeof DEFAULTS): Rect | null {
  if (!n.label) return null;
  const w = Math.min(90, n.label.length * fontPx * cfg.labelCharW);
  const h = fontPx * 1.2;
  return { x: (n.x ?? 0) - w / 2, y: (n.y ?? 0) + (n.h ?? 0) / 2 + cfg.labelPadY, w, h };
}

function segmentsCross(p1: Pt, p2: Pt, p3: Pt, p4: Pt): boolean {
  const o = (a: Pt, b: Pt, c: Pt) => Math.sign((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y));
  return o(p1, p2, p3) !== o(p1, p2, p4) && o(p3, p4, p1) !== o(p3, p4, p2);
}

function computeMetrics(view: DView, cfg: typeof DEFAULTS) {
  const nodes = view.nodes || [];
  const edges = view.edges || [];
  const zoom = view.zoom ?? 1;
  const fontPx = 12;
  const pos = new Map(nodes.map((n) => [n.id, n]));

  let nodeHits = 0;
  const overlapping = new Set<string>();
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      if (rectsOverlap(nodeRect(nodes[i]), nodeRect(nodes[j]))) { nodeHits++; overlapping.add(nodes[i].id); overlapping.add(nodes[j].id); }

  const labelled = nodes.filter((n) => n.label && n.showLabel !== false);
  const lboxes = labelled.map((n) => ({ id: n.id, r: labelRect(n, fontPx, cfg)! }));
  let labelHits = 0;
  const labelClashers = new Set<string>();
  for (let i = 0; i < lboxes.length; i++)
    for (let j = i + 1; j < lboxes.length; j++)
      if (rectsOverlap(lboxes[i].r, lboxes[j].r)) { labelHits++; labelClashers.add(lboxes[i].id); labelClashers.add(lboxes[j].id); }

  let crossings = 0;
  for (let i = 0; i < edges.length; i++) {
    const a1 = pos.get(edges[i].source), a2 = pos.get(edges[i].target);
    if (!a1 || !a2) continue;
    for (let j = i + 1; j < edges.length; j++) {
      const e2 = edges[j];
      if (e2.source === edges[i].source || e2.source === edges[i].target || e2.target === edges[i].source || e2.target === edges[i].target) continue;
      const b1 = pos.get(e2.source), b2 = pos.get(e2.target);
      if (b1 && b2 && segmentsCross(a1 as Pt, a2 as Pt, b1 as Pt, b2 as Pt)) crossings++;
    }
  }

  const groups = new Set(nodes.map((n) => n.group).filter((g) => g != null));
  const maxColors = view.palette?.maxColors ?? cfg.maxColors;
  const minRenderedPx = fontPx * zoom;

  const xs = nodes.map((n) => n.x ?? 0), ys = nodes.map((n) => n.y ?? 0);
  const bw = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const bh = Math.max(1, Math.max(...ys) - Math.min(...ys));
  const aspect = bw / bh;

  const nPairs = Math.max(1, (nodes.length * (nodes.length - 1)) / 2);
  const ePairs = Math.max(1, (edges.length * (edges.length - 1)) / 2);

  return {
    nodes: nodes.length, edges: edges.length,
    nodeOverlap: { count: nodeHits, ratio: nodeHits / nPairs, ids: [...overlapping] },
    labelOverlap: { count: labelHits, ratio: labelHits / Math.max(1, (labelled.length * (labelled.length - 1)) / 2), ids: [...labelClashers] },
    edgeCrossings: { count: crossings, ratio: crossings / ePairs },
    palette: { groups: groups.size, max: maxColors, over: Math.max(0, groups.size - maxColors) },
    legibility: { minPx: minRenderedPx, ok: minRenderedPx >= cfg.minLabelPx },
    aspect,
  };
}

function contractViolations(view: DView): Violation[] {
  const v: Violation[] = [];
  const nodes = view.nodes || [];
  const edges = view.edges || [];
  switch (view.contract) {
    case "similarity":
      if (edges.length > nodes.length)
        v.push({ rule: "similarity.edgesObscureDistance", severity: "warn", detail: "Distance carries the relation here; show k-NN edges sparingly, not the full edge set." });
      break;
    case "timeline": {
      const undated = nodes.filter((n) => n.dated === false);
      const misplaced = undated.filter((n) => !n.offAxis);
      if (misplaced.length)
        v.push({ rule: "timeline.undatedOnAxis", severity: "error", detail: `${misplaced.length} undated node(s) placed on the time axis; move them to the off-axis bucket.`, ids: misplaced.map((n) => n.id) });
      break;
    }
    case "force":
      if (!nodes.some((n) => n.group != null))
        v.push({ rule: "force.noGrouping", severity: "warn", detail: "Force positions are accidents — assign communities so colour/hulls carry the grouping." });
      break;
    default: break;
  }
  return v;
}

export function validate(view: DView, opts: Partial<typeof DEFAULTS> = {}): LintResult {
  const cfg = { ...DEFAULTS, ...opts, weights: { ...DEFAULTS.weights, ...(opts.weights || {}) } };
  const m = computeMetrics(view, cfg);
  const violations: Violation[] = [];
  const corrections: Correction[] = [];
  const w = cfg.weights;
  let penalty = 0;

  if (m.nodeOverlap.count > 0) {
    violations.push({ rule: "nodeOverlap", severity: m.nodeOverlap.ratio > 0.05 ? "error" : "warn", detail: `${m.nodeOverlap.count} overlapping node pair(s).`, ids: m.nodeOverlap.ids });
    corrections.push({ action: "separateOverlaps", reason: "nodeOverlap" });
    penalty += w.nodeOverlap * Math.min(1, m.nodeOverlap.ratio * 6);
  }
  if (m.labelOverlap.count > 0) {
    violations.push({ rule: "labelOverlap", severity: "warn", detail: `${m.labelOverlap.count} colliding label(s).`, ids: m.labelOverlap.ids });
    corrections.push({ action: "thinLabels", reason: "labelOverlap" });
    penalty += w.labelOverlap * Math.min(1, m.labelOverlap.ratio * 5);
  }
  if (m.edgeCrossings.ratio > 0.1) {
    violations.push({ rule: "edgeCrossings", severity: m.edgeCrossings.ratio > 0.3 ? "error" : "warn", detail: `${m.edgeCrossings.count} edge crossings (${(m.edgeCrossings.ratio * 100).toFixed(0)}% of pairs).` });
    corrections.push({ action: "suggestIdiom", reason: "edgeCrossings", to: m.nodes <= 30 ? "hierarchy" : "matrix" });
    penalty += w.edgeCrossings * Math.min(1, m.edgeCrossings.ratio);
  }
  if (m.palette.over > 0) {
    violations.push({ rule: "paletteOverflow", severity: "error", detail: `${m.palette.groups} colour groups exceed the cap of ${m.palette.max}.` });
    corrections.push({ action: "clampPalette", reason: "paletteOverflow", max: m.palette.max });
    penalty += w.paletteOverflow * Math.min(1, m.palette.over / m.palette.max);
  }
  if (!m.legibility.ok) {
    violations.push({ rule: "legibility", severity: "warn", detail: `Labels render at ${m.legibility.minPx.toFixed(1)}px (min ${cfg.minLabelPx}px). Hide them or zoom.` });
    corrections.push({ action: "hideLabelsBelowZoom", reason: "legibility" });
    penalty += w.legibility;
  }
  if (m.nodes > 6 && (m.aspect > 3 || m.aspect < 1 / 3)) {
    violations.push({ rule: "aspect", severity: "warn", detail: `Extreme aspect ratio ${m.aspect.toFixed(2)} — re-pack or fit.` });
    corrections.push({ action: "refit", reason: "aspect" });
    penalty += w.aspect;
  }

  for (const c of contractViolations(view)) {
    violations.push(c);
    penalty += w.contract * (c.severity === "error" ? 1 : 0.4);
  }

  const score = Math.max(0, Math.min(1, 1 - penalty));
  const grade = score >= 0.9 ? "A" : score >= 0.75 ? "B" : score >= 0.6 ? "C" : score >= 0.4 ? "D" : "F";
  return { score, grade, pass: grade <= "C" && !violations.some((x) => x.severity === "error"), metrics: m, violations, corrections };
}

export function separateOverlaps(nodes: DNode[], { padding = 6, passes = 60 } = {}): DNode[] {
  const out = nodes.map((n) => ({ ...n }));
  for (let p = 0; p < passes; p++) {
    let moved = false;
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i], b = out[j];
        const minX = (a.w! + b.w!) / 2 + padding, minY = (a.h! + b.h!) / 2 + padding;
        const dx = b.x! - a.x!, dy = b.y! - a.y!;
        if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
          const ox = minX - Math.abs(dx), oy = minY - Math.abs(dy);
          if (ox < oy) { const s = (dx === 0 ? 1 : Math.sign(dx)) * ox / 2; a.x! -= s; b.x! += s; }
          else { const s = (dy === 0 ? 1 : Math.sign(dy)) * oy / 2; a.y! -= s; b.y! += s; }
          moved = true;
        }
      }
    if (!moved) break;
  }
  return out;
}

export function thinLabels(nodes: DNode[], { keep = 0.5 } = {}): DNode[] {
  const ranked = [...nodes].sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0));
  const cut = Math.max(1, Math.round(ranked.length * keep));
  const visible = new Set(ranked.slice(0, cut).map((n) => n.id));
  return nodes.map((n) => ({ ...n, showLabel: visible.has(n.id) }));
}

export function clampPalette(nodes: DNode[], max = DEFAULTS.maxColors): DNode[] {
  const counts = new Map<unknown, number>();
  nodes.forEach((n) => counts.set(n.group, (counts.get(n.group) ?? 0) + 1));
  const keep = new Set([...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max - 1).map(([g]) => g));
  return nodes.map((n) => ({ ...n, group: keep.has(n.group) ? n.group : "__other__" }));
}

export { computeMetrics, DEFAULTS };
