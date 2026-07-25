// layout.ts — the PURE layout fundamentals for the structured diagram family:
// deterministic label measuring, uniform node sizing, and the ELK option set.
// No React, no cytoscape — so the headless layout probe
// (tools/diagram-critique/elk-probe.ts) imports exactly the same code the
// <Diagram> component runs, and the two can never drift apart.

import { sp, TYPE } from "./primitives";
import type { DiagramKind, NodeRole, SNode } from "./types";

// ── deterministic label measuring (ELK needs sizes up front) ─────────────────
// All spatial constants come from the Carbon spacing scale / type ramp (see
// ./primitives) — no magic numbers; the probe asserts they stay on-scale.
export const CHAR_W = 7.4;
export const LINE_H = Math.round(TYPE.nodeLabel.size * TYPE.nodeLabel.line); // ≈20 (node-label line box)
export const PAD_X = sp(5); // 16
export const PAD_Y = sp(4); // 12

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

// Optional, consumer-supplied layout tuning. Meaning-only stays the rule: these
// don't change WHAT is drawn, only the reading direction and how tightly it packs.
// Both are bounded/normalised below, so no value can produce an unreadable result —
// the guardrail holds.
export interface ElkTune {
  /** Flow direction, ELK-native. Overrides the per-kind default. */
  direction?: "DOWN" | "UP" | "RIGHT" | "LEFT";
  /** Uniform spacing multiplier: 1 = default, <1 compact, >1 roomy. Clamped [0.5,2]. */
  spacing?: number;
  /** Per-axis spacing multipliers (SCREEN axes, not ELK's). Override `spacing`.
   *  These are mapped onto ELK's layer/in-layer keys according to `direction`, so
   *  "X" always means horizontal on screen whichever way the flow runs. */
  spacingX?: number;
  spacingY?: number;
}

// The ELK layered option set. BRANDES_KOEPF + BALANCED straightens the main spine
// and centres parents over children, so the trunk is one vertical line and
// decision branches fan symmetrically. Verified headless in the layout probe.
export function elkOptions(kind: DiagramKind, tune?: ElkTune): Record<string, string | number | boolean> {
  const dir = tune?.direction || (kind === "er" || kind === "swimlane" ? "RIGHT" : "DOWN");
  // Clamp so a stray value can never collapse nodes onto each other or explode the
  // canvas — the spacing knobs stay inside a readable band.
  const cl = (v: number | undefined, fb: number) => Math.min(2, Math.max(0.5, v && v > 0 ? v : fb));
  const s = cl(tune?.spacing, 1);
  const sx = cl(tune?.spacingX, s);
  const sy = cl(tune?.spacingY, s);
  // ELK thinks in LAYERS, the user thinks in screen axes. When the flow runs
  // left→right the layer gap IS the horizontal gap; running top→bottom it's the
  // vertical one. Map accordingly so "→" always widens the screen-horizontal gap.
  const horizontalFlow = dir === "RIGHT" || dir === "LEFT";
  const layerGap = horizontalFlow ? sx : sy;   // gap BETWEEN successive layers
  const inLayerGap = horizontalFlow ? sy : sx; // gap between siblings WITHIN a layer
  const scale = (v: number, m: number) => Math.round(v * m);
  return {
    "elk.algorithm": "layered",
    "elk.direction": dir,
    "elk.layered.spacing.nodeNodeBetweenLayers": scale(kind === "tree" ? sp(9) : sp(10), layerGap), // 48 / 64 @ 1
    "elk.spacing.nodeNode": scale(sp(8), inLayerGap),                                                // 40 @ 1
    "elk.layered.spacing.edgeNodeBetweenLayers": scale(sp(6), layerGap),                             // 24 @ 1
    "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.crossingMinimization.semiInteractive": kind === "tree",
  };
}

// The spacing values this module uses — exported so the probe can assert they
// stay on the Carbon scale (primitives.lintPrimitives).
export const LAYOUT_SPACING = {
  padX: PAD_X, padY: PAD_Y,
  betweenLayers: sp(10), betweenLayersTree: sp(9), nodeNode: sp(8), edgeNode: sp(6),
};
