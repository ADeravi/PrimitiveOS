"use client";
// Diagram.tsx — the reference GUARDRAIL component for the *structured* diagram
// family: flowcharts, org/tree, state machines, ER, swimlanes. This is box-and-
// arrow drawing, NOT a quantitative chart and NOT a force network — position
// here encodes structure (sequence, hierarchy, containment), so the engine, not
// the caller, owns layout and routing.
//
// Meaning-only API: you pass WHAT (kind + typed nodes + typed edges); never HOW
// (no x/y, no colour, no routing). Internally it normalises the data, picks the
// idiom, lays it out with ELK (layered, orthogonal), and renders rounded boxes
// with role-based shapes, taxi (right-angle) connectors, arrowheads and edge
// labels — themed entirely from DS tokens. A bad layout is unrepresentable.

import * as React from "react";
import cytoscape from "cytoscape";
import elk from "cytoscape-elk";
import fcose from "cytoscape-fcose";
import { readTokens, readableOn, ensureContrast } from "../charts/network";
import { GroupLayer } from "./GroupLayer";
import { detectGroups } from "./grouping";
import { mdsPositions } from "./mds";
import type { DiagramKind, NodeRole, SNode, SEdge } from "./types";

try {
  cytoscape.use(elk);
  cytoscape.use(fcose);
} catch {
  /* already registered */
}

// ── intent → kind ────────────────────────────────────────────────────────────
const KIND_FROM_INTENT: Record<string, DiagramKind> = {
  flow: "flow", flowchart: "flow", process: "flow", pipeline: "flow", workflow: "flow", steps: "flow",
  tree: "tree", hierarchy: "tree", org: "tree", orgchart: "tree", breakdown: "tree", taxonomy: "tree",
  state: "state", states: "state", machine: "state", lifecycle: "state", status: "state", fsm: "state",
  er: "er", entity: "er", schema: "er", data: "er", model: "er", erd: "er",
  swimlane: "swimlane", lanes: "swimlane", responsibilities: "swimlane", crossfunctional: "swimlane",
  cluster: "cluster", clusters: "cluster", community: "cluster", communities: "cluster", network: "cluster", groups: "cluster",
  similarity: "similarity", similar: "similarity", distance: "similarity", embedding: "similarity", proximity: "similarity", semantic: "similarity",
  sequence: "sequence", interaction: "sequence", messages: "sequence", protocol: "sequence",
};

function kindFromIntent(intent: string): DiagramKind {
  const k = String(intent).toLowerCase().replace(/[^a-z]/g, "");
  if (KIND_FROM_INTENT[k]) return KIND_FROM_INTENT[k];
  for (const [word, kind] of Object.entries(KIND_FROM_INTENT)) if (k.includes(word)) return kind;
  return "flow";
}

// ── role → shape ─────────────────────────────────────────────────────────────
function shapeFor(role: NodeRole, kind: DiagramKind): string {
  if (kind === "similarity") return "ellipse"; // points in a distance-true embedding
  switch (role) {
    case "start":
    case "end": return "round-rectangle"; // terminator (pill via large corner radius)
    case "decision": return "diamond";
    case "io": return "rhomboid";
    case "subprocess": return "round-rectangle";
    case "entity": return "rectangle";
    case "state": return "round-rectangle";
    case "actor": return "round-rectangle";
    default: return kind === "er" ? "rectangle" : "round-rectangle";
  }
}

// Adaptive colour policy: colour must EARN its place. In a simple diagram it's
// noise, so we go minimal (neutral boxes, a single accent on the terminators).
// In a complex one colour does real work — encoding role — alongside group
// (hulls) and importance (border weight). Decided from the data, not the caller.
type ColorPolicy = "minimal" | "rich";
function colorPolicy(kind: DiagramKind, nodeCount: number, groupCount: number): ColorPolicy {
  if (kind === "cluster" || groupCount >= 2 || nodeCount > 10) return "rich";
  return "minimal";
}

