// grouping.ts — the shared Grouping & Proximity layer (Diagram › Policies).
//
// Position is the strongest visual channel: viewers read *where* and *how close*
// before they read labels. So distance and arrangement are encodings whether we
// intend them or not. This module turns that into something the engine controls:
// it finds communities, builds common-region (hull / lane) geometry, and scores
// the spatial result — does proximity actually mean relatedness, or is it lying?
//
// Pure and dependency-free, so BOTH families use it: the network/force layouts
// (hulls + cluster cohesion) and the structured box-and-arrow ones (lane bands +
// group containers), and the linter consumes the same proximity report.

export type Pt = { x: number; y: number };
export type GNode = { id: string; x?: number; y?: number; w?: number; h?: number; group?: string | number; lane?: string };
export type GEdge = { source: string; target: string };

// ── community detection (deterministic, bridge-resistant) ────────────────────
// When the caller doesn't supply groups, infer them so colour/enclosure can
// carry the grouping instead of leaving it to accidental force positions.
// Label propagation floods communities across a single bridge edge, so instead:
// keep only *triangle-supported* edges (endpoints sharing a neighbour — i.e. real
// cohesion), union-find those into communities, then attach each leftover node to
// the community it links to most. Deterministic: same input → same labels.
export function detectGroups(nodes: { id: string }[], edges: GEdge[]): Map<string, string> {
  const ids = nodes.map((n) => n.id);
  const idset = new Set(ids);
  const nbr = new Map<string, Set<string>>(ids.map((id) => [id, new Set<string>()]));
  edges.forEach((e) => {
    if (idset.has(e.source) && idset.has(e.target) && e.source !== e.target) {
      nbr.get(e.source)!.add(e.target);
      nbr.get(e.target)!.add(e.source);
    }
  });

  const shareNeighbour = (u: string, v: string) => {
    const a = nbr.get(u)!, b = nbr.get(v)!;
    for (const x of a) if (b.has(x)) return true;
    return false;
  };
  const strong = edges.filter((e) => idset.has(e.source) && idset.has(e.target) && e.source !== e.target && shareNeighbour(e.source, e.target));
  if (strong.length === 0) return new Map(ids.map((id) => [id, "g0"])); // no cohesive structure — one group

  const parent = new Map(ids.map((id) => [id, id]));
  const find = (a: string): string => { while (parent.get(a) !== a) { parent.set(a, parent.get(parent.get(a)!)!); a = parent.get(a)!; } return a; };
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb); };
  strong.forEach((e) => union(e.source, e.target));

  // attach singletons (size-1 communities) to the neighbouring community they
  // link to most — ties broken by smallest root for determinism.
  const size = new Map<string, number>();
  ids.forEach((id) => size.set(find(id), (size.get(find(id)) || 0) + 1));
  ids.forEach((id) => {
    if (size.get(find(id)) !== 1) return;
    const counts = new Map<string, number>();
    for (const x of nbr.get(id)!) { const r = find(x); if (r !== find(id) && size.get(r)! > 1) counts.set(r, (counts.get(r) || 0) + 1); }
    if (counts.size) {
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
      parent.set(find(id), best);
    }
  });

  const remap = new Map<string, string>();
  let k = 0;
  return new Map(ids.map((id) => { const r = find(id); if (!remap.has(r)) remap.set(r, "g" + k++); return [id, remap.get(r)!]; }));
}

export function groupOf(nodes: GNode[], detected?: Map<string, string>): (id: string) => string {
  const explicit = new Map(nodes.map((n) => [n.id, n.group != null ? String(n.group) : undefined]));
  return (id: string) => explicit.get(id) ?? detected?.get(id) ?? "g0";
}

// ── common region: convex hull + padded rounded outline ──────────────────────
export function convexHull(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return pts;
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Pt[] = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

function centroid(pts: Pt[]): Pt {
  const s = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / pts.length, y: s.y / pts.length };
}

/** Push hull vertices outward from the centroid so the band clears the nodes. */
export function padHull(hull: Pt[], pad: number): Pt[] {
  if (hull.length === 0) return hull;
  const c = centroid(hull);
  return hull.map((p) => {
    const dx = p.x - c.x, dy = p.y - c.y, len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * pad, y: p.y + (dy / len) * pad };
  });
}

/** SVG path for a soft common-region around a set of node centres + half-sizes.
 *  Handles 1 node (circle), 2 nodes (capsule) and ≥3 (rounded polygon). */
