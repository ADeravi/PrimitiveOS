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
  metrics: { edges: number; overBudget: number; nodeHits: number; crossings: number; corners: number; labelHits: number };
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

// axis-aligned rect overlap (rects are {x,y,w,h}, top-left origin).
type Rect = { x: number; y: number; w: number; h: number };
function rectsOverlap(a: Rect, b: Rect, pad = 2): boolean {
  return a.x < b.x + b.w - pad && a.x + a.w > b.x + pad && a.y < b.y + b.h - pad && a.y + a.h > b.y + pad;
}
const CHAR_W = 7.4, LBL_H = 20;

/** Does an axis-aligned segment pass through a rect? Used to keep a label chip OFF
 *  other edges — a chip sitting on a line breaks it, and the reader can no longer tell
 *  which edge the label belongs to or follow either one through. */
function rectHitsSeg(r: Rect, a: Pt, b: Pt): boolean {
  const x0 = r.x, x1 = r.x + r.w, y0 = r.y, y1 = r.y + r.h;
  if (Math.abs(a.y - b.y) < 0.5) {
    const y = a.y; if (y <= y0 || y >= y1) return false;
    return Math.max(a.x, b.x) > x0 && Math.min(a.x, b.x) < x1;
  }
  if (Math.abs(a.x - b.x) < 0.5) {
    const x = a.x; if (x <= x0 || x >= x1) return false;
    return Math.max(a.y, b.y) > y0 && Math.min(a.y, b.y) < y1;
  }
  return false;
}

// Node-aware label placement (yFiles' lesson): put the label on the LONGEST
// straight segment whose chip is clear of every node; if none is clear, fall
// back to the longest segment and report it. Shared by the renderer (EdgeLayer)
// and the linter, so what's drawn is what's verified.
export function placeLabel(
  points: Pt[],
  textLen: number,
  boxes: NodeBox[],
  /** Chips already placed on this diagram — a label must dodge these too. Callers
   *  that place many labels pass the running list; each returned `rect` is appended.
   *  Without it every label is placed independently and two can land on the same
   *  spot, which is unreadable exactly where the diagram is busiest. */
  taken: { x: number; y: number; w: number; h: number }[] = [],
  /** every OTHER edge's segments — a chip must not sit on another line. */
  avoid: [Pt, Pt][] = []
): { x: number; y: number; clear: boolean; rect: { x: number; y: number; w: number; h: number } } {
  const w = textLen * CHAR_W + 12, h = LBL_H;
  const segs: [Pt, Pt][] = [];
  for (let i = 0; i < points.length - 1; i++) segs.push([points[i], points[i + 1]]);
  segs.sort((p, q) => Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y) - Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y));
  // Midpoint first (a label reads best mid-segment), then slide along the segment
  // before giving up on it — a near-miss shouldn't cost the whole edge its position.
  const ts = [0.5, 0.38, 0.62, 0.26, 0.74];
  // The chip sits BESIDE its line, not on it: offset perpendicular so the edge stays
  // one continuous stroke the eye can follow. Try both sides before moving along.
  const OFF = h / 2 + 3;
  for (const [p, q] of segs) {
    const horiz = Math.abs(p.y - q.y) < 0.5;
    for (const t of ts) {
      for (const side of [-1, 1]) {
        const bx = p.x + (q.x - p.x) * t, by = p.y + (q.y - p.y) * t;
        const cx = bx + (horiz ? 0 : side * OFF), cy = by + (horiz ? side * OFF : 0);
        const r = { x: cx - w / 2, y: cy - h / 2, w, h };
        const hitsNode = boxes.some((b) => rectsOverlap(r, b));
        const hitsLabel = taken.some((o) => rectsOverlap(r, o));
        const hitsEdge = avoid.some(([a2, b2]) => rectHitsSeg(r, a2, b2));
        if (!hitsNode && !hitsLabel && !hitsEdge) return { x: cx, y: cy, clear: true, rect: r };
      }
    }
  }
  const f = segs[0] ?? [points[0], points[points.length - 1]];
  const cx = (f[0].x + f[1].x) / 2, cy = (f[0].y + f[1].y) / 2;
  return { x: cx, y: cy, clear: false, rect: { x: cx - w / 2, y: cy - h / 2, w, h } };
}

