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
import ELK from "elkjs/lib/elk.bundled.js";
import { readTokens, readableOn, ensureContrast } from "../charts/network";
import { GroupLayer } from "./GroupLayer";
import { EdgeLayer } from "./EdgeLayer";
import { detectGroups } from "./grouping";
import { mdsPositions } from "./mds";
import { wrap, uniformSizes, elkOptions } from "./layout";
import { TYPE, OPACITY, RADIUS, STROKE, neutralRoles } from "./primitives";
import { planEdges, buildElkGraph, extractRoutes, type Side, type RoutedEdge } from "./edgePolicy";
import type { DiagramKind, NodeRole, SNode, SEdge } from "./types";

// port side → cytoscape endpoint (percent of node bbox, centre origin, +y down)
const SIDE_ENDPOINT: Record<Side, string> = { NORTH: "0% -50%", SOUTH: "0% 50%", EAST: "50% 0%", WEST: "-50% 0%" };

// Idioms whose edges are drawn from ELK's actual routed sections (EdgeLayer),
// not cytoscape's taxi router — so the rendered route == the verified policy.
const ELK_ROUTED = new Set<DiagramKind>(["flow", "tree", "state", "er", "swimlane"]);
// one shared elkjs instance for direct (route-returning) layout in the browser.
const elkEngine = new ELK();

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
  // Carbon neutral baseline: light surface tiles, dark text, subtle borders —
  // never a mid-grey fill behind text. Polarity from the resolved canvas.
  const light = readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000";
  const n = neutralRoles(light);
  let fill = n.surface, border = n.border;
  if (policy === "minimal") {
    // terminators read with a slightly stronger (still neutral) outline.
    if (role === "start" || role === "end") border = n.borderStrong;
  } else {
    // rich: keep neutral tiles, but encode role with ONE accent on the border
    // (contrast-gated), instead of colouring the whole fill — calmer, Carbon-like.
    const accent = t.c[0], decide = t.c[2] || t.c[0];
    const a = role === "decision" ? decide : role === "entity" ? (t.c[1] || accent) : role === "io" ? (t.c[3] || accent) : accent;
    border = ensureContrast(a, n.surface, 3);
  }
  // text from the dark/light END of the ramp by measured contrast on the fill.
  const text = readableOn(fill, [n.text, n.surfaceAlt]);
  return { fill, border, text };
}