export function hullPath(centres: Pt[], pad = 22, radius = 16): string {
  if (centres.length === 0) return "";
  if (centres.length === 1) {
    const { x, y } = centres[0];
    const r = pad + radius;
    return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  }
  const hull = padHull(convexHull(centres), pad);
  if (hull.length < 3) {
    // capsule along the two points
    const [a, b] = [hull[0], hull[hull.length - 1]];
    const ang = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
    const r = pad + radius * 0.6;
    const ox = Math.cos(ang) * r, oy = Math.sin(ang) * r;
    return `M ${a.x + ox} ${a.y + oy} L ${b.x + ox} ${b.y + oy} L ${b.x - ox} ${b.y - oy} L ${a.x - ox} ${a.y - oy} Z`;
  }
  // Rounded polygon — FOLLOW the hull edges, rounding only a small fillet at each
  // vertex.
  //
  // The previous version anchored on edge MIDPOINTS with the vertex as the Bézier
  // control point. A quadratic only reaches halfway to its control point, so a
  // box-shaped hull was drawn as the ellipse INSCRIBED in it: the curve touched the
  // four edge midpoints and cut every corner off completely. Since a group's outer
  // nodes sit precisely in those corners, the "common region" sliced straight through
  // its own members — the reported "clusters not covering the nodes", visible as a
  // lens/almond blob rather than an enclosure.
  //
  // Now: walk each edge to within `r` of the vertex, arc across the corner, carry on.
  // r is clamped to half the shorter adjacent edge so short edges can't overshoot and
  // invert the corner. The path never leaves the hull by more than the fillet.
  const n = hull.length;
  const along = (from: Pt, to: Pt, dist: number): Pt => {
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const t = Math.min(dist, len) / len;
    return { x: from.x + dx * t, y: from.y + dy * t };
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n], cur = hull[i], next = hull[(i + 1) % n];
    const lenPrev = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const lenNext = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.max(0, Math.min(radius, lenPrev / 2, lenNext / 2));
    const entry = along(cur, prev, r); // r back along the incoming edge
    const exit = along(cur, next, r);  // r forward along the outgoing edge
    d += i === 0 ? `M ${entry.x} ${entry.y} ` : `L ${entry.x} ${entry.y} `;
    d += `Q ${cur.x} ${cur.y} ${exit.x} ${exit.y} `;
  }
  return d + "Z";
}

// ── swimlane / ordered-group bands (common region by enclosure) ──────────────
export type Band = { lane: string; index: number; y: number; h: number; x: number; w: number };
export function laneBands(
  nodes: GNode[],
  laneOrder: string[],
  bounds: { minX: number; maxX: number },
  opts: { gap?: number; pad?: number } = {}
): Band[] {
  const pad = opts.pad ?? 18;
  const byLane = new Map<string, GNode[]>();
  laneOrder.forEach((l) => byLane.set(l, []));
  nodes.forEach((n) => { if (n.lane != null && byLane.has(n.lane)) byLane.get(n.lane)!.push(n); });
  const x = bounds.minX - pad;
  const w = bounds.maxX - bounds.minX + pad * 2;
  return laneOrder.map((lane, index) => {
    const members = byLane.get(lane) || [];
    const ys = members.map((n) => n.y ?? 0);
    const hs = members.map((n) => (n.h ?? 36) / 2);
    const top = members.length ? Math.min(...ys.map((y, i) => y - hs[i])) - pad : 0;
    const bot = members.length ? Math.max(...ys.map((y, i) => y + hs[i])) + pad : 0;
    return { lane, index, y: top, h: Math.max(1, bot - top), x, w };
  });
}

// ── proximity report: is distance telling the truth? ─────────────────────────
function dist(a: Pt, b: Pt) { return Math.hypot(a.x - b.x, a.y - b.y); }

export interface ProximityReport {
  groups: number;
  cohesion: number;       // mean node→own-centroid distance (smaller = tighter)
  separation: number;     // mean nearest other-centroid distance (larger = cleaner)
  ratio: number;          // separation / cohesion — want ≥ ~1.6
  accidental: { a: string; b: string; d: number }[]; // cross-group pairs too close
  bridges: string[];      // nodes whose edges genuinely span ≥2 groups
}

