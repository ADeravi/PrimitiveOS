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
import { ensureContrast } from "../charts/network";

export interface GroupLayerProps {
  cy: cytoscape.Core | null;
  /** common-region blobs per community, or horizontal swimlane bands. */
  mode: "hulls" | "lanes";
  /** node id → PRIMARY group/lane key (colour, ordering). */
  keyOf: (id: string) => string;
  /** node id → EVERY group it belongs to. A node in two groups is drawn inside both
   *  hulls, which is what makes their overlap a real intersection. Defaults to keyOf. */
  keysOf?: (id: string) => string[];
  /** band order (lanes mode); also fixes colour order. */
  order?: string[];
  /** ordered colour ramp (resolved DS tokens). */
  colors: string[];
  /** optional human label per key (lanes show it on the left, hulls on top). */
  labelOf?: (key: string) => string;
  /** the canvas background, so each label's group hue is contrast-gated against
   *  it (a light hue is darkened until it clears 4.5:1 — never hue-on-hue). */
  bg?: string;
  /** explicit label colour override; otherwise the contrast-gated group hue. */
  labelColor?: string;
  /** Fired when the user drags a GROUP. Moving members via the API doesn't raise
   *  cytoscape's "drag", so the host can't otherwise know its precomputed edge
   *  routes just went stale. */
  onGroupDrag?: () => void;
}

/** Vertical room reserved at the top of every hull for the group's own label, so it
 *  sits INSIDE the region with clear air above the first row of nodes. */
const LABEL_BAND = 26;

type Tf = { x: number; y: number; z: number };
type Shape = { key: string; color: string; path?: string; band?: { x: number; y: number; w: number; h: number }; labelXY?: { x: number; y: number }; members?: string[] };

