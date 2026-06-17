"use client";
// Diagram.tsx — the reference GUARDRAIL component (Diagram › Policies).
//
// Meaning-only API: you pass WHAT to show (intent + nodes + edges), never HOW.
// There is no position/style/colour/layout prop — so a bad diagram cannot be
// expressed. Internally it runs the god-layer pipeline (buildDiagram: pick →
// layout → validate → auto-correct) and renders only the resulting valid view,
// themed entirely from DS tokens. When it must simplify to stay readable, it
// says so. Bad output is unrepresentable.
//
// This exemplar renders with plain SVG + the bundled simpleLayout, so it is
// self-contained. A production build injects a cytoscape/ELK layout into
// buildDiagram; the API and guarantees stay identical.

import * as React from "react";
import { buildDiagram } from "./buildDiagram";
import type { DNode, DEdge } from "./types";

const PALETTE = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];
const trunc = (s?: string, n = 14) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

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
export function Diagram({ intent = "explore", nodes = [], edges = [], height = 360, showGrade = false, unsafe = false }: DiagramProps) {
  if (unsafe && typeof console !== "undefined") {
    console.warn("<Diagram unsafe> bypasses the readability guardrails — use only for known edge cases.");
  }

  const built = React.useMemo(
    () => buildDiagram({ intent, nodes, edges, palette: { maxColors: PALETTE.length } }),
    [intent, nodes, edges]
  );

  const vnodes = built.view.nodes || [];
  const vedges = built.view.edges || [];

  const { viewBox, fillFor, pos } = React.useMemo(() => {
    const pad = 44;
    const xs = vnodes.map((n) => n.x ?? 0);
    const ys = vnodes.map((n) => n.y ?? 0);
    const minX = Math.min(0, ...xs) - pad;
    const minY = Math.min(0, ...ys) - pad;
    const w = Math.max(...xs, 1) - minX + pad;
    const h = Math.max(...ys, 1) - minY + pad;
    const groups = [...new Set(vnodes.map((n) => n.group))];
    const gi = new Map(groups.map((g, i) => [g, i]));
    const fillFor = (g: unknown) =>
      g === "__other__" || g == null
        ? "var(--muted-foreground, #999)"
        : `var(${PALETTE[(gi.get(g as never) ?? 0) % PALETTE.length]}, #888)`;
    return { viewBox: `${minX} ${minY} ${w} ${h}`, fillFor, pos: new Map(vnodes.map((n) => [n.id, n])) };
  }, [vnodes]);

  return (
    <figure style={{ margin: 0, position: "relative" }}>
      <svg
        viewBox={viewBox}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${intent} diagram, ${vnodes.length} nodes`}
        style={{ display: "block", borderRadius: 8, border: "1px solid var(--border, #e5e5e5)", background: "var(--background, #fff)" }}
      >
        <g stroke="var(--border, #ccc)" strokeWidth={1.2} opacity={0.8}>
          {vedges.map((e, i) => {
            const a = pos.get(e.source), b = pos.get(e.target);
            if (!a || !b) return null;
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>
        <g>
          {vnodes.map((n) => (
            <circle key={n.id} cx={n.x} cy={n.y} r={(n.w || 22) / 2} fill={fillFor(n.group)} stroke="var(--background, #fff)" strokeWidth={1.5} />
          ))}
        </g>
        <g fill="var(--foreground, #111)" fontSize={11} fontFamily="inherit" textAnchor="middle">
          {vnodes
            .filter((n) => n.label && n.showLabel !== false)
            .map((n) => (
              <text key={n.id} x={n.x} y={(n.y ?? 0) + (n.h || 22) / 2 + 13}>
                {trunc(n.label)}
              </text>
            ))}
        </g>
      </svg>

      {built.notes.length > 0 && (
        <figcaption style={{ marginTop: 6, fontSize: 11, color: "var(--muted-foreground, #777)", lineHeight: 1.4 }}>
          {built.notes.join(" · ")}
        </figcaption>
      )}

      {showGrade && (
        <span
          style={{ position: "absolute", top: 8, right: 8, fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "var(--muted, #f4f4f5)", color: "var(--muted-foreground, #666)" }}
          title={`${built.contract} · score ${built.score.toFixed(2)}`}
        >
          {built.contract} · {built.grade}
        </span>
      )}
    </figure>
  );
}

export default Diagram;