// Role → fill/border. minimal: neutral everywhere except the start/end accent.
// rich: a fixed semantic colour per role (the documented legend). Text colour is
// never hardcoded — it's chosen by measured WCAG contrast against the fill
// (readableOn), so e.g. white can't land on a light accent (Policy 2 / Tenet 6).
function roleStyle(role: NodeRole, t: ReturnType<typeof readTokens>, policy: ColorPolicy = "rich") {
  const fb = (): { fill: string; border: string } => {
    if (policy === "minimal") {
      if (role === "start") return { fill: t.primary, border: t.primary };
      if (role === "end") return { fill: t.mutedF, border: t.mutedF };
      return { fill: t.bg, border: t.border };
    }
    const accent = t.c[0], decide = t.c[2] || t.c[0], term = t.primary;
    switch (role) {
      case "start": return { fill: term, border: term };
      case "end": return { fill: t.mutedF, border: t.mutedF };
      case "decision": return { fill: t.bg, border: decide };
      case "entity": return { fill: t.bg, border: t.c[1] || accent };
      case "io": return { fill: t.bg, border: t.c[3] || accent };
      default: return { fill: t.bg, border: accent };
    }
  };
  const { fill, border } = fb();
  // Carbon SC 1.4.11 — a meaningful (role/group-coloured) border must clear 3:1
  // against the background; neutral structural outlines (minimal) stay subtle.
  const gborder = policy === "rich" ? ensureContrast(border, t.bg, 3) : border;
  return { fill, border: gborder, text: readableOn(fill, [t.fg, "#ffffff", "#111111"]) };
}