/** Do two axis-aligned segments run along each other (not merely cross)? Collinear
 *  overlap is the worst edge defect: two relationships drawn as ONE line, so the
 *  reader cannot see that there are two, nor where either goes. */
export function segmentsOverlap(a: [Pt, Pt], b: [Pt, Pt], tol = 2): boolean {
  const horiz = (s: [Pt, Pt]) => Math.abs(s[0].y - s[1].y) <= tol;
  const vert = (s: [Pt, Pt]) => Math.abs(s[0].x - s[1].x) <= tol;
  const span = (lo: number, hi: number, lo2: number, hi2: number) =>
    Math.min(Math.max(lo, hi), Math.max(lo2, hi2)) - Math.max(Math.min(lo, hi), Math.min(lo2, hi2)) > tol;
  if (horiz(a) && horiz(b) && Math.abs(a[0].y - b[0].y) <= tol) return span(a[0].x, a[1].x, b[0].x, b[1].x);
  if (vert(a) && vert(b) && Math.abs(a[0].x - b[0].x) <= tol) return span(a[0].y, a[1].y, b[0].y, b[1].y);
  return false;
}

export function lintEdges(plans: EdgePlan[], routes: RoutedEdge[], boxes: NodeBox[], labels: string[] = []): EdgeLintResult {
  const planBy = new Map(plans.map((p) => [p.index, p]));
  const v: EdgeViolation[] = [];
  let penalty = 0, overBudget = 0, nodeHits = 0, crossings = 0, corners = 0, labelHits = 0;

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

  // ALIGNMENT: two edges running ALONG each other (not merely crossing). This is the
  // worst readable defect — two relationships drawn as one line, so the reader can't
  // see there are two, nor where either goes. Error, not warn.
  let overlaps = 0;
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      const ri = routes[i], rj = routes[j];
      const pi = planBy.get(ri.index), pj = planBy.get(rj.index);
      if (!pi || !pj) continue;
      let hit = false;
      for (const a of segments(ri.points)) { for (const b of segments(rj.points)) { if (segmentsOverlap(a, b)) { hit = true; break; } } if (hit) break; }
      if (hit) {
        overlaps++; penalty += 0.2;
        v.push({ rule: "route.overlapsEdge", severity: "error", detail: `${pi.source}→${pi.target} runs along ${pj.source}→${pj.target} — two relationships drawn as one line.` });
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

  // label overlap (yFiles): a label must find a spot clear of nodes AND of every
  // other label. Placed in the same order the renderer uses, so the lint sees the
  // same chips the reader does.
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  for (const r of routes) {
    const p = planBy.get(r.index);
    const lbl = labels[r.index];
    if (!p || !lbl || r.points.length < 2) continue;
    const others = routes.filter((o) => o.index !== r.index).flatMap((o) => segments(o.points));
    const at = placeLabel(r.points, lbl.length, boxes, placed, others);
    placed.push(at.rect);
    if (!at.clear) {
      labelHits++; penalty += 0.15;
      v.push({ rule: "label.overlaps", severity: "warn", detail: `${p.source}→${p.target} label "${lbl}" has no spot clear of nodes and other labels.` });
    }
  }

  const score = Math.max(0, Math.min(1, 1 - penalty));
  const grade = score >= 0.9 ? "A" : score >= 0.75 ? "B" : score >= 0.6 ? "C" : score >= 0.4 ? "D" : "F";
  return {
    score, grade,
    pass: nodeHits === 0 && grade <= "C",
    violations: v,
    metrics: { edges: routes.length, overBudget, nodeHits, crossings, corners, labelHits },
  };
}
