"use client";
// SequenceDiagram.tsx — a guardrail component for interaction/sequence diagrams.
//
// Sequence diagrams don't have a graph layout: the participants are columns, the
// lifelines run top-to-bottom, and messages are ordered horizontal arrows. So
// this renders deterministic SVG (not cytoscape), themed entirely through DS
// CSS variables — no oklch canvas problem, re-themes for free with the Design
// Layer. Meaning-only API: participants + ordered messages; the engine fixes the
// geometry so the result is always aligned and legible.

import * as React from "react";
import type { SNode, SEdge } from "./types";

export interface SequenceDiagramProps {
  /** Columns, left→right. */
  participants: SNode[];
  /** Ordered messages (top→bottom = array order). kind: flow|async|return. */
  messages: SEdge[];
  height?: number;
}

const COL_GAP = 150;
const BOX_W = 120;
const BOX_H = 38;
const TOP = 14;
const ROW_GAP = 46;
const PAD_X = 24;
const SELF_W = 46;

export function SequenceDiagram({ participants = [], messages = [], height }: SequenceDiagramProps) {
  const idx = new Map(participants.map((p, i) => [p.id, i]));
  const colX = (i: number) => PAD_X + BOX_W / 2 + i * COL_GAP;

  const headerBottom = TOP + BOX_H;
  const firstRow = headerBottom + 34;
  const valid = messages.filter((m) => idx.has(m.source) && idx.has(m.target));
  const rowY = (r: number) => firstRow + r * ROW_GAP;

  const width = PAD_X * 2 + BOX_W + Math.max(0, participants.length - 1) * COL_GAP;
  const lifeBottom = rowY(valid.length) + 6;
  const h = height ?? lifeBottom + 16;

  return (
    <figure style={{ margin: 0, width, maxWidth: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${h}`}
        width="100%"
        role="img"
        aria-label={`sequence diagram, ${participants.length} participants, ${valid.length} messages`}
        style={{ fontFamily: "var(--font-sans, inherit)", display: "block" }}
      >
        <defs>
          <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted-foreground, #777)" />
          </marker>
          <marker id="seq-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke="var(--muted-foreground, #777)" strokeWidth="1.4" />
          </marker>
        </defs>

        {/* lifelines */}
        {participants.map((p, i) => (
          <line
            key={`life-${p.id}`}
            x1={colX(i)} y1={headerBottom} x2={colX(i)} y2={lifeBottom}
            stroke="var(--border, #e5e5e5)" strokeWidth="1.2" strokeDasharray="4 4"
          />
        ))}

        {/* participant headers */}
        {participants.map((p, i) => (
          <g key={`head-${p.id}`}>
            <rect
              x={colX(i) - BOX_W / 2} y={TOP} width={BOX_W} height={BOX_H} rx="8"
              fill="var(--background, #fff)" stroke="var(--primary, #555)" strokeWidth="1.6"
            />
            <text
              x={colX(i)} y={TOP + BOX_H / 2} textAnchor="middle" dominantBaseline="central"
              fontSize="12.5" fontWeight={600} fill="var(--foreground, #111)"
            >
              {trunc(p.label || p.id, 16)}
            </text>
          </g>
        ))}

        {/* messages */}
        {valid.map((m, r) => {
          const from = idx.get(m.from ?? m.source)!;
          const to = idx.get(m.to ?? m.target)!;
          const y = rowY(r);
          const dashed = m.kind === "async" || m.kind === "return";
          const marker = m.kind === "return" || m.kind === "async" ? "url(#seq-open)" : "url(#seq-arrow)";
          const label = m.label || "";

          if (from === to) {
            const x = colX(from);
            return (
              <g key={`msg-${r}`}>
                <path
                  d={`M ${x} ${y - 8} h ${SELF_W} v 16 h ${-SELF_W}`}
                  fill="none" stroke="var(--muted-foreground, #777)" strokeWidth="1.4"
                  strokeDasharray={dashed ? "5 4" : undefined} markerEnd={marker}
                />
                {label && (
                  <text x={x + SELF_W + 6} y={y - 2} fontSize="11" fill="var(--muted-foreground, #777)">{trunc(label, 24)}</text>
                )}
              </g>
            );
          }

          const x1 = colX(from);
          const x2 = colX(to);
          const dir = x2 > x1 ? -1 : 1;
          return (
            <g key={`msg-${r}`}>
              {label && (
                <text
                  x={(x1 + x2) / 2} y={y - 7} textAnchor="middle" fontSize="11"
                  fill="var(--foreground, #111)"
                >
                  {trunc(label, 30)}
                </text>
              )}
              <line
                x1={x1 + dir * 2} y1={y} x2={x2 - dir * 2} y2={y}
                stroke="var(--muted-foreground, #777)" strokeWidth="1.5"
                strokeDasharray={dashed ? "5 4" : undefined} markerEnd={marker}
              />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default SequenceDiagram;
