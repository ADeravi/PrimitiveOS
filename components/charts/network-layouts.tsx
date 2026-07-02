"use client";
import * as React from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import avsdf from "cytoscape-avsdf";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ChartCard, ChartControls } from "./chart-card";
import { NODES, EDGES, EDGE_STYLES, readTokens, type NetNode, type NetEdge, toEdgeTuples } from "./network";

interface NetworkDataProps { nodes?: NetNode[]; edges?: NetEdge[] }

// Layout extensions (force / hierarchy / circle). Concentric + grid are
// built in. Guarded so HMR re-registration is a no-op.
try {
  cytoscape.use(fcose);
  cytoscape.use(dagre);
  cytoscape.use(avsdf);
} catch {
  /* already registered */
}

type EdgeKey = (typeof EDGE_STYLES)[number];

// Degree is computed per-graph inside NetworkGraph, from the edges prop.

const byDegreeDesc = (a: cytoscape.NodeSingular, b: cytoscape.NodeSingular) =>
  b.degree(false) - a.degree(false);

// ---------------------------------------------------------------------------
// NetworkGraph — the shared engine. One cytoscape instance, theming (oklch →
// rgb + resolved font so labels resize), hover tooltip, click-to-isolate, and
// the display controls every layout shares (edge style, arrows, node/label
// size, degree filter, fit). Each layout wrapper passes its own `layout`
// (re-run whenever it changes) and its own `controls` row.
// ---------------------------------------------------------------------------
function NetworkGraph({
  nodes = NODES,
  edges = EDGES,
  title,
  description,
  layout,
  controls,
  defaultEdgeStyle = "curved",
  defaultArrows = false,
}: NetworkDataProps & {
  title: string;
  description: string;
  layout: cytoscape.LayoutOptions;
  controls?: React.ReactNode;
  defaultEdgeStyle?: EdgeKey;
  defaultArrows?: boolean;
}) {
  const edgeTuples = React.useMemo(() => toEdgeTuples(edges), [edges]);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);

  const [labelSize, setLabelSize] = React.useState(12);
  const [nodeSize, setNodeSize] = React.useState(26);
  const [sizeByDegree, setSizeByDegree] = React.useState(true);
  const [labels, setLabels] = React.useState(true);
  const [minDeg, setMinDeg] = React.useState(0);
  const [edgeStyle, setEdgeStyle] = React.useState<EdgeKey>(defaultEdgeStyle);
  const [arrows, setArrows] = React.useState(defaultArrows);
  const [tip, setTip] = React.useState<{ x: number; y: number; text: string } | null>(null);

  const buildStyle = React.useCallback(
    (t: ReturnType<typeof readTokens>): cytoscape.Stylesheet[] => [
      {
        selector: "node",
        style: {
          "background-color": "data(color)",
          width: sizeByDegree ? (("mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")") as unknown as number) : nodeSize,
          height: sizeByDegree ? (("mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")") as unknown as number) : nodeSize,
          label: labels ? "data(label)" : "",
          color: t.fg,
          "font-size": `${labelSize}px`,
          "font-family": t.font,
          "min-zoomed-font-size": 4,
          "text-valign": "bottom",
          "text-halign": "center",
          "text-margin-y": 4,
          "text-wrap": "ellipsis",
          "text-max-width": "90px",
          "border-width": 1.5,
          "border-color": t.bg,
        } as cytoscape.Css.Node,
      },
      {
        selector: "edge",
        style: {
          width: 1.4,
          "line-color": t.border,
          "curve-style": edgeStyle === "curved" ? "unbundled-bezier" : "straight",
          "control-point-distances": edgeStyle === "curved" ? 32 : 0,
          "control-point-weights": 0.5,
          "target-arrow-color": t.mutedF,
          "target-arrow-shape": arrows ? "triangle" : "none",
          "arrow-scale": 0.8,
          opacity: 0.85,
        } as cytoscape.Css.Edge,
      },
      { selector: "node.faded", style: { opacity: 0.12 } },
      { selector: "edge.faded", style: { opacity: 0.05 } },
      {
        selector: "node.hl",
        style: { "border-color": t.primary, "border-width": 2.5 } as cytoscape.Css.Node,
      },
      { selector: "edge.hl", style: { "line-color": t.primary, width: 2.2, opacity: 1 } as cytoscape.Css.Edge },
      { selector: "node.hidden", style: { display: "none" } as cytoscape.Css.Node },
    ],
    [sizeByDegree, nodeSize, labels, labelSize, edgeStyle, arrows]
  );

  // Init cytoscape ONCE; re-theme on a MutationObserver of <html>.
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const deg = new Map<string, number>();
    edgeTuples.forEach(([s, t]) => {
      deg.set(s, (deg.get(s) ?? 0) + 1);
      deg.set(t, (deg.get(t) ?? 0) + 1);
    });
    const t0 = readTokens(host);
    const cy = cytoscape({
      container: host,
      elements: [
        ...nodes.map((n) => ({ data: { id: n.id, label: n.label ?? n.id, group: n.group ?? 0, deg: deg.get(n.id) ?? 1, color: t0.c[(n.group ?? 0) % t0.c.length] } })),
        ...edgeTuples.map(([s, t], i) => ({ data: { id: `e${i}`, source: s, target: t } })),
      ],
      style: buildStyle(t0),
      layout,
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;

    cy.on("mouseover", "node", (e) => {
      const n = e.target;
      const p = n.renderedPosition();
      setTip({ x: p.x, y: p.y, text: `${n.data("label")} · degree ${n.data("deg")}` });
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => (prev ? { ...prev, x: p.x, y: p.y } : prev));
    });
    cy.on("mouseout", "node", () => setTip(null));

    cy.on("tap", "node", (e) => {
      const n = e.target;
      const hood = n.closedNeighborhood();
      cy.elements().addClass("faded");
      hood.removeClass("faded").addClass("hl");
      cy.elements().not(hood).removeClass("hl");
    });
    cy.on("tap", (e) => {
      if (e.target === cy) cy.elements().removeClass("faded hl");
    });

    const restyle = () => {
      const el = hostRef.current;
      if (!el) return;
      const tk = readTokens(el);
      cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[(n.data("group") as number) % tk.c.length])));
      cy.style(buildStyle(tk) as cytoscape.Stylesheet[]);
      cy.resize();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    let fitT: ReturnType<typeof setTimeout> | undefined;
    const fitNow = () => { cy.resize(); cy.fit(undefined, 24); };
    const ro = new ResizeObserver(() => {
      clearTimeout(fitT);
      fitT = setTimeout(fitNow, 30);
    });
    ro.observe(host);
    const settle = setTimeout(fitNow, 150);

    return () => {
      clearTimeout(fitT);
      clearTimeout(settle);
      ro.disconnect();
      mo.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edgeTuples]);

  // Re-apply the stylesheet (and re-raster labels) when display controls change.
  React.useEffect(() => {
    const cy = cyRef.current;
    const el = hostRef.current;
    if (!cy || !el) return;
    const tk = readTokens(el);
    cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[(n.data("group") as number) % tk.c.length])));
    cy.style(buildStyle(tk) as cytoscape.Stylesheet[]);
    cy.resize();
  }, [buildStyle]);

  // Degree threshold — hide leaves below the cutoff.
  React.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().forEach((n) => {
        if ((n.data("deg") as number) < minDeg) n.addClass("hidden");
        else n.removeClass("hidden");
      });
    });
  }, [minDeg]);

  // Re-run the layout whenever the wrapper hands us a new one, then fit.
  React.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const l = cy.layout(layout);
    l.one("layoutstop", () => cy.fit(undefined, 24));
    l.run();
  }, [layout]);

  return (
    <ChartCard
      title={title}
      description={description}
      exportData={nodes.map((n) => ({ id: n.id, label: n.label ?? n.id, group: n.group ?? 0 }))}
    >
      {controls}

      <ChartControls>
        <SegmentedControl
          options={EDGE_STYLES}
          value={edgeStyle}
          onChange={setEdgeStyle}
          ariaLabel="Edge style"
          labels={{ straight: "Straight", curved: "Curved" }}
        />
        <div className="flex items-center gap-2">
          <Switch id={`${title}-deg`} checked={sizeByDegree} onCheckedChange={setSizeByDegree} />
          <Label htmlFor={`${title}-deg`} className="text-xs text-muted-foreground">Size by degree</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={`${title}-lbl`} checked={labels} onCheckedChange={setLabels} />
          <Label htmlFor={`${title}-lbl`} className="text-xs text-muted-foreground">Labels</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={`${title}-arr`} checked={arrows} onCheckedChange={setArrows} />
          <Label htmlFor={`${title}-arr`} className="text-xs text-muted-foreground">Arrows</Label>
        </div>
      </ChartControls>

      <ChartControls>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Node size</Label>
          <Slider value={[nodeSize]} onValueChange={([v]) => setNodeSize(v)} min={14} max={42} step={2} className="w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Label size</Label>
          <Slider value={[labelSize]} onValueChange={([v]) => setLabelSize(v)} min={8} max={36} step={1} className="w-20" disabled={!labels} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Min degree</Label>
          <Slider value={[minDeg]} onValueChange={([v]) => setMinDeg(v)} min={0} max={6} step={1} className="w-20" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const cy = cyRef.current;
            if (cy) { cy.elements().removeClass("faded hl"); cy.layout(layout).run(); cy.fit(undefined, 24); }
          }}
        >
          Fit / reset
        </Button>
      </ChartControls>

      <div className="relative">
        <div ref={hostRef} className="h-[360px] w-full rounded-md border border-border bg-background" />
        {tip && (
          <div
            className="pointer-events-none absolute z-10 max-w-[16rem] -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-border/50 bg-background px-2 py-1 text-xs shadow-lg"
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.text}
          </div>
        )}
      </div>
    </ChartCard>
  );
}

