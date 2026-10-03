"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import cola from "cytoscape-cola";
import cise from "cytoscape-cise";
import avsdf from "cytoscape-avsdf";
import elk from "cytoscape-elk";
import euler from "cytoscape-euler";
import Graphology from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Register layout extensions once (guarded against HMR re-registration).
try {
  cytoscape.use(fcose);
  cytoscape.use(dagre);
  cytoscape.use(cola);
  cytoscape.use(cise);
  cytoscape.use(avsdf);
  cytoscape.use(elk);
  cytoscape.use(euler);
} catch {
  /* already registered */
}

const meta: Meta = {
  title: "Charts/Network Graphs",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Graph layout families from the Cytoscape manual, rendered with Cytoscape.js (MIT) plus the open layout extensions fCoSE, dagre, cola, CiSE and AVSDF. Node colours map groups to the --chart-* tokens and edges use --border, so every layout re-themes with the Design Layer and dark mode. The proprietary yFiles layouts are represented by their open equivalents (dagre ≈ Hierarchic, fCoSE ≈ Organic, AVSDF ≈ Circular).",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Sample graph: 3 attribute groups, hubs + leaves + cross-links
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

const EDGES = [
  ["h1", "a1"], ["h1", "a2"], ["h1", "a3"], ["h1", "a4"],
  ["h2", "b1"], ["h2", "b2"], ["h2", "b3"], ["h2", "b4"],
  ["h3", "c1"], ["h3", "c2"], ["h3", "c3"], ["h3", "c4"],
  ["h1", "h2"], ["h2", "h3"], ["h1", "h3"],
  ["a2", "b1"], ["b3", "c2"],
];

const ELEMENTS = [
  ...NODES.map((n) => ({ data: { id: n.id, group: n.group } })),
  ...EDGES.map(([s, t]) => ({ data: { id: `${s}-${t}`, source: s, target: t } })),
];

// Node-id clusters per attribute group (used by the CiSE layout).
const CLUSTERS = [0, 1, 2].map((g) =>
  NODES.filter((n) => n.group === g).map((n) => n.id)
);

// ---------------------------------------------------------------------------
// Precomputed position maps for preset-based layouts
// ---------------------------------------------------------------------------
// Gephi's ForceAtlas2 via graphology — positions computed once, served preset.
const FA2_POSITIONS = (() => {
  const g = new Graphology();
  NODES.forEach((n, i) => {
    const a = (i / NODES.length) * 2 * Math.PI;
    g.addNode(n.id, { x: Math.cos(a) * 100, y: Math.sin(a) * 100 });
  });
  EDGES.forEach(([s, t]) => g.addEdge(s, t));
  const pos = forceAtlas2(g, {
    iterations: 400,
    settings: { gravity: 1, scalingRatio: 6, adjustSizes: false },
  });
  return Object.fromEntries(
    Object.entries(pos).map(([id, p]) => [id, { x: p.x, y: p.y }])
  );
})();

// Bipartite: hubs in the left column, leaves in the right.
const BIPARTITE_POSITIONS = (() => {
  const hubs = NODES.filter((n) => n.id.startsWith("h"));
  const leaves = NODES.filter((n) => !n.id.startsWith("h"));
  const pos: Record<string, { x: number; y: number }> = {};
  hubs.forEach((n, i) => (pos[n.id] = { x: 0, y: 60 + i * 110 }));
  leaves.forEach((n, i) => (pos[n.id] = { x: 260, y: i * 32 }));
  return pos;
})();

// Timeline: x = ordinal position, y = attribute group row.
const TIMELINE_POSITIONS = (() => {
  const pos: Record<string, { x: number; y: number }> = {};
  NODES.forEach((n, i) => (pos[n.id] = { x: i * 36, y: n.group * 90 }));
  return pos;
})();

// ---------------------------------------------------------------------------
// Token bridge: resolve CSS vars (oklch) to rgb for the canvas renderer
// ---------------------------------------------------------------------------
function toRgb(color: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !color) return "rgb(128, 128, 128)";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function readTheme(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const v = (name: string) => toRgb(cs.getPropertyValue(name).trim());
  return {
    groups: [v("--chart-1"), v("--chart-2"), v("--chart-3")],
    edge: v("--border"),
    label: v("--muted-foreground"),
  };
}

type Theme = ReturnType<typeof readTheme>;

function buildStyle(t: Theme, curve: "bezier" | "taxi" = "bezier") {
  return [
    {
      selector: "node",
      style: {
        "background-color": (ele: cytoscape.NodeSingular) =>
          t.groups[(ele.data("group") as number) % t.groups.length],
        label: "data(id)",
        color: t.label,
        "font-size": 7,
        "text-valign": "bottom" as const,
        "text-margin-y": 3,
        width: (ele: cytoscape.NodeSingular) => 12 + ele.degree(false) * 2.5,
        height: (ele: cytoscape.NodeSingular) => 12 + ele.degree(false) * 2.5,
      },
    },
    {
      selector: "edge",
      style: {
        "line-color": t.edge,
        width: 1.5,
        "curve-style": curve,
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Graph card
// ---------------------------------------------------------------------------
function Graph({
  layout,
  curve = "bezier",
}: {
  layout: Record<string, unknown>;
  curve?: "bezier" | "taxi";
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let theme = readTheme(el);
    const cy = cytoscape({
      container: el,
      elements: ELEMENTS,
      style: buildStyle(theme, curve) as unknown as cytoscape.StylesheetJson,
      layout: { padding: 12, animate: false, ...layout } as cytoscape.LayoutOptions,
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
    });

    // Re-theme when the Design Layer / dark mode changes the CSS variables.
    const sync = setInterval(() => {
      const next = readTheme(el);
      if (JSON.stringify(next) !== JSON.stringify(theme)) {
        theme = next;
        cy.style(buildStyle(theme, curve) as unknown as cytoscape.StylesheetJson);
      }
    }, 1200);

    return () => {
      clearInterval(sync);
      cy.destroy();
    };
  }, [layout, curve]);

  return <div ref={ref} className="h-64 w-full" />;
}

function GraphCard({
  title,
  manualName,
  description,
  layout,
  curve,
}: {
  title: string;
  manualName: string;
  description: string;
  layout: Record<string, unknown>;
  curve?: "bezier" | "taxi";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          <span className="font-mono text-[11px]">{manualName}</span> — {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Graph layout={layout} curve={curve} />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Layout definitions (Cytoscape manual → cytoscape.js)
// ---------------------------------------------------------------------------
const LAYOUTS = [
  {
    title: "Grid",
    manualName: "Grid Layout",
    description: "Nodes on a uniform grid, reading order.",
    layout: { name: "grid" },
  },
  {
    title: "Circular",
    manualName: "Circular Layout",
    description: "All nodes on a single ring.",
    layout: { name: "circle" },
  },
  {
    title: "Attribute Circle",
    manualName: "Attribute Circle Layout",
    description: "One ring, nodes ordered by their group attribute.",
    layout: {
      name: "circle",
      sort: (a: cytoscape.NodeSingular, b: cytoscape.NodeSingular) =>
        (a.data("group") as number) - (b.data("group") as number),
    },
  },
  {
    title: "Degree Sorted Circle",
    manualName: "Degree Sorted Circle Layout",
    description: "Concentric rings — hubs (high degree) in the centre.",
    layout: {
      name: "concentric",
      concentric: (node: cytoscape.NodeSingular) => node.degree(false),
      levelWidth: () => 2,
      minNodeSpacing: 18,
    },
  },
  {
    title: "Hierarchical",
    manualName: "Hierarchical Layout",
    description: "Breadth-first tree from the h1 root.",
    layout: { name: "breadthfirst", roots: ["h1"], directed: false, spacingFactor: 1.1 },
  },
  {
    title: "Force-Directed",
    manualName: "Prefuse Force Directed / Edge-weighted Spring Embedded",
    description: "CoSE physics simulation — clusters emerge from topology.",
    layout: { name: "cose", animate: false, nodeRepulsion: 8000, idealEdgeLength: 40 },
  },
  {
    title: "Random",
    manualName: "Random Layout",
    description: "Uniformly random positions — the before picture.",
    layout: { name: "random" },
  },
  {
    title: "Organic (fCoSE)",
    manualName: "Compound Spring Embedder / yFiles Organic",
    description: "The modern CoSE — faster, with cleaner cluster separation.",
    layout: { name: "fcose", animate: false, randomize: true, quality: "default" },
  },
  {
    title: "Spring Embedded (Cola)",
    manualName: "Edge-weighted Spring Embedded Layout",
    description: "Constraint-based springs; cross-group edges kept longer.",
    layout: {
      name: "cola",
      animate: false,
      maxSimulationTime: 1500,
      edgeLength: (edge: cytoscape.EdgeSingular) =>
        edge.source().data("group") === edge.target().data("group") ? 45 : 90,
    },
  },
  {
    title: "Layered (Dagre)",
    manualName: "Hierarchical Layout / yFiles Hierarchic",
    description: "Sugiyama-style layers with edge-crossing minimisation.",
    layout: { name: "dagre", rankDir: "TB", nodeSep: 18, rankSep: 42 },
  },
  {
    title: "Cluster Circles (CiSE)",
    manualName: "Group Attributes Layout / Community Cluster (GLay)",
    description: "One circle per attribute group, springs between circles.",
    layout: {
      name: "cise",
      animate: false,
      clusters: CLUSTERS,
      allowNodesInsideCircle: false,
      nodeSeparation: 10,
    },
  },
  {
    title: "Circular (AVSDF)",
    manualName: "Circular Layout / yFiles Circular",
    description: "Single ring ordered to minimise edge crossings.",
    layout: { name: "avsdf", animate: false, nodeSeparation: 28 },
  },
  {
    title: "Radial Tree",
    manualName: "Radial / yFiles Tree (radial)",
    description: "Breadth-first levels wrapped onto concentric circles.",
    layout: { name: "breadthfirst", roots: ["h1"], circle: true, spacingFactor: 1.4 },
  },
  {
    title: "Layered (ELK)",
    manualName: "ELK layered / Graphviz dot",
    description: "Eclipse Layout Kernel's reference Sugiyama implementation.",
    layout: { name: "elk", elk: { algorithm: "layered", "elk.direction": "DOWN" } },
  },
  {
    title: "Orthogonal (ELK)",
    manualName: "yFiles Orthogonal (ELK layered + taxi edges)",
    description: "Layered placement with right-angle (taxi) edge routing.",
    layout: {
      name: "elk",
      elk: { algorithm: "layered", "elk.direction": "RIGHT" },
    },
    curve: "taxi" as const,
  },
  {
    title: "Tidy Tree (ELK)",
    manualName: "yFiles Tree / ELK mrtree",
    description: "Compact tree placement (Reingold–Tilford family).",
    layout: { name: "elk", elk: { algorithm: "mrtree" } },
  },
  {
    title: "Radial (ELK)",
    manualName: "yFiles Radial / Graphviz twopi",
    description: "True radial placement around the structural centre.",
    layout: { name: "elk", elk: { algorithm: "radial" } },
  },
  {
    title: "Stress (ELK)",
    manualName: "Stress majorisation / MDS",
    description: "Distance-preserving embedding — the academic standard.",
    layout: { name: "elk", elk: { algorithm: "stress" } },
  },
  {
    title: "Euler",
    manualName: "Fast force-directed (euler)",
    description: "Lightweight spring simulation tuned for larger graphs.",
    layout: { name: "euler", animate: false, randomize: true },
  },
  {
    title: "ForceAtlas2",
    manualName: "Gephi ForceAtlas2 (graphology)",
    description: "Positions computed by graphology's FA2, served as preset.",
    layout: { name: "preset", positions: FA2_POSITIONS },
  },
  {
    title: "Bipartite",
    manualName: "Two-column / bipartite (preset)",
    description: "Hubs in one column, leaves in the other.",
    layout: { name: "preset", positions: BIPARTITE_POSITIONS },
  },
  {
    title: "Timeline",
    manualName: "Attribute-mapped axes (preset)",
    description: "x = ordinal position, y = attribute group row.",
    layout: { name: "preset", positions: TIMELINE_POSITIONS },
  },
];

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------
export const LayoutGallery: Story = {
  name: "Layout Gallery",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Network Graphs</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            The Cytoscape manual&apos;s layout families on one sample network (3 attribute
            groups, hubs sized by degree). Node colours come from the chart tokens —
            switch the Design Layer or theme and the graphs follow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {LAYOUTS.map((l) => (
            <GraphCard
              key={l.title}
              title={l.title}
              manualName={l.manualName}
              description={l.description}
              layout={l.layout}
              curve={(l as { curve?: "bezier" | "taxi" }).curve}
            />
          ))}
        </div>
      </div>
    </div>
  ),
};
