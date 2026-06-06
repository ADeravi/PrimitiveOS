"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { chord, ribbon } from "d3-chord";
import { hierarchy, cluster, tree, pack } from "d3-hierarchy";
import { arc, lineRadial, curveBundle, linkVertical } from "d3-shape";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta: Meta = {
  title: "Patterns/Graph Idioms",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Alternative visual grammars for the same relational data — beyond node-link diagrams. Pure SVG with d3 math (d3-chord, d3-hierarchy, d3-shape); every fill and stroke references the design tokens directly, so the idioms re-theme with the Design Layer and dark mode.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Shared data (same network as Patterns/Network Graphs)
// ---------------------------------------------------------------------------
const NODES = [
  { id: "h1", group: 0 },
  { id: "h2", group: 1 },
  { id: "h3", group: 2 },
  { id: "a1", group: 0 },
  { id: "a2", group: 0 },
  { id: "a3", group: 0 },
  { id: "a4", group: 0 },
  { id: "b1", group: 1 },
  { id: "b2", group: 1 },
  { id: "b3", group: 1 },
  { id: "b4", group: 1 },
  { id: "c1", group: 2 },
  { id: "c2", group: 2 },
  { id: "c3", group: 2 },
  { id: "c4", group: 2 },
];

const EDGES: [string, string][] = [
  ["h1", "a1"], ["h1", "a2"], ["h1", "a3"], ["h1", "a4"],
  ["h2", "b1"], ["h2", "b2"], ["h2", "b3"], ["h2", "b4"],
  ["h3", "c1"], ["h3", "c2"], ["h3", "c3"], ["h3", "c4"],
  ["h1", "h2"], ["h2", "h3"], ["h1", "h3"],
  ["a2", "b1"], ["b3", "c2"],
];

const GROUP_COLOR = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];
const GROUP_OF: Record<string, number> = Object.fromEntries(
  NODES.map((n) => [n.id, n.group])
);

const DEGREE: Record<string, number> = {};
EDGES.forEach(([s, t]) => {
  DEGREE[s] = (DEGREE[s] ?? 0) + 1;
  DEGREE[t] = (DEGREE[t] ?? 0) + 1;
});

// Nodes ordered by group then id — used by arc diagram and matrix.
const ORDER = [...NODES].sort((a, b) => a.group - b.group || a.id.localeCompare(b.id));
const INDEX: Record<string, number> = Object.fromEntries(ORDER.map((n, i) => [n.id, i]));

// Hierarchy: root → groups → members (used by bundling, tidy tree, packing).
const GROUP_TREE = {
  id: "root",
  children: [0, 1, 2].map((g) => ({
    id: `group-${g}`,
    children: NODES.filter((n) => n.group === g).map((n) => ({ id: n.id })),
  })),
};

type TreeDatum = { id: string; children?: TreeDatum[] };