// A labelled slider row — the layout-specific knobs all use this.
function Knob({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="w-24" />
      <span className="w-7 text-right text-[11px] tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

function Toggle({ id, label, checked, onChange }: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1 · Force-directed (fCoSE). Physics knobs: repulsion vs. edge springs vs.
// gravity. fCoSE defaults (repulsion 4500, edge 50, gravity 0.25) are the
// recommended starting point. [iVis-at-Bilkent/cytoscape.js-fcose]
// ---------------------------------------------------------------------------
export function ChartNetworkForce({ nodes, edges }: NetworkDataProps = {}) {
  const [repulsion, setRepulsion] = React.useState(4500);
  const [edgeLen, setEdgeLen] = React.useState(50);
  const [gravity, setGravity] = React.useState(25); // /100 → 0.25 default
  const [nodeSep, setNodeSep] = React.useState(75);
  const [quality, setQuality] = React.useState<"draft" | "default" | "proof">("default");

  const layout = React.useMemo<cytoscape.LayoutOptions>(
    () => ({
      name: "fcose",
      quality,
      animate: false,
      randomize: true,
      packComponents: true,
      numIter: 2500,
      nodeRepulsion: () => repulsion,
      idealEdgeLength: () => edgeLen,
      gravity: gravity / 100,
      nodeSeparation: nodeSep,
    } as unknown as cytoscape.LayoutOptions),
    [quality, repulsion, edgeLen, gravity, nodeSep]
  );

  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      title="Force-directed network"
      description="fCoSE spring embedder — clusters and hubs emerge from node repulsion balanced against edge springs. The best first look at an unfamiliar graph."
      layout={layout}
      controls={
        <>
          <ChartControls>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Quality</Label>
              <SegmentedControl
                options={["draft", "default", "proof"] as const}
                value={quality}
                onChange={setQuality}
                ariaLabel="Quality"
                labels={{ draft: "Draft", default: "Default", proof: "Proof" }}
              />
            </div>
          </ChartControls>
          <ChartControls>
            <Knob label="Node repulsion" value={repulsion} min={500} max={20000} step={500} onChange={setRepulsion} />
            <Knob label="Ideal edge length" value={edgeLen} min={10} max={200} step={5} onChange={setEdgeLen} />
            <Knob label="Gravity" value={gravity} min={0} max={100} step={5} onChange={setGravity} />
            <Knob label="Node separation" value={nodeSep} min={20} max={160} step={5} onChange={setNodeSep} />
          </ChartControls>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// 2 · Hierarchical (Dagre / Sugiyama). Ranks flow one direction; ranker picks
// the rank-assignment algorithm. Best for DAGs, trees, dependency/flow graphs.
// Arrows on, straight edges by default. [cytoscape/cytoscape.js-dagre]
// ---------------------------------------------------------------------------
const RANKERS = ["network-simplex", "tight-tree", "longest-path"] as const;
const DIRS = ["TB", "LR", "BT", "RL"] as const;

export function ChartNetworkHierarchy({ nodes, edges }: NetworkDataProps = {}) {
  const [dir, setDir] = React.useState<(typeof DIRS)[number]>("TB");
  const [ranker, setRanker] = React.useState<(typeof RANKERS)[number]>("network-simplex");
  const [nodeSep, setNodeSep] = React.useState(40);
  const [rankSep, setRankSep] = React.useState(60);
  const [edgeSep, setEdgeSep] = React.useState(10);

  const layout = React.useMemo<cytoscape.LayoutOptions>(
    () => ({
      name: "dagre",
      rankDir: dir,
      ranker,
      nodeSep,
      rankSep,
      edgeSep,
      animate: false,
    } as unknown as cytoscape.LayoutOptions),
    [dir, ranker, nodeSep, rankSep, edgeSep]
  );

  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      title="Hierarchical network"
      description="Dagre layered (Sugiyama) layout — nodes ranked into levels flowing one way. Best for DAGs, trees and dependency or process flows."
      layout={layout}
      defaultArrows
      defaultEdgeStyle="straight"
      controls={
        <>
          <ChartControls>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Direction</Label>
              <SegmentedControl
                options={DIRS}
                value={dir}
                onChange={setDir}
                ariaLabel="Direction"
                labels={{ TB: "Top↓", LR: "Left→", BT: "Bottom↑", RL: "Right←" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Ranker</Label>
              <SegmentedControl
                options={RANKERS}
                value={ranker}
                onChange={setRanker}
                ariaLabel="Ranker"
                labels={{ "network-simplex": "Balanced", "tight-tree": "Tight", "longest-path": "Longest" }}
              />
            </div>
          </ChartControls>
          <ChartControls>
            <Knob label="Node sep" value={nodeSep} min={10} max={120} step={5} onChange={setNodeSep} />
            <Knob label="Rank sep" value={rankSep} min={20} max={180} step={5} onChange={setRankSep} />
            <Knob label="Edge sep" value={edgeSep} min={0} max={40} step={2} onChange={setEdgeSep} />
          </ChartControls>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// 3 · Circle. All nodes on one ring — ordering is everything, so sort by
// degree to cluster hubs. Sweep < 360 draws an arc. [js.cytoscape.org circle]
// ---------------------------------------------------------------------------
export function ChartNetworkCircle({ nodes, edges }: NetworkDataProps = {}) {
  const [startAngle, setStartAngle] = React.useState(270);
  const [sweep, setSweep] = React.useState(360);
  const [spacing, setSpacing] = React.useState(100); // /100 → spacingFactor
  const [clockwise, setClockwise] = React.useState(true);
  const [byDegree, setByDegree] = React.useState(true);

  const layout = React.useMemo<cytoscape.LayoutOptions>(
    () => ({
      name: "circle",
      animate: false,
      clockwise,
      startAngle: (startAngle * Math.PI) / 180,
      sweep: (sweep * Math.PI) / 180,
      spacingFactor: spacing / 100,
      avoidOverlap: true,
      sort: byDegree ? byDegreeDesc : undefined,
    } as unknown as cytoscape.LayoutOptions),
    [clockwise, startAngle, sweep, spacing, byDegree]
  );

  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      title="Circle network"
      description="Every node on a single ring. Order carries the meaning — sort by degree to group hubs together; a sweep under 360° draws an arc."
      layout={layout}
      controls={
        <>
          <ChartControls>
            <Toggle id="circle-cw" label="Clockwise" checked={clockwise} onChange={setClockwise} />
            <Toggle id="circle-deg" label="Sort by degree" checked={byDegree} onChange={setByDegree} />
          </ChartControls>
          <ChartControls>
            <Knob label="Start angle" value={startAngle} min={0} max={360} step={15} onChange={setStartAngle} />
            <Knob label="Sweep" value={sweep} min={90} max={360} step={15} onChange={setSweep} />
            <Knob label="Spacing" value={spacing} min={50} max={220} step={10} onChange={setSpacing} />
          </ChartControls>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// 4 · Concentric. Rings by importance (degree) — hubs at the centre, periphery
// outward. levelWidth groups how many degree values share a ring. [concentric]
// ---------------------------------------------------------------------------
export function ChartNetworkConcentric({ nodes, edges }: NetworkDataProps = {}) {
  const [minSpacing, setMinSpacing] = React.useState(10);
  const [levelWidth, setLevelWidth] = React.useState(1);
  const [spacing, setSpacing] = React.useState(100);
  const [startAngle, setStartAngle] = React.useState(270);
  const [equidistant, setEquidistant] = React.useState(false);

  const layout = React.useMemo<cytoscape.LayoutOptions>(
    () => ({
      name: "concentric",
      animate: false,
      clockwise: true,
      concentric: (n: cytoscape.NodeSingular) => n.degree(false),
      levelWidth: () => levelWidth,
      minNodeSpacing: minSpacing,
      spacingFactor: spacing / 100,
      equidistant,
      startAngle: (startAngle * Math.PI) / 180,
    } as unknown as cytoscape.LayoutOptions),
    [minSpacing, levelWidth, spacing, startAngle, equidistant]
  );

  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      title="Concentric network"
      description="Rings by importance — the highest-degree nodes sit in the centre and importance descends outward. Reveals hub-and-periphery structure at a glance."
      layout={layout}
      controls={
        <>
          <ChartControls>
            <Toggle id="conc-eq" label="Equidistant rings" checked={equidistant} onChange={setEquidistant} />
          </ChartControls>
          <ChartControls>
            <Knob label="Min spacing" value={minSpacing} min={4} max={40} step={2} onChange={setMinSpacing} />
            <Knob label="Ring grouping" value={levelWidth} min={1} max={4} step={1} onChange={setLevelWidth} />
            <Knob label="Spacing" value={spacing} min={50} max={220} step={10} onChange={setSpacing} />
            <Knob label="Start angle" value={startAngle} min={0} max={360} step={15} onChange={setStartAngle} />
          </ChartControls>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// 5 · Grid. Nodes snapped to a lattice — predictable scanning, good for small
// sets or matrix-like reading. rows/cols 0 = auto. [js.cytoscape.org grid]
// ---------------------------------------------------------------------------
export function ChartNetworkGrid({ nodes, edges }: NetworkDataProps = {}) {
  const [cols, setCols] = React.useState(0); // 0 = auto
  const [rows, setRows] = React.useState(0);
  const [spacing, setSpacing] = React.useState(100);
  const [avoidOverlap, setAvoidOverlap] = React.useState(true);
  const [condense, setCondense] = React.useState(false);
  const [byDegree, setByDegree] = React.useState(false);

  const layout = React.useMemo<cytoscape.LayoutOptions>(
    () => ({
      name: "grid",
      animate: false,
      avoidOverlap,
      condense,
      spacingFactor: spacing / 100,
      rows: rows || undefined,
      cols: cols || undefined,
      sort: byDegree ? byDegreeDesc : undefined,
    } as unknown as cytoscape.LayoutOptions),
    [avoidOverlap, condense, spacing, rows, cols, byDegree]
  );

  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      title="Grid network"
      description="Nodes snapped to a tidy lattice — predictable left-to-right scanning, good for small sets or matrix-like reading. Rows / columns at 0 auto-fit."
      layout={layout}
      controls={
        <>
          <ChartControls>
            <Toggle id="grid-ov" label="Avoid overlap" checked={avoidOverlap} onChange={setAvoidOverlap} />
            <Toggle id="grid-cd" label="Condense" checked={condense} onChange={setCondense} />
            <Toggle id="grid-deg" label="Sort by degree" checked={byDegree} onChange={setByDegree} />
          </ChartControls>
          <ChartControls>
            <Knob label="Columns" value={cols} min={0} max={8} step={1} onChange={setCols} />
            <Knob label="Rows" value={rows} min={0} max={8} step={1} onChange={setRows} />
            <Knob label="Spacing" value={spacing} min={50} max={220} step={10} onChange={setSpacing} />
          </ChartControls>
        </>
      }
    />
  );
}
