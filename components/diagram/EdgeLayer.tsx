"use client";
// EdgeLayer.tsx — renders edges from ELK's ACTUAL routed sections (the geometry
// the edge policy specifies and the probe verifies), as an SVG overlay locked to
// the cytoscape viewport — the same pan/zoom-synced pattern as GroupLayer. This
// replaces cytoscape's taxi router for the structured idioms, so what's drawn ==
// what's verified: ports honoured, corner budgets kept, labels on the longest
// straight run. Labels are SVG (resolved colours), so the canvas-token black-box
// bug can't occur here.

import * as React from "react";
import type cytoscape from "cytoscape";
import { readTokens, readableOn } from "../charts/network";
import type { EdgePlan, RoutedEdge } from "./edgePolicy";

export interface EdgeLayerProps {
  cy: cytoscape.Core | null;
  routes: RoutedEdge[];
  plans: EdgePlan[];
  /** edge label by edge index. */
  labels: string[];
}

type Tf = { x: number; y: number; z: number };

export function EdgeLayer({ cy, routes, plans, labels }: EdgeLayerProps) {
  const [tf, setTf] = React.useState<Tf>({ x: 0, y: 0, z: 1 });
  const [col, setCol] = React.useState({ edge: "#8a8a8a", bg: "#ffffff", text: "#333333" });

  React.useEffect(() => {
    if (!cy) return;
    let raf = 0;
    const recompute = () => {
      raf = 0;
      setTf({ x: cy.pan().x, y: cy.pan().y, z: cy.zoom() });
      const el = cy.container();
      if (el) {
        const t = readTokens(el as HTMLElement);
        // canvas is light if black contrasts it more than white does.
        const light = readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000";
        setCol({
          edge: t.border,                       // subtle/light connector (Carbon divider)
          bg: light ? "#ffffff" : "#161616",    // chip pinned to an END of the grey ramp
          text: light ? "#161616" : "#f4f4f4",  // the OPPOSITE end — never mid-grey, so it can't wash out
        });
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(recompute); };
    cy.on("render pan zoom resize", schedule);
    schedule();
    return () => { cy.off("render pan zoom resize", schedule); if (raf) cancelAnimationFrame(raf); };
  }, [cy]);

  const planByIdx = React.useMemo(() => new Map(plans.map((p) => [p.index, p])), [plans]);

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }} aria-hidden>
      <g transform={`translate(${tf.x} ${tf.y}) scale(${tf.z})`}>
        {routes.map((r) => {
          if (!r.points || r.points.length < 2) return null;
          const p = planByIdx.get(r.index);
          const d = "M " + r.points.map((pt) => `${pt.x} ${pt.y}`).join(" L ");
          const dash = p?.dashed ? "5 4" : undefined;

          // arrowhead oriented along the final segment (directed edges only)
          const a = r.points[r.points.length - 1], b = r.points[r.points.length - 2];
          const ang = Math.atan2(a.y - b.y, a.x - b.x);
          const s = 9;
          const arrow = p && p.directed
            ? `${a.x},${a.y} ${a.x - s * Math.cos(ang - 0.45)},${a.y - s * Math.sin(ang - 0.45)} ${a.x - s * Math.cos(ang + 0.45)},${a.y - s * Math.sin(ang + 0.45)}`
            : null;

          // label on the LONGEST straight segment (never on a corner)
          const lbl = labels[r.index];
          let chip: React.ReactNode = null;
          if (lbl) {
            let best = -1, bi = 0;
            for (let i = 0; i < r.points.length - 1; i++) {
              const len = Math.hypot(r.points[i + 1].x - r.points[i].x, r.points[i + 1].y - r.points[i].y);
              if (len > best) { best = len; bi = i; }
            }
            const mx = (r.points[bi].x + r.points[bi + 1].x) / 2;
            const my = (r.points[bi].y + r.points[bi + 1].y) / 2;
            const fs = 12, w = lbl.length * fs * 0.62 + 12, h = fs + 8;
            chip = (
              <g>
                <rect x={mx - w / 2} y={my - h / 2} width={w} height={h} rx={4} fill={col.bg} stroke={col.edge} strokeWidth={1} />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize={fs} fill={col.text}>{lbl}</text>
              </g>
            );
          }

          return (
            <g key={r.index}>
              <path d={d} fill="none" stroke={col.edge} strokeWidth={1.6} strokeDasharray={dash} strokeLinejoin="round" opacity={0.95} />
              {arrow && <polygon points={arrow} fill={col.edge} />}
              {chip}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default EdgeLayer;
