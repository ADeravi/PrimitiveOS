"use client";
// Diagram.tsx — the reference GUARDRAIL component (Diagram › Policies).
//
// Meaning-only API: you pass WHAT to show (intent + nodes + edges), never HOW.
// There is no position/style/colour/layout prop — so a bad diagram cannot be
// expressed. Internally it runs the god-layer pipeline (buildDiagram: pick the
// idiom → validate → auto-correct) and renders the result on the real cytoscape
// engine — proper force / hierarchy / circle / concentric / grid layouts, pan /
// zoom / hover, themed entirely from DS tokens. When it must simplify to stay
// readable, it says so. Bad output is unrepresentable.

import * as React from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import avsdf from "cytoscape-avsdf";
import { buildDiagram } from "./buildDiagram";
import { clampPalette, thinLabels } from "./diagramLint";
import { readTokens } from "../charts/network";
import type { DNode, DEdge } from "./types";

try {
  cytoscape.use(fcose);
  cytoscape.use(dagre);
  cytoscape.use(avsdf);
} catch {
  /* already registered */
}

const trunc = (s?: string, n = 16) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

// Contract → cytoscape layout. matrix/timeline don't have a node-link layout,
// so they fall back to the tidiest sensible engine (grid / preset-by-time).
function layoutFor(contract: string, nodes: DNode[], linkDist = 60): cytoscape.LayoutOptions {
  const animate = false as const;
  switch (contract) {
    case "hierarchy":
      return { name: "dagre", rankDir: "TB", nodeSep: 26, rankSep: 48, animate } as unknown as cytoscape.LayoutOptions;
    case "circle":
      return { name: "avsdf", nodeSeparation: 14 + linkDist * 0.6, animate } as unknown as cytoscape.LayoutOptions;
    case "concentric":
      return {
        name: "concentric",
        concentric: (n: cytoscape.NodeSingular) => n.degree(false),
        levelWidth: () => 1,
        minNodeSpacing: 26,
        animate,
      } as unknown as cytoscape.LayoutOptions;
    case "grid":
    case "matrix":
      return { name: "grid", avoidOverlap: true, condense: false, animate } as cytoscape.LayoutOptions;
    case "timeline": {
      // x by year, y by group lane.
      const years = nodes.map((n) => n.year).filter((y): y is number => y != null);
      const minY = Math.min(...years, 0), maxY = Math.max(...years, 1);
      const lanes = [...new Set(nodes.map((n) => n.group ?? 0))];
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach((n, i) => {
        const t = n.year != null && maxY > minY ? (n.year - minY) / (maxY - minY) : i / Math.max(1, nodes.length);
        positions[n.id] = { x: 60 + t * 640, y: 60 + lanes.indexOf(n.group ?? 0) * 84 };
      });
      return { name: "preset", positions, fit: true, padding: 30, animate } as unknown as cytoscape.LayoutOptions;
    }
    case "force":
    default:
      return {
        name: "fcose", quality: "default", animate, randomize: true, packComponents: true,
        nodeRepulsion: () => 6000, idealEdgeLength: () => 30 + linkDist, gravity: 0.3, nodeSeparation: 80,
      } as unknown as cytoscape.LayoutOptions;
  }
}

export interface DiagramProps {
  /** What you want to show — an intent, never a chart type. */
  intent?: "explore" | "flow" | "similarity" | "importance" | "time" | "dense" | "sequence" | "catalog" | string;
  nodes: DNode[];
  edges: DEdge[];
  height?: number;
  /** Diagnostics badge (dev/QA): shows the chosen contract + grade. */
  showGrade?: boolean;
  /** THE escape hatch — warns and opts out of the guarantees. Edge cases only. */
  unsafe?: boolean;
}

