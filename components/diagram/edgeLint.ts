// edgeLint.ts — the readability gate for EDGE ROUTING (the edges' answer to
// diagramLint / chartLint). Pure: it scores the routed polylines ELK produced
// against the edge policy — corners over budget, a connector crossing a node it
// doesn't touch, and edge-to-edge crossings — and returns violations + a grade
// in the same shape as the other linters. Geometry is axis-aligned (ELK
// orthogonal routing), so the tests are exact, not heuristic.

import type { EdgePlan, NodeBox, RoutedEdge } from "./edgePolicy";

export interface EdgeViolation { rule: string; severity: "error" | "warn"; detail: string }
export interface EdgeLintResult {
  score: number; grade: string; pass: boolean;
  violations: EdgeViolation[];
  metrics: { edges: number; overBudget: number; nodeHits: number; crossings: number; corners: number };
}

type Pt = { x: number; y: number };
const EPS = 1.5; // tolerance so a port sitting on a node boundary isn't a "hit"

function segments(points: Pt[]): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  for (let i = 0; i < points.length - 1; i++) out.push([points[i], points[i + 1]]);
  return out;
}

// does an axis-aligned segment pass through a box's INTERIOR?
function segHitsBox(a: Pt, b: Pt, box: NodeBox): boolean {
  const x0 = box.x + EPS, x1 = box.x + box.w - EPS, y0 = box.y + EPS, y1 = box.y + box.h - EPS;
  if (x1 <= x0 || y1 <= y0) return false;
  if (Math.abs(a.y - b.y) < 0.5) { // horizontal
    const y = a.y; if (y <= y0 || y >= y1) return false;
    const lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x);
    return hi > x0 && lo < x1;
  }
  if (Math.abs(a.x - b.x) < 0.5) { // vertical
    const x = a.x; if (x <= x0 || x >= x1) return false;
    const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
    return hi > y0 && lo < y1;
  }
  return false; // diagonal shouldn't occur under orthogonal routing
}

// crossing between a horizontal and a vertical segment (interior, not a shared touch)
function crosses(s1: [Pt, Pt], s2: [Pt, Pt]): boolean {
  const h = Math.abs(s1[0].y - s1[1].y) < 0.5 ? s1 : Math.abs(s2[0].y - s2[1].y) < 0.5 ? s2 : null;
  const v = h === s1 ? s2 : h === s2 ? s1 : null;
  if (!h || !v) return false;
  const y = h[0].y, x = v[0].x;
  const hx0 = Math.min(h[0].x, h[1].x), hx1 = Math.max(h[0].x, h[1].x);
  const vy0 = Math.min(v[0].y, v[1].y), vy1 = Math.max(v[0].y, v[1].y);
  return x > hx0 + EPS && x < hx1 - EPS && y > vy0 + EPS && y < vy1 - EPS;
}

export function lintEdges(plans: EdgePlan[], routes: RoutedEdge[], boxes: NodeBox[]): EdgeLintResult {
  const planBy = new Map(plans.map((p) => [p.index, p]));
  const v: EdgeViolation[] = [];
  let penalty = 0, overBudget = 0, nodeHits = 0, crossings = 0, corners = 0;

  // corners over budget + node overlaps
  for (const r of routes) {
    const p = planBy.get(r.index);
    if (!p || r.points.length < 2) continue;
    const bends = r.points.length - 2;
    corners += bends;
    if (bends > p.budget) {
      overBudget++; penalty += 0.12;
      v.push({ rule: "route.cornersOverBudget", severity: "warn", detail: `${p.source}→${p.target} (${p.fan}) has ${bends} corners, budget ${p.budget}.` });
    }
    for (const [a, b] of segments(r.points)) {
      for (const box of boxes) {
        if (box.id === p.source || box.id === p.target) continue;
        if (segHitsBox(a, b, box)) {
          nodeHits++; penalty += 0.25;
          v.push({ rule: "route.crossesNode", severity: "error", detail: `${p.source}→${p.target} routes through node ${box.id}.` });
          break;
        }
      }
    }
  }

  // edge-to-edge crossings (informational beyond a small budget)
  const segs = routes.flatMap((r) => segments(r.points).map((s) => ({ idx: r.index, s })));
  for (let i = 0; i < segs.length; i++)
    for (let j = i + 1; j < segs.length; j++)
      if (segs[i].idx !== segs[j].idx && crosses(segs[i].s, segs[j].s)) crossings++;
  if (crossings > Math.ceil(routes.length / 3)) {
    penalty += 0.1;
    v.push({ rule: "route.manyCrossings", severity: "warn", detail: `${crossings} edge crossings — consider re-ordering siblings or splitting the view.` });
  }

  const score = Math.max(0, Math.min(1, 1 - penalty));
  const grade = score >= 0.9 ? "A" : score >= 0.75 ? "B" : score >= 0.6 ? "C" : score >= 0.4 ? "D" : "F";
  return {
    score, grade,
    pass: nodeHits === 0 && grade <= "C",
    violations: v,
    metrics: { edges: routes.length, overBudget, nodeHits, crossings, corners },
  };
}
