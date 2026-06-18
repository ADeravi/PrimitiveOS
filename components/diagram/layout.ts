// layout.ts — the PURE layout fundamentals for the structured diagram family:
// deterministic label measuring, uniform node sizing, and the ELK option set.
// No React, no cytoscape — so the headless layout probe
// (tools/diagram-critique/elk-probe.ts) imports exactly the same code the
// <Diagram> component runs, and the two can never drift apart.

import type { DiagramKind, NodeRole, SNode } from "./types";

// ── deterministic label measuring (ELK needs sizes up front) ─────────────────
export const CHAR_W = 7.4, LINE_H = 18, PAD_X = 20, PAD_Y = 14;

export function wrap(label: string, max = 18): string[] {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [label];
}

// The natural (label-driven) size of a node. Diamonds and parallelograms inscribe
// their label, so they're enlarged geometrically to keep the same breathing room.
export function sizeFor(n: SNode, role: NodeRole): { w: number; h: number } {
  const head = n.label || n.id;
  const allLines = [...wrap(head), ...(role === "entity" ? (n.attrs || []) : [])];
  const longest = Math.max(1, ...allLines.map((l) => l.length));
  const textW = longest * CHAR_W, textH = allLines.length * LINE_H;
  let w = Math.min(240, Math.max(76, textW + PAD_X * 2));
  let h = Math.max(40, textH + PAD_Y * 2);
  if (role === "decision") { w = textW * 1.8 + PAD_X * 2; h = textH * 1.9 + PAD_Y * 2; }
  else if (role === "io") { w = textW + PAD_X * 3; }
  else if (role === "start" || role === "end") { w = Math.max(76, textW + PAD_X * 2.2); }
  return { w: Math.round(w), h: Math.round(h) };
}

// Rectangular roles that share ONE column width (and one single-line height).
export const BOX_ROLES = new Set<NodeRole>([
  "process", "start", "end", "state", "subprocess", "node", "actor", "io",
]);

export interface UniformOpts {
  /** similarity = sized dots (importance by degree), not label-boxes. */
  similarity?: boolean;
  degOf?: (id: string) => number;
}

// Uniform sizing — the fundamental that makes a diagram read as deliberate, not
// ragged: every rectangular role shares one width and one single-line height, so
// they stack into a clean centred column. Diamonds stay proportional to their
// (short) label; entities keep their attribute height but share the column width.
export function uniformSizes(
  nodes: SNode[],
  roleOf: (n: SNode) => NodeRole,
  opts: UniformOpts = {}
): Map<string, { w: number; h: number }> {
  const natural = new Map(nodes.map((n) => [n.id, sizeFor(n, roleOf(n))]));
  const boxNat = nodes.filter((n) => BOX_ROLES.has(roleOf(n))).map((n) => natural.get(n.id)!);
  const uniW = boxNat.length ? Math.min(240, Math.max(96, ...boxNat.map((s) => s.w))) : 120;
  const uniH = boxNat.length ? Math.max(...boxNat.map((s) => s.h)) : 44;
  const out = new Map<string, { w: number; h: number }>();
  for (const n of nodes) {
    const role = roleOf(n);
    if (opts.similarity) { const deg = opts.degOf?.(n.id) ?? 0; const d = 14 + Math.min(16, deg * 2); out.set(n.id, { w: d, h: d }); continue; }
    if (role === "decision") out.set(n.id, natural.get(n.id)!);                                            // proportional diamond
    else if (role === "entity") out.set(n.id, { w: Math.max(uniW, natural.get(n.id)!.w), h: natural.get(n.id)!.h }); // uniform width, attr height
    else if (BOX_ROLES.has(role)) out.set(n.id, { w: uniW, h: uniH });                                     // the shared box
    else out.set(n.id, natural.get(n.id)!);
  }
  return out;
}

// The ELK layered option set. BRANDES_KOEPF + BALANCED straightens the main spine
// and centres parents over children, so the trunk is one vertical line and
// decision branches fan symmetrically. Verified headless in the layout probe.
export function elkOptions(kind: DiagramKind): Record<string, string | number | boolean> {
  const dir = kind === "er" || kind === "swimlane" ? "RIGHT" : "DOWN";
  return {
    "elk.algorithm": "layered",
    "elk.direction": dir,
    "elk.layered.spacing.nodeNodeBetweenLayers": kind === "tree" ? 56 : 64,
    "elk.spacing.nodeNode": 38,
    "elk.layered.spacing.edgeNodeBetweenLayers": 24,
    "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.crossingMinimization.semiInteractive": kind === "tree",
  };
}