/** A guardrail component: props are meaning only; the result is always valid. */
export function Diagram({ intent = "explore", nodes = [], edges = [], height = 460, showGrade = false, unsafe = false }: DiagramProps) {
  if (unsafe && typeof console !== "undefined") {
    console.warn("<Diagram unsafe> bypasses the readability guardrails — use only for known edge cases.");
  }

  const hostRef = React.useRef<HTMLDivElement>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);
  const [tip, setTip] = React.useState<{ x: number; y: number; text: string } | null>(null);

  // The pipeline decides the contract + cleans the data (palette cap, label
  // thinning). We let cytoscape do the layout, so positions come from the
  // engine — but everything else (which idiom, which colours, which labels) is
  // the guardrail's call, not the caller's.
  const built = React.useMemo(() => {
    const b = buildDiagram({ intent, nodes, edges, palette: { maxColors: 5 } });
    let data = clampPalette(nodes.map((n) => ({ ...n })), 5);
    data = thinLabels(data);
    return { contract: b.contract as string, grade: b.grade, score: b.score, notes: b.notes, nodes: data };
  }, [intent, nodes, edges]);

  const deg = React.useMemo(() => {
    const d = new Map<string, number>();
    edges.forEach((e) => { d.set(e.source, (d.get(e.source) || 0) + 1); d.set(e.target, (d.get(e.target) || 0) + 1); });
    return d;
  }, [edges]);

  const arrows = built.contract === "hierarchy";

  const buildStyle = React.useCallback(
    (t: ReturnType<typeof readTokens>): cytoscape.Stylesheet[] => {
      return [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            width: "mapData(deg, 1, 7, 26, 60)" as unknown as number,
            height: "mapData(deg, 1, 7, 26, 60)" as unknown as number,
            label: "data(label)",
            color: t.fg,
            "font-size": "13px",
            "font-family": t.font,
            "min-zoomed-font-size": 5,
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 5,
            "text-wrap": "ellipsis",
            "text-max-width": "100px",
            "border-width": 1.5,
            "border-color": t.bg,
          } as cytoscape.Css.Node,
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": t.border,
            "curve-style": "unbundled-bezier",
            "control-point-distances": 26,
            "control-point-weights": 0.5,
            "target-arrow-color": t.mutedF,
            "target-arrow-shape": arrows ? "triangle" : "none",
            "arrow-scale": 0.85,
            opacity: 0.85,
          } as cytoscape.Css.Edge,
        },
        { selector: "node.faded", style: { opacity: 0.12 } },
        { selector: "edge.faded", style: { opacity: 0.05 } },
        { selector: "node.hl", style: { "border-color": t.primary, "border-width": 2.5 } as cytoscape.Css.Node },
        { selector: "edge.hl", style: { "line-color": t.primary, width: 2.4, opacity: 1 } as cytoscape.Css.Edge },
      ];
    },
    [arrows]
  );

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const t0 = readTokens(host);
    const groups = [...new Set(built.nodes.map((n) => n.group))];
    const gi = new Map(groups.map((g, i) => [g, i]));
    const colorFor = (g: number | string | undefined) =>
      g === "__other__" || g == null ? t0.mutedF : t0.c[(gi.get(g) ?? 0) % t0.c.length];

    const cy = cytoscape({
      container: host,
      elements: [
        ...built.nodes.map((n) => ({
          data: { id: n.id, label: n.showLabel === false ? "" : trunc(n.label), deg: deg.get(n.id) ?? 1, group: n.group, color: colorFor(n.group) },
        })),
        ...edges.map((e, i) => ({ data: { id: `e${i}`, source: e.source, target: e.target } })),
      ],
      style: buildStyle(t0),
      layout: layoutFor(built.contract, built.nodes),
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;

    cy.on("mouseover", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip({ x: p.x, y: p.y, text: `${e.target.data("label") || e.target.id()} · degree ${e.target.data("deg")}` });
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => (prev ? { ...prev, x: p.x, y: p.y } : prev));
    });
    cy.on("mouseout", "node", () => setTip(null));
    cy.on("tap", "node", (e) => {
      const hood = e.target.closedNeighborhood();
      cy.elements().addClass("faded");
      hood.removeClass("faded").addClass("hl");
      cy.elements().not(hood).removeClass("hl");
    });
    cy.on("tap", (e) => { if (e.target === cy) cy.elements().removeClass("faded hl"); });

    // Re-theme when the Design Layer / dark mode changes.
    const restyle = () => {
      const el = hostRef.current; if (!el) return;
      const tk = readTokens(el);
      cy.batch(() => cy.nodes().forEach((n) => n.data("color", colorFor(n.data("group")))));
      cy.style(buildStyle(tk) as cytoscape.Stylesheet[]);
      cy.resize();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    let fitT: ReturnType<typeof setTimeout> | undefined;
    const fitNow = () => { cy.resize(); cy.fit(undefined, 28); };
    const ro = new ResizeObserver(() => { clearTimeout(fitT); fitT = setTimeout(fitNow, 30); });
    ro.observe(host);
    const settle = setTimeout(fitNow, 160);

    return () => {
      clearTimeout(fitT); clearTimeout(settle); ro.disconnect(); mo.disconnect(); cy.destroy(); cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built, deg, buildStyle]);

  return (
    <figure style={{ margin: 0, position: "relative", width: 640, maxWidth: "100%" }}>
      <div
        ref={hostRef}
        style={{ height, width: "100%", borderRadius: 10, border: "1px solid var(--border, #e5e5e5)", background: "var(--background, #fff)" }}
        role="img"
        aria-label={`${intent} diagram, ${built.nodes.length} nodes`}
      />
      {tip && (
        <div
          style={{
            position: "absolute", left: tip.x, top: tip.y, pointerEvents: "none", zIndex: 10,
            transform: "translate(-50%, calc(-100% - 8px))", whiteSpace: "nowrap",
            background: "var(--background, #fff)", color: "var(--foreground, #111)",
            border: "1px solid var(--border, #e5e5e5)", borderRadius: 6, padding: "2px 8px",
            fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {tip.text}
        </div>
      )}
      {built.notes.length > 0 && (
        <figcaption style={{ marginTop: 8, fontSize: 11.5, color: "var(--muted-foreground, #777)", lineHeight: 1.45 }}>
          {built.notes.join(" · ")}
        </figcaption>
      )}
      {showGrade && (
        <span
          style={{
            position: "absolute", top: 10, right: 10, fontSize: 10.5, fontWeight: 600, padding: "2px 7px",
            borderRadius: 6, background: "var(--muted, #f4f4f5)", color: "var(--muted-foreground, #666)",
          }}
          title={`${built.contract} · score ${built.score.toFixed(2)}`}
        >
          {built.contract} · {built.grade}
        </span>
      )}
    </figure>
  );
}

export default Diagram;