// ---------------------------------------------------------------------------
// 1. Arc diagram
// ---------------------------------------------------------------------------
function ArcDiagram() {
  const step = 28;
  const x = (id: string) => 24 + INDEX[id] * step;
  const baseY = 148;
  return (
    <svg viewBox="0 0 440 178" className="w-full">
      {EDGES.map(([s, t]) => {
        const x1 = Math.min(x(s), x(t));
        const x2 = Math.max(x(s), x(t));
        const r = (x2 - x1) / 2;
        return (
          <path
            key={`${s}-${t}`}
            d={`M ${x1},${baseY} A ${r},${r} 0 0 1 ${x2},${baseY}`}
            fill="none"
            stroke={GROUP_OF[s] === GROUP_OF[t] ? "var(--border)" : "var(--chart-4)"}
            strokeWidth={1.2}
            opacity={0.9}
          />
        );
      })}
      {ORDER.map((n) => (
        <g key={n.id}>
          <circle cx={x(n.id)} cy={baseY} r={3 + DEGREE[n.id]} fill={GROUP_COLOR[n.group]} />
          <text
            x={x(n.id)}
            y={baseY + 18}
            textAnchor="middle"
            fontSize={7}
            fontFamily="monospace"
            fill="var(--muted-foreground)"
          >
            {n.id}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 2. Adjacency matrix
// ---------------------------------------------------------------------------
function AdjacencyMatrix() {
  const cell = 13;
  const pad = 24;
  const has = new Set(EDGES.flatMap(([s, t]) => [`${s}|${t}`, `${t}|${s}`]));
  return (
    <svg viewBox={`0 0 ${pad + 15 * cell + 4} ${pad + 15 * cell + 4}`} className="w-full max-h-64 mx-auto">
      {ORDER.map((row, i) => (
        <text
          key={`r-${row.id}`}
          x={pad - 4}
          y={pad + i * cell + cell * 0.72}
          textAnchor="end"
          fontSize={6}
          fontFamily="monospace"
          fill="var(--muted-foreground)"
        >
          {row.id}
        </text>
      ))}
      {ORDER.map((col, j) => (
        <text
          key={`c-${col.id}`}
          x={pad + j * cell + cell / 2}
          y={pad - 5}
          textAnchor="middle"
          fontSize={6}
          fontFamily="monospace"
          fill="var(--muted-foreground)"
        >
          {col.id}
        </text>
      ))}
      {ORDER.map((row, i) =>
        ORDER.map((col, j) => {
          const connected = has.has(`${row.id}|${col.id}`);
          const diagonal = i === j;
          return (
            <rect
              key={`${row.id}-${col.id}`}
              x={pad + j * cell}
              y={pad + i * cell}
              width={cell - 1}
              height={cell - 1}
              rx={2}
              fill={
                diagonal
                  ? GROUP_COLOR[row.group]
                  : connected
                    ? GROUP_COLOR[GROUP_OF[row.id]]
                    : "var(--muted)"
              }
              opacity={diagonal ? 0.35 : connected ? 0.9 : 0.6}
            />
          );
        })
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3. Chord diagram (inter-group edge counts)
// ---------------------------------------------------------------------------
const CHORD_MATRIX = (() => {
  const m = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  EDGES.forEach(([s, t]) => {
    m[GROUP_OF[s]][GROUP_OF[t]] += 1;
    m[GROUP_OF[t]][GROUP_OF[s]] += 1;
  });
  return m;
})();

function ChordDiagram() {
  const layout = chord().padAngle(0.07)(CHORD_MATRIX);
  const arcGen = arc().innerRadius(82).outerRadius(94);
  const ribbonGen = ribbon().radius(78);
  return (
    <svg viewBox="-105 -105 210 210" className="w-full max-h-64 mx-auto">
      {layout.groups.map((g) => (
        <path key={g.index} d={arcGen(g as never) as unknown as string} fill={GROUP_COLOR[g.index]} />
      ))}
      {layout.map((c, i) => (
        <path
          key={i}
          d={ribbonGen(c as never) as unknown as string}
          fill={GROUP_COLOR[c.source.index]}
          opacity={0.55}
          stroke="var(--border)"
          strokeWidth={0.5}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. Hive plot (axes by group, position by degree rank)
// ---------------------------------------------------------------------------
function HivePlot() {
  const angles = [-90, 30, 150].map((d) => (d * Math.PI) / 180);
  const pos: Record<string, { x: number; y: number }> = {};
  [0, 1, 2].forEach((g) => {
    const members = NODES.filter((n) => n.group === g).sort(
      (a, b) => DEGREE[a.id] - DEGREE[b.id]
    );
    members.forEach((n, i) => {
      const r = 32 + (i / (members.length - 1)) * 72;
      pos[n.id] = { x: Math.cos(angles[g]) * r, y: Math.sin(angles[g]) * r };
    });
  });
  return (
    <svg viewBox="-120 -120 240 240" className="w-full max-h-64 mx-auto">
      {angles.map((a, g) => (
        <line
          key={g}
          x1={Math.cos(a) * 24}
          y1={Math.sin(a) * 24}
          x2={Math.cos(a) * 112}
          y2={Math.sin(a) * 112}
          stroke="var(--border)"
          strokeWidth={2}
        />
      ))}
      {EDGES.map(([s, t]) => {
        const p1 = pos[s];
        const p2 = pos[t];
        const cx = ((p1.x + p2.x) / 2) * 0.25;
        const cy = ((p1.y + p2.y) / 2) * 0.25;
        return (
          <path
            key={`${s}-${t}`}
            d={`M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`}
            fill="none"
            stroke={GROUP_COLOR[GROUP_OF[s]]}
            strokeWidth={1}
            opacity={0.55}
          />
        );
      })}
      {NODES.map((n) => (
        <circle key={n.id} cx={pos[n.id].x} cy={pos[n.id].y} r={3 + DEGREE[n.id] * 0.6} fill={GROUP_COLOR[n.group]} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 5. Hierarchical edge bundling
// ---------------------------------------------------------------------------
function EdgeBundling() {
  const root = hierarchy<TreeDatum>(GROUP_TREE as TreeDatum);
  cluster<TreeDatum>().size([360, 84])(root);
  const leaves = new Map(root.leaves().map((l) => [l.data.id, l]));
  const line = lineRadial<{ x: number; y: number }>()
    .curve(curveBundle.beta(0.85))
    .angle((d) => (d.x * Math.PI) / 180)
    .radius((d) => d.y);
  return (
    <svg viewBox="-110 -110 220 220" className="w-full max-h-64 mx-auto">
      {EDGES.map(([s, t]) => {
        const path = leaves.get(s)!.path(leaves.get(t)!) as unknown as {
          x: number;
          y: number;
        }[];
        return (
          <path
            key={`${s}-${t}`}
            d={line(path) ?? ""}
            fill="none"
            stroke={GROUP_COLOR[GROUP_OF[s]]}
            strokeWidth={1.1}
            opacity={0.6}
          />
        );
      })}
      {root.leaves().map((l) => {
        const a = ((l.x! - 90) * Math.PI) / 180;
        const cx = Math.cos(a) * (l.y! + 8);
        const cy = Math.sin(a) * (l.y! + 8);
        return (
          <g key={l.data.id}>
            <circle cx={cx} cy={cy} r={3.5} fill={GROUP_COLOR[GROUP_OF[l.data.id]]} />
            <text
              x={Math.cos(a) * (l.y! + 18)}
              y={Math.sin(a) * (l.y! + 18) + 2}
              textAnchor="middle"
              fontSize={6}
              fontFamily="monospace"
              fill="var(--muted-foreground)"
            >
              {l.data.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. Tidy tree (Reingold–Tilford)
// ---------------------------------------------------------------------------
const BFS_TREE: TreeDatum = {
  id: "h1",
  children: [
    { id: "a1" },
    { id: "a2" },
    { id: "a3" },
    { id: "a4" },
    { id: "h2", children: [{ id: "b1" }, { id: "b2" }, { id: "b3" }, { id: "b4" }] },
    { id: "h3", children: [{ id: "c1" }, { id: "c2" }, { id: "c3" }, { id: "c4" }] },
  ],
};

function TidyTree() {
  const root = hierarchy<TreeDatum>(BFS_TREE);
  tree<TreeDatum>().size([400, 120])(root);
  const link = linkVertical<unknown, { x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y + 20);
  return (
    <svg viewBox="0 0 420 175" className="w-full">
      <g transform="translate(10,0)">
        {root.links().map((l, i) => (
          <path
            key={i}
            d={link(l as never) ?? ""}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1.2}
          />
        ))}
        {root.descendants().map((n) => (
          <g key={n.data.id}>
            <circle cx={n.x} cy={n.y! + 20} r={n.children ? 7 : 4.5} fill={GROUP_COLOR[GROUP_OF[n.data.id]]} />
            <text
              x={n.x}
              y={n.y! + 20 + (n.children ? -12 : 14)}
              textAnchor="middle"
              fontSize={7}
              fontFamily="monospace"
              fill="var(--muted-foreground)"
            >
              {n.data.id}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. Circle packing
// ---------------------------------------------------------------------------
function CirclePacking() {
  const root = hierarchy<TreeDatum>(GROUP_TREE as TreeDatum)
    .sum((d) => (d.children ? 0 : 1 + (DEGREE[d.id] ?? 0)))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  pack<TreeDatum>().size([220, 220]).padding(4)(root);
  return (
    <svg viewBox="0 0 220 220" className="w-full max-h-64 mx-auto">
      {root.descendants().map((n) => {
        if (n.depth === 0) return null;
        const isLeaf = !n.children;
        return (
          <g key={n.data.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={isLeaf ? GROUP_COLOR[GROUP_OF[n.data.id]] : "none"}
              stroke={isLeaf ? "none" : "var(--border)"}
              strokeWidth={1.2}
              opacity={isLeaf ? 0.85 : 1}
            />
            {isLeaf && n.r! > 9 && (
              <text
                x={n.x}
                y={n.y! + 2}
                textAnchor="middle"
                fontSize={6.5}
                fontFamily="monospace"
                fill="var(--background)"
              >
                {n.data.id}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
const IDIOMS = [
  {
    title: "Arc Diagram",
    description: "Nodes on a line, links as arcs — cross-group links highlighted.",
    Component: ArcDiagram,
  },
  {
    title: "Adjacency Matrix",
    description: "The scalable answer when node-link turns into a hairball.",
    Component: AdjacencyMatrix,
  },
  {
    title: "Chord Diagram",
    description: "Aggregated connection volume between the three groups.",
    Component: ChordDiagram,
  },
  {
    title: "Hive Plot",
    description: "One axis per group; position encodes degree rank.",
    Component: HivePlot,
  },
  {
    title: "Hierarchical Edge Bundling",
    description: "Links routed through the group hierarchy, bundled by similarity.",
    Component: EdgeBundling,
  },
  {
    title: "Tidy Tree",
    description: "Reingold–Tilford layout of the breadth-first spanning tree.",
    Component: TidyTree,
  },
  {
    title: "Circle Packing",
    description: "Containment instead of links — area encodes degree.",
    Component: CirclePacking,
  },
];

export const IdiomGallery: Story = {
  name: "Idiom Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Graph Idioms</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            The same network as the Layout Gallery, expressed in seven non-node-link
            grammars. All geometry is computed with d3; all colour comes straight from
            the design tokens.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {IDIOMS.map(({ title, description, Component }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Component />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  ),
};
