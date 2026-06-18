// mds.ts — the only layout where DISTANCE is allowed to mean similarity
// (Manifesto Tenet 2: "distance must be earned"). Graph-theoretic distances
// (BFS shortest paths) are embedded into 2D by stress majorization (SMACOF), so
// how far apart two nodes sit ≈ how far apart they are in the graph. A stress-1
// score reports how trustworthy the embedding is (lower = truer; <0.2 is good).
//
// Pure and dependency-free — runs in Node for tests and in the browser for the
// `similarity` idiom.

export interface GEdgeLike { source: string; target: string }

/** All-pairs shortest-path distances (undirected, unweighted). Disconnected
 *  pairs are set to diameter + 2 so they sit far without being infinite. */
export function graphDistances(ids: string[], edges: GEdgeLike[]): number[][] {
  const idx = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;
  const adj: number[][] = ids.map(() => []);
  edges.forEach((e) => {
    const a = idx.get(e.source), b = idx.get(e.target);
    if (a != null && b != null && a !== b) { adj[a].push(b); adj[b].push(a); }
  });
  const D = ids.map(() => new Array(n).fill(Infinity));
  for (let s = 0; s < n; s++) {
    D[s][s] = 0;
    const q = [s];
    let h = 0;
    while (h < q.length) {
      const u = q[h++];
      for (const v of adj[u]) if (D[s][v] === Infinity) { D[s][v] = D[s][u] + 1; q.push(v); }
    }
  }
  let dia = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][j] !== Infinity) dia = Math.max(dia, D[i][j]);
  const big = dia + 2;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][j] === Infinity) D[i][j] = big;
  return D;
}

export interface MdsResult { pos: Record<string, { x: number; y: number }>; stress: number }

/** Embed the graph so Euclidean distance ≈ graph distance (SMACOF / Guttman). */
export function mdsPositions(ids: string[], edges: GEdgeLike[], opts: { iters?: number; scale?: number } = {}): MdsResult {
  const n = ids.length;
  if (n === 0) return { pos: {}, stress: 0 };
  if (n === 1) return { pos: { [ids[0]]: { x: 0, y: 0 } }, stress: 0 };
  const iters = opts.iters ?? 200;
  const scale = opts.scale ?? 60;
  const D = graphDistances(ids, edges);
  // deterministic init on a circle (radius ~ mean distance)
  let X = ids.map((_, i) => { const a = (2 * Math.PI * i) / n; return [Math.cos(a) * n, Math.sin(a) * n]; });
  const eps = 1e-6;
  for (let it = 0; it < iters; it++) {
    const Xn = X.map(() => [0, 0]);
    for (let i = 0; i < n; i++) {
      let nx = 0, ny = 0, cnt = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = X[i][0] - X[j][0], dy = X[i][1] - X[j][1];
        let dist = Math.hypot(dx, dy); if (dist < eps) dist = eps;
        nx += X[j][0] + (D[i][j] * dx) / dist;
        ny += X[j][1] + (D[i][j] * dy) / dist;
        cnt++;
      }
      Xn[i][0] = nx / cnt; Xn[i][1] = ny / cnt;
    }
    X = Xn;
  }
  // stress-1 (Kruskal) — normalised, scale-free
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const dist = Math.hypot(X[i][0] - X[j][0], X[i][1] - X[j][1]);
    num += (dist - D[i][j]) ** 2; den += D[i][j] ** 2;
  }
  const stress = den > 0 ? Math.sqrt(num / den) : 0;
  const pos: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => { pos[id] = { x: X[i][0] * scale, y: X[i][1] * scale }; });
  return { pos, stress: Number(stress.toFixed(3)) };
}
