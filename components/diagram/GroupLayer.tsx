"use client";
// GroupLayer.tsx — the render half of the shared Grouping & Proximity layer.
//
// An SVG overlay locked to a cytoscape instance's pan/zoom. It draws *common
// region* — the most reliable grouping cue after connectedness — as either soft
// convex-hull blobs behind communities (network / force / flow / er) or full
// swimlane bands (ordered groups). Geometry is computed in MODEL coordinates
// from node positions and transformed by the live viewport, so it tracks the
// graph exactly during pan, zoom and re-layout. Used by both diagram families.

import * as React from "react";
import type cytoscape from "cytoscape";
import { hullPath, laneBands, type GNode } from "./grouping";

export interface GroupLayerProps {
  cy: cytoscape.Core | null;
  /** common-region blobs per community, or horizontal swimlane bands. */
  mode: "hulls" | "lanes";
  /** node id → group/lane key. */
  keyOf: (id: string) => string;
  /** band order (lanes mode); also fixes colour order. */
  order?: string[];
  /** ordered colour ramp (resolved DS tokens). */
  colors: string[];
  /** optional human label per key (lanes show it on the left). */
  labelOf?: (key: string) => string;
}

type Tf = { x: number; y: number; z: number };
type Shape = { key: string; color: string; path?: string; band?: { x: number; y: number; w: number; h: number }; labelXY?: { x: number; y: number } };

export function GroupLayer({ cy, mode, keyOf, order, colors, labelOf }: GroupLayerProps) {
  const [tf, setTf] = React.useState<Tf>({ x: 0, y: 0, z: 1 });
  const [shapes, setShapes] = React.useState<Shape[]>([]);

  React.useEffect(() => {
    if (!cy) return;
    let raf = 0;

    const colorFor = (key: string) => {
      const keys = order && order.length ? order : [...new Set(cy.nodes().map((n) => keyOf(n.id())))].sort();
      const i = Math.max(0, keys.indexOf(key));
      return colors[i % colors.length];
    };

    const recompute = () => {
      raf = 0;
      setTf({ x: cy.pan().x, y: cy.pan().y, z: cy.zoom() });

      const gnodes: GNode[] = cy.nodes().map((n) => {
        const p = n.position();
        return { id: n.id(), x: p.x, y: p.y, w: n.width(), h: n.height(), group: keyOf(n.id()), lane: keyOf(n.id()) };
      });
      if (!gnodes.length) { setShapes([]); return; }

      if (mode === "lanes") {
        const lanes = order && order.length ? order : [...new Set(gnodes.map((n) => n.lane!))];
        const minX = Math.min(...gnodes.map((n) => n.x! - (n.w || 0) / 2));
        const maxX = Math.max(...gnodes.map((n) => n.x! + (n.w || 0) / 2));
        const bands = laneBands(gnodes, lanes, { minX, maxX }, { pad: 22 });
        setShapes(
          bands.map((b) => ({
            key: b.lane, color: colorFor(b.lane),
            band: { x: b.x, y: b.y, w: b.w, h: b.h },
            labelXY: { x: b.x + 10, y: b.y + 16 },
          }))
        );
        return;
      }

      // hulls: one blob per group, sized from member node extents
      const groups = new Map<string, GNode[]>();
      gnodes.forEach((n) => { const k = n.group!; (groups.get(k) || groups.set(k, []).get(k)!).push(n); });
      const out: Shape[] = [];
      groups.forEach((arr, key) => {
        const centres = arr.map((n) => ({ x: n.x!, y: n.y! }));
        const maxHalf = Math.max(20, ...arr.map((n) => Math.max(n.w || 0, n.h || 0) / 2));
        out.push({ key, color: colorFor(key), path: hullPath(centres, maxHalf + 14, 16) });
      });
      setShapes(out);
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(recompute); };
    cy.on("render pan zoom resize position add remove layoutstop", schedule);
    schedule();
    return () => { cy.off("render pan zoom resize position add remove layoutstop", schedule); if (raf) cancelAnimationFrame(raf); };
  }, [cy, mode, keyOf, order, colors, labelOf]);

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }} aria-hidden>
      <g transform={`translate(${tf.x} ${tf.y}) scale(${tf.z})`}>
        {shapes.map((s) =>
          s.band ? (
            <g key={s.key}>
              <rect x={s.band.x} y={s.band.y} width={s.band.w} height={s.band.h} rx={10} fill={s.color} fillOpacity={0.06} stroke={s.color} strokeOpacity={0.35} strokeWidth={1 / tf.z} />
              {labelOf && s.labelXY && (
                <text x={s.labelXY.x} y={s.labelXY.y} fontSize={12 / tf.z} fontWeight={600} fill={s.color} opacity={0.85}>
                  {labelOf(s.key)}
                </text>
              )}
            </g>
          ) : (
            <path key={s.key} d={s.path} fill={s.color} fillOpacity={0.08} stroke={s.color} strokeOpacity={0.4} strokeWidth={1.5 / tf.z} />
          )
        )}
      </g>
    </svg>
  );
}

export default GroupLayer;