// ── deterministic label measuring (ELK needs sizes up front) ─────────────────
function wrap(label: string, max = 18): string[] {
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

// One padding budget for every shape, so the visual margin around the text is
// consistent. Diamonds and parallelograms inscribe their label, so they're
// enlarged geometrically to keep the SAME breathing room as the rectangles.
const CHAR_W = 7.4, LINE_H = 18, PAD_X = 20, PAD_Y = 14;
function sizeFor(n: SNode, role: NodeRole) {
  const head = n.label || n.id;
  const allLines = [...wrap(head), ...(role === "entity" ? (n.attrs || []) : [])];
  const longest = Math.max(1, ...allLines.map((l) => l.length));
  const textW = longest * CHAR_W, textH = allLines.length * LINE_H;
  let w = Math.min(240, Math.max(76, textW + PAD_X * 2));
  let h = Math.max(40, textH + PAD_Y * 2);
  if (role === "decision") { w = textW * 1.8 + PAD_X * 2; h = textH * 1.9 + PAD_Y * 2; }
  else if (role === "io") { w = textW + PAD_X * 3; } // parallelogram slant eats width
  else if (role === "start" || role === "end") { w = Math.max(76, textW + PAD_X * 2.2); }
  return { w: Math.round(w), h: Math.round(h) };
}

function labelFor(n: SNode, role: NodeRole): string {
  const head = wrap(n.label || n.id).join("\n");
  if (role === "entity" && n.attrs && n.attrs.length) return head + "\n" + n.attrs.map((a) => "· " + a).join("\n");
  return head;
}

// ── layout per kind ──────────────────────────────────────────────────────────
function layoutFor(kind: DiagramKind): cytoscape.LayoutOptions {
  if (kind === "cluster") {
    // force layout, but cluster-aware: tight communities, clear gaps between
    // them — so proximity actually encodes relatedness (then hulls confirm it).
    return {
      name: "fcose", quality: "default", animate: false, randomize: true, packComponents: true,
      nodeRepulsion: () => 9000, idealEdgeLength: () => 90, gravity: 0.15, nodeSeparation: 140,
      gravityRange: 3.4, numIter: 2500,
    } as unknown as cytoscape.LayoutOptions;
  }
  return elkLayout(kind);
}

// ── ELK layout per kind ──────────────────────────────────────────────────────
function elkLayout(kind: DiagramKind): cytoscape.LayoutOptions {
  const dir = kind === "er" || kind === "swimlane" ? "RIGHT" : "DOWN";
  return {
    name: "elk",
    fit: true,
    padding: 24,
    nodeDimensionsIncludeLabels: false,
    elk: {
      algorithm: "layered",
      "elk.direction": dir,
      "elk.layered.spacing.nodeNodeBetweenLayers": kind === "tree" ? 56 : 64,
      "elk.spacing.nodeNode": 38,
      "elk.layered.spacing.edgeNodeBetweenLayers": 24,
      // BRANDES_KOEPF + BALANCED straightens the main spine and centres parents
      // over their children, so the trunk reads as one vertical line and decision
      // branches fan symmetrically (verified headless against the flow/tree idioms).
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.crossingMinimization.semiInteractive": kind === "tree",
    },
  } as unknown as cytoscape.LayoutOptions;
}

// ── structural normalisation (the guardrail: dedupe / infer / cap / disclose) ─
const MAX_NODES = 60;
function normalize(kind: DiagramKind, nodesIn: SNode[], edgesIn: SEdge[]) {
  const notes: string[] = [];
  const seen = new Set<string>();
  let nodes = nodesIn.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
  if (nodes.length > MAX_NODES) {
    notes.push(`${nodes.length} elements exceeds the readable cap — showing the first ${MAX_NODES}.`);
    const keep = new Set(nodes.slice(0, MAX_NODES).map((n) => n.id));
    nodes = nodes.slice(0, MAX_NODES);
    edgesIn = edgesIn.filter((e) => keep.has(e.source) && keep.has(e.target));
  }
  const ids = new Set(nodes.map((n) => n.id));
  // Tenet 8 — never silently drop. Disclose edges that reference a missing node.
  const refDropped = edgesIn.filter((e) => !ids.has(e.source) || !ids.has(e.target)).length;
  if (refDropped) notes.push(`${refDropped} edge(s) referenced a missing node — omitted.`);
  const eseen = new Set<string>();
  const edges = edgesIn.filter((e) => {
    if (!ids.has(e.source) || !ids.has(e.target)) return false;
    const k = e.source + "→" + e.target + "·" + (e.label || "");
    return eseen.has(k) ? false : (eseen.add(k), true);
  });
  const unknownN = nodes.filter((n) => n.unknown).length;
  if (unknownN) notes.push(`${unknownN} element(s) marked uncertain.`);

  // infer roles for flow when omitted: zero in-degree → start, zero out → end.
  if (kind === "flow") {
    const indeg = new Map<string, number>(), outdeg = new Map<string, number>();
    nodes.forEach((n) => { indeg.set(n.id, 0); outdeg.set(n.id, 0); });
    edges.forEach((e) => { outdeg.set(e.source, (outdeg.get(e.source) || 0) + 1); indeg.set(e.target, (indeg.get(e.target) || 0) + 1); });
    nodes = nodes.map((n) => {
      if (n.role) return n;
      if ((indeg.get(n.id) || 0) === 0 && edges.length) return { ...n, role: "start" as NodeRole };
      if ((outdeg.get(n.id) || 0) === 0 && edges.length) return { ...n, role: "end" as NodeRole };
      return { ...n, role: "process" as NodeRole };
    });
  }
  return { nodes, edges, notes };
}

function defaultRole(kind: DiagramKind, n: SNode): NodeRole {
  if (n.role) return n.role;
  if (kind === "er") return "entity";
  if (kind === "state") return "state";
  if (kind === "tree") return "node";
  return "process";
}

// ── component ────────────────────────────────────────────────────────────────
export interface DiagramProps {
  /** What you want to draw — an intent (flow / hierarchy / state / er / …). */
  intent?: string;
  /** Force a specific idiom; otherwise inferred from intent. */
  kind?: DiagramKind;
  nodes: SNode[];
  edges: SEdge[];
  height?: number;
  /** Dev/QA badge: shows the chosen kind + element count. */
  showGrade?: boolean;
  /** THE escape hatch — warns; reserved for genuine edge cases. */
  unsafe?: boolean;
}

/** A guardrail component: props are meaning only; the result is always a clean
 *  box-and-arrow diagram. There is no prop that can produce an overlapping,
 *  mis-routed, or unreadable result. */
export function Diagram({ intent = "flow", kind, nodes = [], edges = [], height = 480, showGrade = false, unsafe = false }: DiagramProps) {
  if (unsafe && typeof console !== "undefined") {
    console.warn("<Diagram unsafe> bypasses the readability guardrails — use only for known edge cases.");
  }

  const intentKind = kindFromIntent(intent);
  // Registry rule (Tenet 2): a similarity/distance intent may NOT be forced onto
  // a layout where distance is meaningless — block the override and use the MDS
  // embedding instead. Illegal pairs are made unrepresentable, not just warned.
  const distanceMeaningless = new Set<DiagramKind>(["cluster", "flow", "tree", "state", "er", "swimlane"]);
  const blocked = intentKind === "similarity" && !!kind && kind !== "similarity" && distanceMeaningless.has(kind);
  const resolvedKind: DiagramKind = blocked ? "similarity" : kind || intentKind;
  const hostRef = React.useRef<HTMLDivElement>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);
  const [tip, setTip] = React.useState<{ x: number; y: number; text: string } | null>(null);
  const [cyState, setCyState] = React.useState<cytoscape.Core | null>(null);
  const [palette, setPalette] = React.useState<string[]>([]);
  const [bgColor, setBgColor] = React.useState<string>("");

  const built = React.useMemo(() => normalize(resolvedKind, nodes, edges), [resolvedKind, nodes, edges]);

  // Grouping & proximity: decide the common-region encoding. Swimlanes → lane
  // bands; an explicit `group` (or detected communities for clusters) → hulls.
  const grouping = React.useMemo(() => {
    const laneMap = new Map(built.nodes.map((n) => [n.id, n.lane != null ? String(n.lane) : ""]));
    if (resolvedKind === "swimlane") {
      const order = [...new Set(built.nodes.map((n) => n.lane).filter((l): l is string => l != null).map(String))];
      return { mode: "lanes" as const, named: true, order, keyOf: (id: string) => laneMap.get(id) ?? "" };
    }
    const hasGroup = built.nodes.some((n) => n.group != null);
    if (resolvedKind === "cluster" || hasGroup) {
      const detected = resolvedKind === "cluster" && !hasGroup ? detectGroups(built.nodes, built.edges) : undefined;
      const gmap = new Map(built.nodes.map((n) => [n.id, n.group != null ? String(n.group) : detected?.get(n.id) ?? "g0"]));
      // only label hulls when the groups are human-named (not auto "g0/g1").
      return { mode: "hulls" as const, named: hasGroup, order: [...new Set(gmap.values())], keyOf: (id: string) => gmap.get(id) ?? "g0" };
    }
    return null;
  }, [built, resolvedKind]);

  // Distance-true (stress/MDS) embedding for the similarity idiom — the only
  // layout where distance is allowed to MEAN similarity (Tenet 2). Carries a
  // stress score so the view can say how trustworthy the distances are.
  const sim = React.useMemo(
    () => (resolvedKind === "similarity" ? mdsPositions(built.nodes.map((n) => n.id), built.edges) : null),
    [built, resolvedKind]
  );

  // similarity shows hub labels only (the rest is read by position) — top by degree.
  const hubLabels = React.useMemo(() => {
    if (resolvedKind !== "similarity") return null;
    const deg = new Map<string, number>();
    built.edges.forEach((e) => { deg.set(e.source, (deg.get(e.source) || 0) + 1); deg.set(e.target, (deg.get(e.target) || 0) + 1); });
    const top = [...built.nodes].sort((a, b) => (deg.get(b.id) || 0) - (deg.get(a.id) || 0)).slice(0, Math.max(4, Math.round(built.nodes.length * 0.3)));
    return new Set(top.map((n) => n.id));
  }, [built, resolvedKind]);

  const buildStyle = React.useCallback(
    (t: ReturnType<typeof readTokens>): cytoscape.Stylesheet[] => [
      {
        selector: "node",
        style: {
          shape: "data(shape)" as unknown as cytoscape.Css.NodeShape,
          "background-color": "data(fill)",
          "background-opacity": 1,
          width: "data(w)" as unknown as number,
          height: "data(h)" as unknown as number,
          label: "data(label)",
          color: "data(text)",
          "font-size": "13px",
          "font-family": t.font,
          // similarity points carry the hub label below the dot, not inside.
          "text-valign": resolvedKind === "similarity" ? "bottom" : "center",
          "text-halign": "center",
          "text-margin-y": resolvedKind === "similarity" ? 3 : 0,
          "text-wrap": "wrap",
          "text-max-width": "200px",
          "line-height": 1.3,
          "border-width": "data(bw)" as unknown as number,
          "border-color": "data(border)",
          "corner-radius": "8px" as unknown as string,
          "min-zoomed-font-size": 6,
        } as cytoscape.Css.Node,
      },
      { selector: 'node[role = "start"], node[role = "end"]', style: { "corner-radius": "20px" } as unknown as cytoscape.Css.Node },
      { selector: 'node[mark = "initial"]', style: { "border-width": 3, "border-color": t.primary } as cytoscape.Css.Node },
      { selector: 'node[mark = "final"]', style: { "border-width": 3.5, "border-color": t.fg } as cytoscape.Css.Node },
      // Tenet 8 — uncertain elements are shown but visibly marked, not dropped.
      { selector: 'node[unknown = "1"]', style: { "border-style": "dashed", "border-color": t.mutedF, "background-opacity": 0.6, opacity: 0.78 } as unknown as cytoscape.Css.Node },
      {
        selector: "edge",
        style: {
          width: 1.6,
          // structured idioms get crisp, darker connectors (box-and-arrow);
          // force/similarity webs stay light so they don't overpower the nodes.
          "line-color": resolvedKind === "cluster" || resolvedKind === "similarity" ? t.border : t.mutedF,
          // force/cluster/similarity read cleaner with direct curves; structured
          // idioms use orthogonal taxi routing (boxes-and-arrows).
          "curve-style": resolvedKind === "cluster" || resolvedKind === "similarity" ? "bezier" : "taxi",
          "taxi-direction": resolvedKind === "er" || resolvedKind === "swimlane" ? "horizontal" : "downward",
          "taxi-turn": "50%",
          "taxi-turn-min-distance": "8px",
          "target-arrow-color": t.mutedF,
          "target-arrow-shape": resolvedKind === "er" || resolvedKind === "cluster" || resolvedKind === "similarity" ? "none" : "triangle",
          "arrow-scale": 0.95,
          label: "data(label)",
          "font-size": "11px",
          "font-family": t.font,
          // Readable label text with a background-coloured HALO, not a filled
          // chip. The old text-background chip rendered as a dark box over the
          // branch labels ("yes"/"no"); an outline halo keeps the text legible
          // over the connector without ever painting a box.
          color: ensureContrast(t.fg, t.bg, 4.5),
          "text-background-opacity": 0,
          "text-outline-color": t.bg,
          "text-outline-width": 3,
          "text-outline-opacity": 1,
          "text-margin-y": -3,
          // Tenet 5 — exploration edges are dim by default; hover reveals. Similarity
          // edges stay light but legible (position leads, connections still readable).
          opacity: resolvedKind === "similarity" ? 0.3 : resolvedKind === "cluster" ? 0.4 : 0.95,
        } as cytoscape.Css.Edge,
      },
      { selector: 'edge[kind = "no"]', style: { "line-style": "dashed", "line-color": t.mutedF } as cytoscape.Css.Edge },
      { selector: 'edge[kind = "async"], edge[kind = "return"]', style: { "line-style": "dashed" } as cytoscape.Css.Edge },
      // Tenet 8/9 — uncertain / inferred connections render dashed + faint.
      { selector: 'edge[unknown = "1"]', style: { "line-style": "dashed", opacity: 0.45 } as cytoscape.Css.Edge },
      // Decision branches are routed by ELK's orthogonal layered router — each
      // branch keeps its own label. (Earlier custom source/target-endpoints on
      // taxi edges produced degenerate stubs / boxes at the junction.)
      { selector: "node.faded", style: { opacity: 0.18 } },
      { selector: "edge.faded", style: { opacity: 0.08 } },
      { selector: "node.hl", style: { "border-width": 3, "border-color": t.primary } as cytoscape.Css.Node },
      { selector: "edge.hl", style: { "line-color": t.primary, "target-arrow-color": t.primary, width: 2.4, opacity: 1 } as cytoscape.Css.Edge },
    ],
    [resolvedKind]
  );

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const t0 = readTokens(host);

    const groupCount = grouping ? grouping.order.length : 0;
    const policy = colorPolicy(resolvedKind, built.nodes.length, groupCount);
    const degMap = new Map<string, number>();
    built.edges.forEach((e) => { degMap.set(e.source, (degMap.get(e.source) || 0) + 1); degMap.set(e.target, (degMap.get(e.target) || 0) + 1); });

    const roleById = new Map(built.nodes.map((n) => [n.id, defaultRole(resolvedKind, n)]));

    // Uniform sizing — the fundamental that makes a diagram read as deliberate
    // rather than ragged. Every rectangular role shares ONE width (and one height
    // for single-line boxes), so they stack into a clean centred column. Diamonds
    // stay proportional to their (short) label; entities keep their attribute
    // height but share the column width. Together with BRANDES_KOEPF/BALANCED
    // node placement (see elkLayout), the main spine comes out straight and the
    // decision branches fan symmetrically.
    const BOXY = new Set<NodeRole>(["process", "start", "end", "state", "subprocess", "node", "actor", "io"]);
    const natural = new Map(built.nodes.map((n) => [n.id, sizeFor(n, roleById.get(n.id)!)]));
    const boxNat = built.nodes.filter((n) => BOXY.has(roleById.get(n.id)!)).map((n) => natural.get(n.id)!);
    const uniW = boxNat.length ? Math.min(240, Math.max(96, ...boxNat.map((s) => s.w))) : 120;
    const uniH = boxNat.length ? Math.max(...boxNat.map((s) => s.h)) : 44;
    const sizeOf = (n: SNode, role: NodeRole, deg: number) => {
      if (resolvedKind === "similarity") { const d = 14 + Math.min(16, deg * 2); return { w: d, h: d }; }
      if (role === "decision") return natural.get(n.id)!;                                   // proportional diamond
      if (role === "entity") return { w: Math.max(uniW, natural.get(n.id)!.w), h: natural.get(n.id)!.h }; // uniform width, attr height
      if (BOXY.has(role)) return { w: uniW, h: uniH };                                      // the shared box
      return natural.get(n.id)!;
    };

    const elements: cytoscape.ElementDefinition[] = [
      ...built.nodes.map((n) => {
        const role = roleById.get(n.id)!;
        const deg = degMap.get(n.id) || 0;
        const { w, h } = sizeOf(n, role, deg);
        const rs = roleStyle(role, t0, policy);
        const showLbl = !hubLabels || hubLabels.has(n.id);
        return {
          data: {
            id: n.id, label: showLbl ? (n.unknown ? labelFor(n, role) + "  ?" : labelFor(n, role)) : "", role, shape: shapeFor(role, resolvedKind),
            w, h, fill: rs.fill, border: rs.border, text: rs.text,
            // importance (rich policy only): hubs get a heavier border.
            bw: policy === "rich" ? 1.5 + Math.min(3, deg * 0.5) : 1.6,
            mark: n.initial ? "initial" : n.final ? "final" : "",
            unknown: n.unknown ? "1" : "",
          },
        };
      }),
      ...built.edges.map((e, i) => ({
        // a decision's outgoing edges get a `branch` so they can fan out of
        // different vertices instead of collapsing into one shared corridor.
        data: {
          id: `e${i}`, source: e.source, target: e.target,
          label: e.label || (e.card ? e.card : ""), kind: e.kind || "flow",
          branch: roleById.get(e.source) === "decision" ? e.kind || "" : "",
          unknown: e.unknown ? "1" : "",
        },
      })),
    ];

    // similarity uses the distance-true MDS embedding (preset positions);
    // everything else uses its ELK / fcose / structured layout.
    const layout: cytoscape.LayoutOptions =
      resolvedKind === "similarity" && sim
        ? ({ name: "preset", positions: sim.pos, fit: true, padding: 40 } as unknown as cytoscape.LayoutOptions)
        : layoutFor(resolvedKind);

    const cy = cytoscape({
      container: host,
      elements,
      style: buildStyle(t0),
      layout,
      minZoom: 0.35,
      maxZoom: 2.4,
      wheelSensitivity: 0.2,
      autoungrabify: false,
    });
    cyRef.current = cy;
    setCyState(cy);
    setPalette(t0.c);
    setBgColor(t0.bg);

    // Swimlane: snap each node onto its lane row so the lane bands are clean
    // common regions (one positional encoding per axis: rank = x, lane = y).
    if (resolvedKind === "swimlane" && grouping?.order.length) {
      const order = grouping.order, LANE_H = 120;
      cy.one("layoutstop", () => {
        cy.batch(() => cy.nodes().forEach((node) => {
          const li = Math.max(0, order.indexOf(grouping.keyOf(node.id())));
          node.position({ x: node.position().x, y: li * LANE_H + LANE_H / 2 });
        }));
        cy.fit(undefined, 58);
      });
    }

    const isExplore = resolvedKind === "cluster";
    cy.on("mouseover", "node", (e) => {
      const p = e.target.renderedPosition();
      const raw = built.nodes.find((n) => n.id === e.target.id());
      setTip({ x: p.x, y: p.y, text: raw?.label || e.target.id() });
      // Tenet 5: dim by default, reveal the hovered node's neighbourhood on hover.
      if (isExplore) {
        const hood = e.target.closedNeighborhood();
        cy.elements().addClass("faded").removeClass("hl");
        hood.removeClass("faded").addClass("hl");
      }
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => (prev ? { ...prev, x: p.x, y: p.y } : prev));
    });
    cy.on("mouseout", "node", () => {
      setTip(null);
      if (isExplore) cy.elements().removeClass("faded hl");
    });
    cy.on("tap", "node", (e) => {
      const hood = e.target.closedNeighborhood();
      cy.elements().addClass("faded").removeClass("hl");
      hood.removeClass("faded").addClass("hl");
    });
    cy.on("tap", (e) => { if (e.target === cy) cy.elements().removeClass("faded hl"); });

    const restyle = () => {
      const el = hostRef.current; if (!el) return;
      const tk = readTokens(el);
      cy.batch(() => {
        cy.nodes().forEach((node) => {
          const raw = built.nodes.find((n) => n.id === node.id());
          if (!raw) return;
          const role = defaultRole(resolvedKind, raw);
          const rs = roleStyle(role, tk, policy);
          node.data("fill", rs.fill); node.data("border", rs.border); node.data("text", rs.text);
        });
      });
      cy.style(buildStyle(tk) as cytoscape.Stylesheet[]);
      setPalette(tk.c);
      setBgColor(tk.bg);
      cy.resize();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    let fitT: ReturnType<typeof setTimeout> | undefined;
    // grouped views need extra fit padding so hull / lane enclosures have
    // clearance from their contents and the canvas edge (they extend past nodes).
    const fitPad = grouping ? 58 : 28;
    const fitNow = () => {
      cy.resize(); cy.fit(undefined, fitPad);
      // signal for the screenshot-and-critique loop that layout has settled.
      host.parentElement?.parentElement?.setAttribute("data-diagram-ready", "1");
    };
    const ro = new ResizeObserver(() => { clearTimeout(fitT); fitT = setTimeout(fitNow, 30); });
    ro.observe(host);
    const settle = setTimeout(fitNow, 180);

    return () => {
      clearTimeout(fitT); clearTimeout(settle); ro.disconnect(); mo.disconnect(); cy.destroy(); cyRef.current = null; setCyState(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built, resolvedKind, buildStyle]);

  // Disclosures (Tenets 2 & 8): the stress score for distance-true views, and an
  // explicit "distance isn't meaning" note on exploratory force layouts.
  const notes = [
    ...(blocked ? [`Blocked: a similarity intent can't ride a "${kind}" layout — showing the distance-true (MDS) embedding instead.`] : []),
    ...built.notes,
    ...(sim ? [`Distance ≈ similarity · stress ${sim.stress}${sim.stress < 0.2 ? " (trustworthy)" : sim.stress < 0.35 ? " (borderline)" : " (loose — read clusters only)"}`] : []),
    ...(resolvedKind === "cluster" ? ["Force layout — distance is exploratory, not a measure of similarity."] : []),
  ];

  // Carbon accessibility — every visualisation carries an alternative data table.
  const th: React.CSSProperties = { textAlign: "left", padding: "2px 8px", borderBottom: "1px solid var(--border, #e5e5e5)", color: "var(--muted-foreground, #777)", fontWeight: 600 };
  const td: React.CSSProperties = { padding: "2px 8px", borderBottom: "1px solid var(--border, #eee)", color: "var(--foreground, #222)" };
  const cap: React.CSSProperties = { textAlign: "left", fontWeight: 700, padding: "0 0 4px", color: "var(--foreground, #222)" };

  return (
    <figure style={{ margin: 0, position: "relative", width: 720, maxWidth: "100%" }}>
      <div style={{ position: "relative", height, width: "100%", borderRadius: 10, border: "1px solid var(--border, #e5e5e5)", overflow: "hidden", background: "var(--background, #fff)" }}>
        {grouping && cyState && (
          <GroupLayer
            cy={cyState}
            mode={grouping.mode}
            keyOf={grouping.keyOf}
            order={grouping.order}
            colors={palette.length ? palette : ["#888888"]}
            labelOf={grouping.named ? (k) => k : undefined}
            bg={bgColor || undefined}
          />
        )}
        <div
          ref={hostRef}
          style={{ position: "absolute", inset: 0, zIndex: 2, background: "transparent" }}
          role="img"
          aria-label={`${resolvedKind} diagram, ${built.nodes.length} elements`}
        />
      </div>
      {tip && (
        <div
          style={{
            position: "absolute", left: tip.x, top: tip.y, pointerEvents: "none", zIndex: 10,
            transform: "translate(-50%, calc(-100% - 10px))", whiteSpace: "nowrap",
            background: "var(--background, #fff)", color: "var(--foreground, #111)",
            border: "1px solid var(--border, #e5e5e5)", borderRadius: 6, padding: "2px 8px",
            fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {tip.text}
        </div>
      )}
      {notes.length > 0 && (
        <figcaption style={{ marginTop: 8, fontSize: 11.5, color: "var(--muted-foreground, #777)", lineHeight: 1.45 }}>
          {notes.join(" · ")}
        </figcaption>
      )}
      <details style={{ marginTop: 6, fontSize: 11.5, color: "var(--muted-foreground, #777)" }}>
        <summary style={{ cursor: "pointer", userSelect: "none" }}>Data table</summary>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 8 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
            <caption style={cap}>Elements ({built.nodes.length})</caption>
            <thead><tr><th style={th}>Label</th><th style={th}>Role / group</th></tr></thead>
            <tbody>
              {built.nodes.map((n) => (
                <tr key={n.id}>
                  <td style={td}>{(n.label || n.id) + (n.unknown ? " (uncertain)" : "")}</td>
                  <td style={td}>{defaultRole(resolvedKind, n)}{n.group != null ? ` · ${n.group}` : n.lane ? ` · ${n.lane}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {built.edges.length > 0 && (
            <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
              <caption style={cap}>Connections ({built.edges.length})</caption>
              <thead><tr><th style={th}>From → To</th><th style={th}>Label</th></tr></thead>
              <tbody>
                {built.edges.map((e, i) => (
                  <tr key={i}>
                    <td style={td}>{e.source} → {e.target}{e.unknown ? " (uncertain)" : ""}</td>
                    <td style={td}>{e.label || e.card || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </details>
      {showGrade && (
        <span
          style={{
            position: "absolute", top: 10, right: 10, fontSize: 10.5, fontWeight: 600, padding: "2px 7px",
            borderRadius: 6, background: "var(--muted, #f4f4f5)", color: "var(--muted-foreground, #666)",
          }}
          title={`${resolvedKind} · ${built.nodes.length} nodes · ${built.edges.length} edges`}
        >
          {resolvedKind} · {built.nodes.length}
        </span>
      )}
    </figure>
  );
}

export default Diagram;