// Label measuring + uniform sizing + ELK options live in ./layout (pure, shared
// with the headless layout probe). labelFor is the on-canvas string only.
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
  return {
    name: "elk",
    fit: true,
    padding: 24,
    nodeDimensionsIncludeLabels: false,
    elk: elkOptions(kind),
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

  // Edge policy plans (pure) — shared by the layout (ELK ports) and the EdgeLayer
  // overlay. ELK-routed idioms draw edges from the routed sections, not cytoscape.
  const elkRouted = ELK_ROUTED.has(resolvedKind);
  const edgePlans = React.useMemo(
    () => planEdges(resolvedKind, built.nodes, built.edges, (id) => {
      const n = built.nodes.find((x) => x.id === id);
      return n ? defaultRole(resolvedKind, n) : "process";
    }),
    [resolvedKind, built]
  );
  const edgeLabels = React.useMemo(() => built.edges.map((e) => e.label || e.card || ""), [built]);
  const [edgeRoutes, setEdgeRoutes] = React.useState<RoutedEdge[]>([]);

  const buildStyle = React.useCallback(
    (t: ReturnType<typeof readTokens>): cytoscape.Stylesheet[] => {
      // edges & connectors use the neutral CONNECTOR step (light divider weight)
      // from the Carbon ramp — visible but quiet, recedes behind nodes/labels.
      const edgeColor = neutralRoles(readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000").line;
      return [
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
          "font-size": `${TYPE.nodeLabel.size}px`,
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
          "corner-radius": `${RADIUS.md}px` as unknown as string,
          "min-zoomed-font-size": 6,
        } as cytoscape.Css.Node,
      },
      { selector: 'node[role = "start"], node[role = "end"]', style: { "corner-radius": `${RADIUS.pill}px` } as unknown as cytoscape.Css.Node },
      // Initial / final states marked CONSISTENTLY: same accent colour and the
      // same modest weight as each other (not a jarring heavy black) — final adds
      // a double ring, the state-machine convention.
      { selector: 'node[mark = "initial"]', style: { "border-width": STROKE.heavy, "border-color": t.mutedF } as cytoscape.Css.Node },
      { selector: 'node[mark = "final"]', style: { "border-width": STROKE.heavy, "border-color": t.mutedF, "border-style": "double" } as unknown as cytoscape.Css.Node },
      // Tenet 8 — uncertain elements are shown but visibly marked, not dropped.
      { selector: 'node[unknown = "1"]', style: { "border-style": "dashed", "border-color": t.mutedF, "background-opacity": OPACITY.ghost, opacity: OPACITY.ghost } as unknown as cytoscape.Css.Node },
      {
        selector: "edge",
        style: {
          // ELK-routed idioms draw edges in the SVG EdgeLayer (from ELK's actual
          // routes); hide cytoscape's own edge so they don't double-draw.
          display: ELK_ROUTED.has(resolvedKind) ? "none" : "element",
          width: STROKE.regular,
          // structured idioms get crisp, darker connectors (box-and-arrow);
          // force/similarity webs stay light so they don't overpower the nodes.
          "line-color": edgeColor,
          // force/cluster/similarity read cleaner with direct curves; structured
          // idioms use orthogonal taxi routing (boxes-and-arrows).
          "curve-style": resolvedKind === "cluster" || resolvedKind === "similarity" ? "bezier" : "taxi",
          "taxi-direction": resolvedKind === "er" || resolvedKind === "swimlane" ? "horizontal" : "downward",
          "taxi-turn": "50%",
          "taxi-turn-min-distance": "8px",
          "target-arrow-color": edgeColor,
          "target-arrow-shape": resolvedKind === "er" || resolvedKind === "cluster" || resolvedKind === "similarity" ? "none" : "triangle",
          "arrow-scale": 0.95,
          label: "data(label)",
          "font-size": `${TYPE.edgeLabel.size}px`,
          "font-family": t.font,
          // Label plate: fill = the canvas background (so it knocks the connector
          // out from behind the text), a 1px border in the EDGE colour, and text
          // at 80% of the foreground (≈80% black on a light canvas). Reads as a
          // crisp chip that belongs to its edge.
          // chip = the BROWSER-RESOLVED background (t.bgSolid), so cytoscape's
          // canvas always parses it — a raw --background token (oklch/hsl) can
          // fall back to black, which was the black-box bug. Text colour is the
          // best contrast ON that chip (≈80% black on a light canvas).
          color: readableOn(t.bgSolid, ["#333333", "#dddddd"]),
          "text-background-color": t.bgSolid,
          "text-background-opacity": 1,
          "text-background-shape": "roundrectangle",
          "text-background-padding": "3px",
          "text-border-color": edgeColor,
          "text-border-width": STROKE.hair,
          "text-border-opacity": 1,
          "text-margin-y": -2,
          // Tenet 5 — exploration edges are dim by default; hover reveals. Similarity
          // edges stay light but legible (position leads, connections still readable).
          opacity: resolvedKind === "similarity" ? OPACITY.similarityEdge : resolvedKind === "cluster" ? OPACITY.exploreEdge : OPACITY.solid,
        } as cytoscape.Css.Edge,
      },
      { selector: 'edge[kind = "no"]', style: { "line-style": "dashed", "line-color": t.mutedF } as cytoscape.Css.Edge },
      { selector: 'edge[kind = "async"], edge[kind = "return"]', style: { "line-style": "dashed" } as cytoscape.Css.Edge },
      // Tenet 8/9 — uncertain / inferred connections render dashed + faint.
      { selector: 'edge[unknown = "1"]', style: { "line-style": "dashed", opacity: OPACITY.inferred } as cytoscape.Css.Edge },
      // Decision branches are routed by ELK's orthogonal layered router — each
      // branch keeps its own label. (Earlier custom source/target-endpoints on
      // taxi edges produced degenerate stubs / boxes at the junction.)
      { selector: "node.faded", style: { opacity: OPACITY.dimNode } },
      { selector: "edge.faded", style: { opacity: OPACITY.fadedEdge } },
      { selector: "node.hl", style: { "border-width": STROKE.heavy, "border-color": t.primary } as cytoscape.Css.Node },
      { selector: "edge.hl", style: { "line-color": t.primary, "target-arrow-color": t.primary, width: STROKE.heavy, opacity: OPACITY.solid } as cytoscape.Css.Edge },
      ];
    },
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

    // Uniform sizing (see ./layout) — shared with the headless probe, so the
    // sizes verified offline are exactly the sizes rendered here.
    const sizeMap = uniformSizes(built.nodes, (n) => roleById.get(n.id)!, {
      similarity: resolvedKind === "similarity",
      degOf: (id) => degMap.get(id) || 0,
    });

    const elements: cytoscape.ElementDefinition[] = [
      ...built.nodes.map((n) => {
        const role = roleById.get(n.id)!;
        const deg = degMap.get(n.id) || 0;
        const { w, h } = sizeMap.get(n.id)!;
        const rs = roleStyle(role, t0, policy);
        const showLbl = !hubLabels || hubLabels.has(n.id);
        return {
          data: {
            id: n.id, label: showLbl ? (n.unknown ? labelFor(n, role) + "  ?" : labelFor(n, role)) : "", role, shape: shapeFor(role, resolvedKind),
            w, h, fill: rs.fill, border: rs.border, text: rs.text,
            // importance (rich policy only): hubs get a heavier border.
            bw: policy === "rich" ? STROKE.regular + Math.min(3, deg * 0.5) : STROKE.regular,
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
    // ELK-routed idioms get positions from elkjs below (preset, applied async);
    // everything else uses its cytoscape-elk / fcose layout.
    const layout: cytoscape.LayoutOptions =
      resolvedKind === "similarity" && sim
        ? ({ name: "preset", positions: sim.pos, fit: true, padding: 40 } as unknown as cytoscape.LayoutOptions)
        : elkRouted
          ? ({ name: "preset", fit: true, padding: 30 } as unknown as cytoscape.LayoutOptions)
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

    // ELK-routed idioms: run elkjs directly (ports from the edge policy) to get
    // node positions AND edge routes, place the nodes, and hand the routes to the
    // EdgeLayer — so the rendered routing is exactly what the policy/probe verify.
    if (elkRouted) {
      // swimlanes → ELK partitioning by lane (bands), so positions AND routes
      // come from one engine (no manual snap), and EdgeLayer draws them.
      const partitionOf = resolvedKind === "swimlane" && grouping
        ? (id: string) => Math.max(0, grouping.order.indexOf(grouping.keyOf(id)))
        : undefined;
      const graph = buildElkGraph(resolvedKind, built.nodes.map((n) => n.id), (id) => sizeMap.get(id)!, edgePlans, partitionOf);
      elkEngine.layout(graph as never).then((res) => {
        const { boxes, routes } = extractRoutes(res);
        cy.batch(() => boxes.forEach((b) => { const n = cy.$id(b.id); if (n.nonempty()) n.position({ x: b.x + b.w / 2, y: b.y + b.h / 2 }); }));
        setEdgeRoutes(routes);
        cy.fit(undefined, 28);
      }).catch(() => { /* preset fallback stays */ });
    }

    // (Swimlane lanes now come from ELK partitioning above — no manual snap; the
    // lane bands in GroupLayer derive from the resulting node positions.)

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

    // Routing driven by the EDGE POLICY (edgePolicy.planEdges) — the same plan the
    // headless linter verifies. Each edge attaches to the port side the policy
    // assigned from its fan-out + direction (chain→bottom, split→sides,
    // decision-primary→bottom pass-through, decision-secondary→side, every edge
    // into its target's leading edge), so the rendered ports match the verified
    // routes. Cluster/similarity webs keep their bezier curves.
    // (edgePlans is the component-level memo above — reuse it, don't redeclare.)
    const planByEdgeId = new Map(edgePlans.map((p) => ["e" + p.index, p]));
    const horizontal = resolvedKind === "er" || resolvedKind === "swimlane";
    const smartRoute = () => {
      if (resolvedKind === "cluster" || resolvedKind === "similarity" || elkRouted) return;
      cy.edges().forEach((e) => {
        const p = planByEdgeId.get(e.id());
        if (!p) return;
        e.style({
          "source-endpoint": SIDE_ENDPOINT[p.sourceSide],
          "target-endpoint": SIDE_ENDPOINT[p.targetSide],
          "taxi-direction": horizontal ? "rightward" : "downward",
        });
      });
    };

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
      smartRoute();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    let fitT: ReturnType<typeof setTimeout> | undefined;
    // grouped views need extra fit padding so hull / lane enclosures have
    // clearance from their contents and the canvas edge (they extend past nodes).
    const fitPad = grouping ? 58 : 28;
    const fitNow = () => {
      cy.resize(); smartRoute(); cy.fit(undefined, fitPad);
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
        {elkRouted && cyState && (
          <EdgeLayer cy={cyState} routes={edgeRoutes} plans={edgePlans} labels={edgeLabels} />
        )}
        <div
          ref={hostRef}
          style={{ position: "absolute", inset: 0, zIndex: 2, background: "transparent" }}
          role="img"
          aria-label={`${resolvedKind} diagram, ${built.nodes.length} elements`}
        />
        {cyState && <ZoomControls cy={cyState} />}
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

// Floating zoom / fit control — Carbon's pattern for diagrams: scale controls in
// a small elevated tile over the canvas, so the user can zoom and pan freely and
// reset to fit. Zoom stays within the component's min/max.
function ZoomControls({ cy }: { cy: cytoscape.Core }) {
  const z = (f: number) => {
    const level = Math.min(2.4, Math.max(0.35, cy.zoom() * f));
    cy.zoom({ level, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };
  const btn: React.CSSProperties = {
    width: 30, height: 30, display: "grid", placeItems: "center", border: "none",
    background: "var(--background, #fff)", color: "var(--foreground, #111)", cursor: "pointer",
    fontSize: 16, lineHeight: 1, padding: 0,
  };
  const div: React.CSSProperties = { height: 1, background: "var(--border, #e5e5e5)" };
  return (
    <div
      style={{
        position: "absolute", right: 10, bottom: 10, zIndex: 3, display: "flex", flexDirection: "column",
        borderRadius: 8, overflow: "hidden", border: "1px solid var(--border, #e5e5e5)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)", background: "var(--background, #fff)",
      }}
      role="group"
      aria-label="Diagram zoom controls"
    >
      <button style={btn} onClick={() => z(1.2)} title="Zoom in" aria-label="Zoom in">+</button>
      <div style={div} />
      <button style={btn} onClick={() => z(1 / 1.2)} title="Zoom out" aria-label="Zoom out">−</button>
      <div style={div} />
      <button style={{ ...btn, fontSize: 13 }} onClick={() => cy.fit(undefined, 28)} title="Fit to view" aria-label="Fit to view">⤢</button>
    </div>
  );
}

export default Diagram;