export function GroupLayer({ cy, mode, keyOf, keysOf, order, colors, labelOf, labelColor, bg, onGroupDrag }: GroupLayerProps) {
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
        const bands = laneBands(gnodes, lanes, { minX, maxX }, { pad: 30 });
        setShapes(
          bands.map((b) => ({
            key: b.lane, color: colorFor(b.lane),
            band: { x: b.x, y: b.y, w: b.w, h: b.h },
            labelXY: { x: b.x + 12, y: b.y + LABEL_BAND * 0.66 },
            members: gnodes.filter((n) => n.lane === b.lane).map((n) => n.id),
          }))
        );
        return;
      }

      // hulls: one blob per group, sized from member node extents. A node with
      // several memberships is added to EACH — that's what draws the intersection.
      const groups = new Map<string, GNode[]>();
      gnodes.forEach((n) => {
        const keys = keysOf ? keysOf(n.id) : [n.group!];
        keys.forEach((k) => { (groups.get(k) || groups.set(k, []).get(k)!).push(n); });
      });
      const out: Shape[] = [];
      groups.forEach((arr, key) => {
        // Hull the node BOX CORNERS, not the centres. Two reasons the old centre-hull
        // cut through its own members:
        //   1. a centre-hull only clears the nodes if `pad` exceeds every member's
        //      half-extent — one wide label and the boundary crosses the box;
        //   2. hullPath smooths with quadratic Béziers whose CONTROL points are the
        //      hull vertices, and a quadratic never reaches its control point — the
        //      drawn curve always cuts INSIDE the computed hull.
        // Feeding corners makes the hull enclose the real extents before any smoothing,
        // so the inward cut lands in the margin instead of across the nodes.
        // Clearance = HALF the members' shortest edge. Proportional, so big boxes get a
        // generous margin and small ones stay tight.
        const shortEdge = Math.min(...arr.map((n) => Math.min(n.w || 40, n.h || 24)));
        const pad = Math.max(12, shortEdge * 0.5);
        // VERTICAL margin is deliberately larger, and larger again at the TOP: the
        // group's label lives inside the region, and without headroom it either sits on
        // the top row of nodes or floats outside its own hull.
        const padY = pad * 1.25;
        const padTop = padY + LABEL_BAND;
        // Inflate each node box by the per-axis padding BEFORE hulling, so the padding
        // is anisotropic — hullPath's own pad is radial and can't distinguish axes.
        const corners: { x: number; y: number }[] = [];
        arr.forEach((n) => {
          const hw = (n.w || 40) / 2 + pad, hhTop = (n.h || 24) / 2 + padTop, hhBot = (n.h || 24) / 2 + padY;
          corners.push(
            { x: n.x! - hw, y: n.y! - hhTop }, { x: n.x! + hw, y: n.y! - hhTop },
            { x: n.x! + hw, y: n.y! + hhBot }, { x: n.x! - hw, y: n.y! + hhBot },
          );
        });
        const cx = arr.reduce((s, n) => s + n.x!, 0) / arr.length;
        // Label INSIDE the hull: sit it in the headroom band we just reserved, below the
        // hull's own top edge — never above it, and never on the nodes.
        const hullTop = Math.min(...corners.map((p) => p.y));
        const topY = hullTop + LABEL_BAND * 0.72;
        out.push({ key, color: colorFor(key), path: hullPath(corners, 4, 18), labelXY: { x: cx, y: topY }, members: arr.map((n) => n.id) });
      });
      setShapes(out);
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(recompute); };
    cy.on("render pan zoom resize position add remove layoutstop", schedule);
    schedule();
    return () => { cy.off("render pan zoom resize position add remove layoutstop", schedule); if (raf) cancelAnimationFrame(raf); };
  }, [cy, mode, keyOf, keysOf, order, colors, labelOf]);

  // ── grab a GROUP: drag the region, its members move together ────────────────
  // The layer itself stays pointer-transparent so nodes and the canvas keep their own
  // interactions; only the shapes opt in. Deltas are divided by zoom because pointer
  // movement is in screen pixels and node positions are in model coordinates.
  const drag = React.useRef<{ x: number; y: number; ids: string[] } | null>(null);
  const onGroupDown = (e: React.PointerEvent, members?: string[]) => {
    if (!cy || !members || !members.length) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ids: members };
    onGroupDrag?.();
  };
  const onGroupMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !cy) return;
    const z = cy.zoom() || 1;
    const dx = (e.clientX - d.x) / z, dy = (e.clientY - d.y) / z;
    if (!dx && !dy) return;
    cy.batch(() => d.ids.forEach((id) => {
      const n = cy.$id(id);
      if (n.nonempty()) { const p = n.position(); n.position({ x: p.x + dx, y: p.y + dy }); }
    }));
    drag.current = { ...d, x: e.clientX, y: e.clientY };
  };
  const endGroupDrag = () => { drag.current = null; };

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }}
      onPointerMove={onGroupMove}
      onPointerUp={endGroupDrag}
      onPointerCancel={endGroupDrag}
      aria-hidden
    >
      <g transform={`translate(${tf.x} ${tf.y}) scale(${tf.z})`}>
        {shapes.map((s) => {
          // label hue, darkened/lightened just enough to read on the canvas (Tenet 6).
          const labelFill = labelColor || ensureContrast(s.color, bg || "#ffffff", 4.5);
          return s.band ? (
            <g key={s.key}>
              <rect
                x={s.band.x} y={s.band.y} width={s.band.w} height={s.band.h} rx={8}
                fill={s.color} fillOpacity={0.06} stroke={s.color} strokeOpacity={0.35} strokeWidth={1 / tf.z}
                style={{ pointerEvents: "all", cursor: "grab" }}
                onPointerDown={(e) => onGroupDown(e, s.members)}
              />
              {labelOf && s.labelXY && (
                <text x={s.labelXY.x} y={s.labelXY.y} fontSize={12 / tf.z} fontWeight={700} fill={labelFill}>
                  {labelOf(s.key)}
                </text>
              )}
            </g>
          ) : (
            <g key={s.key}>
              <path
                d={s.path} fill={s.color} fillOpacity={0.08} stroke={s.color} strokeOpacity={0.4} strokeWidth={1.5 / tf.z}
                style={{ pointerEvents: "all", cursor: "grab" }}
                onPointerDown={(e) => onGroupDown(e, s.members)}
              />
              {labelOf && s.labelXY && (
                <text x={s.labelXY.x} y={s.labelXY.y} textAnchor="middle" fontSize={12 / tf.z} fontWeight={700} fill={labelFill}>
                  {labelOf(s.key)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default GroupLayer;