export function proximityReport(nodes: GNode[], edges: GEdge[] = [], gOf?: (id: string) => string): ProximityReport {
  const placed = nodes.filter((n) => n.x != null && n.y != null) as Required<Pick<GNode, "x" | "y">>[] & GNode[];
  const g = gOf ?? groupOf(nodes);
  const groups = new Map<string, GNode[]>();
  placed.forEach((n) => { const k = g(n.id); (groups.get(k) || groups.set(k, []).get(k)!).push(n); });

  const cents = new Map<string, Pt>();
  groups.forEach((arr, k) => cents.set(k, centroid(arr.map((n) => ({ x: n.x!, y: n.y! })))));

  // cohesion
  let cohSum = 0, cohN = 0;
  groups.forEach((arr, k) => arr.forEach((n) => { cohSum += dist({ x: n.x!, y: n.y! }, cents.get(k)!); cohN++; }));
  const cohesion = cohN ? cohSum / cohN : 0;

  // separation (mean nearest other-centroid)
  const cs = [...cents.entries()];
  let sepSum = 0, sepN = 0;
  for (const [k, c] of cs) {
    let nearest = Infinity;
    for (const [k2, c2] of cs) if (k2 !== k) nearest = Math.min(nearest, dist(c, c2));
    if (nearest < Infinity) { sepSum += nearest; sepN++; }
  }
  const separation = sepN ? sepSum / sepN : 0;

  // accidental adjacency: cross-group pairs closer than the median node gap
  const gaps: number[] = [];
  for (let i = 0; i < placed.length; i++) {
    let nn = Infinity;
    for (let j = 0; j < placed.length; j++) if (i !== j) nn = Math.min(nn, dist({ x: placed[i].x!, y: placed[i].y! }, { x: placed[j].x!, y: placed[j].y! }));
    if (nn < Infinity) gaps.push(nn);
  }
  gaps.sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
  const accidental: { a: string; b: string; d: number }[] = [];
  for (let i = 0; i < placed.length; i++)
    for (let j = i + 1; j < placed.length; j++) {
      if (g(placed[i].id) === g(placed[j].id)) continue;
      const d = dist({ x: placed[i].x!, y: placed[i].y! }, { x: placed[j].x!, y: placed[j].y! });
      if (d < medianGap * 0.9) accidental.push({ a: placed[i].id, b: placed[j].id, d: Math.round(d) });
    }

  // bridges: nodes with edges into ≥2 distinct groups other than (or incl.) own
  const nbrGroups = new Map<string, Set<string>>();
  edges.forEach((e) => {
    (nbrGroups.get(e.source) || nbrGroups.set(e.source, new Set()).get(e.source)!).add(g(e.target));
    (nbrGroups.get(e.target) || nbrGroups.set(e.target, new Set()).get(e.target)!).add(g(e.source));
  });
  const bridges = [...nbrGroups.entries()].filter(([, s]) => s.size >= 2).map(([id]) => id);

  return {
    groups: groups.size,
    cohesion: Math.round(cohesion),
    separation: Math.round(separation),
    ratio: cohesion ? Number((separation / cohesion).toFixed(2)) : 0,
    accidental,
    bridges,
  };
}

/** Do any two group regions overlap? Each group is approximated by a bounding
 *  circle (centroid + farthest member, incl. node half-size). Enclosures are a
 *  membership claim, so overlap = the diagram is lying about who belongs where
 *  (Policy 1 / Tenet 4). Returns the overlapping pairs with the overlap amount. */
export function regionOverlaps(nodes: GNode[], gOf?: (id: string) => string): { a: string; b: string; overlap: number }[] {
  const placed = nodes.filter((n) => n.x != null && n.y != null);
  const g = gOf ?? groupOf(nodes);
  const groups = new Map<string, GNode[]>();
  placed.forEach((n) => { const k = g(n.id); (groups.get(k) || groups.set(k, []).get(k)!).push(n); });
  const circ: { k: string; cx: number; cy: number; r: number }[] = [];
  groups.forEach((arr, k) => {
    const cx = arr.reduce((s, n) => s + n.x!, 0) / arr.length;
    const cy = arr.reduce((s, n) => s + n.y!, 0) / arr.length;
    const r = Math.max(...arr.map((n) => Math.hypot(n.x! - cx, n.y! - cy) + Math.max(n.w || 0, n.h || 0) / 2));
    circ.push({ k, cx, cy, r });
  });
  const pairs: { a: string; b: string; overlap: number }[] = [];
  for (let i = 0; i < circ.length; i++)
    for (let j = i + 1; j < circ.length; j++) {
      const a = circ[i], b = circ[j];
      const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
      if (d < a.r + b.r) pairs.push({ a: a.k, b: b.k, overlap: Math.round(a.r + b.r - d) });
    }
  return pairs;
}

/** Edge-length stats — a long edge is a symptom of bad placement (Policy 3):
 *  related nodes should sit adjacent. Returns median, max, and the outlier edges
 *  whose length exceeds `factor`× the median. */
export function edgeLengthReport(nodes: GNode[], edges: GEdge[] = [], factor = 2.5): { median: number; max: number; longEdges: number } {
  const pos = new Map(nodes.filter((n) => n.x != null).map((n) => [n.id, n]));
  const lens: number[] = [];
  for (const e of edges) {
    const a = pos.get(e.source), b = pos.get(e.target);
    if (a && b) lens.push(Math.hypot(a.x! - b.x!, a.y! - b.y!));
  }
  if (!lens.length) return { median: 0, max: 0, longEdges: 0 };
  const sorted = [...lens].sort((x, y) => x - y);
  const median = sorted[Math.floor(sorted.length / 2)] || 1;
  const max = sorted[sorted.length - 1];
  const longEdges = lens.filter((l) => l > median * factor).length;
  return { median: Math.round(median), max: Math.round(max), longEdges };
}

/** How many distinct group channels to spend, and which is primary. */
export function chooseEncoding(input: { groupCount: number; ordered?: boolean; overlap?: boolean }): "lanes" | "enclosure" | "color" {
  if (input.ordered) return "lanes";
  if (input.overlap || input.groupCount > 7) return "color";
  if (input.groupCount >= 2) return "enclosure";
  return "color";
}
