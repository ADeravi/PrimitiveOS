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

// Register layout extensions once (guarded against HMR re-registration).
try {
  cytoscape.use(fcose);
  cytoscape.use(dagre);
  cytoscape.use(avsdf);
} catch {
  /* already registered */
}

// ---------------------------------------------------------------------------
// Sample graph — 3 attribute groups, hubs + leaves + cross-links.
// ---------------------------------------------------------------------------
const NODES = [
  { id: "h1", label: "Cognition", group: 0 },
  { id: "h2", label: "Memory systems", group: 1 },
  { id: "h3", label: "Attention", group: 2 },
  { id: "a1", label: "Working memory", group: 0 },
  { id: "a2", label: "Encoding", group: 0 },
  { id: "a3", label: "Retrieval", group: 0 },
  { id: "b1", label: "Hippocampus", group: 1 },
  { id: "b2", label: "Consolidation", group: 1 },
  { id: "b3", label: "Forgetting", group: 1 },
  { id: "c1", label: "Salience", group: 2 },
  { id: "c2", label: "Top-down control", group: 2 },
  { id: "c3", label: "Distraction", group: 2 },
  { id: "d1", label: "Sleep", group: 1 },
  { id: "d2", label: "Reward", group: 2 },
];
const EDGES = [
  ["h1", "h2"], ["h1", "h3"], ["h2", "h3"],
  ["h1", "a1"], ["h1", "a2"], ["h1", "a3"], ["a1", "a2"], ["a2", "a3"],
  ["h2", "b1"], ["h2", "b2"], ["h2", "b3"], ["b1", "b2"], ["b2", "b3"],
  ["h3", "c1"], ["h3", "c2"], ["h3", "c3"], ["c1", "c2"], ["c2", "c3"],
  ["b2", "d1"], ["d1", "a2"], ["c1", "d2"], ["d2", "h1"], ["a3", "b3"],
];

const LAYOUTS = ["force", "hierarchy", "circle", "concentric", "grid"] as const;
type LayoutKey = (typeof LAYOUTS)[number];
const EDGE_STYLES = ["straight", "curved"] as const;
type EdgeKey = (typeof EDGE_STYLES)[number];

function readTokens(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  return {
    c: [1, 2, 3, 4, 5].map((i) => v(`--chart-${i}`, "#888")),
    border: v("--border", "#ddd"),
    fg: v("--foreground", "#111"),
    mutedF: v("--muted-foreground", "#888"),
    bg: v("--background", "#fff"),
    primary: v("--primary", "#333"),
  };
}

export function ChartNetwork({
  title = "Network graph",
  description = "Switch layouts, tune the force physics, size nodes by degree, and click a node to isolate its neighbourhood.",
}: {
  title?: string;
  description?: string;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);

  const [layout, setLayout] = React.useState<LayoutKey>("force");
  const [gravity, setGravity] = React.useState(45);      // force gravity
  const [linkDist, setLinkDist] = React.useState(60);     // ideal edge length
  const [labelSize, setLabelSize] = React.useState(12);
  const [nodeSize, setNodeSize] = React.useState(26);
  const [sizeByDegree, setSizeByDegree] = React.useState(true);
  const [labels, setLabels] = React.useState(true);
  const [minDeg, setMinDeg] = React.useState(0);
  const [edgeStyle, setEdgeStyle] = React.useState<EdgeKey>("curved");
  const [arrows, setArrows] = React.useState(false);
  const [tip, setTip] = React.useState<{ x: number; y: number; text: string } | null>(null);

  // Build the cytoscape style array from the resolved DS tokens.
  const buildStyle = React.useCallback(
    (t: ReturnType<typeof readTokens>): cytoscape.Stylesheet[] => [
      {
        selector: "node",
        style: {
          // Per-group fill via data(color) — the canonical, reliable cytoscape
          // mapping (function-value mappers silently render mono on canvas).
          "background-color": "data(color)",
          width: sizeByDegree ? ("mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")" as unknown as number) : nodeSize,
          height: sizeByDegree ? ("mapData(deg, 1, 7, " + nodeSize * 0.7 + ", " + nodeSize * 1.9 + ")" as unknown as number) : nodeSize,
          label: labels ? "data(label)" : "",
          color: t.fg,
          "font-size": `${labelSize}px`,
          "font-family": "inherit",
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
          "curve-style": edgeStyle === "curved" ? "bezier" : "haystack",
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
      {
        selector: "node.hidden",
        style: { display: "none" } as cytoscape.Css.Node,
      },
    ],
    [sizeByDegree, nodeSize, labels, labelSize, edgeStyle, arrows]
  );

  const layoutOpts = React.useCallback((): cytoscape.LayoutOptions => {
    const animate = true as const;
    switch (layout) {
      case "hierarchy":
        return { name: "dagre", rankDir: "TB", nodeSep: 26, rankSep: 18 + linkDist, animate } as unknown as cytoscape.LayoutOptions;
      case "circle":
        return { name: "avsdf", nodeSeparation: 12 + linkDist * 0.6, animate } as unknown as cytoscape.LayoutOptions;
      case "concentric":
        return {
          name: "concentric",
          concentric: (n: cytoscape.NodeSingular) => n.degree(false),
          levelWidth: () => 2,
          minNodeSpacing: 18 + linkDist * 0.4,
          animate,
        } as unknown as cytoscape.LayoutOptions;
      case "grid":
        return { name: "grid", avoidOverlap: true, animate } as cytoscape.LayoutOptions;
      case "force":
      default:
        return {
          name: "fcose",
          quality: "default",
          nodeRepulsion: () => 4500,
          idealEdgeLength: () => 30 + linkDist,
          gravity: gravity / 50,
          animate,
          animationDuration: 500,
        } as unknown as cytoscape.LayoutOptions;
    }
  }, [layout, linkDist, gravity]);

  // Init cytoscape ONCE; re-theme via a MutationObserver on <html>.
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const deg = new Map<string, number>();
    EDGES.forEach(([s, t]) => {
      deg.set(s, (deg.get(s) ?? 0) + 1);
      deg.set(t, (deg.get(t) ?? 0) + 1);
    });
    const t0 = readTokens(host);
    const cy = cytoscape({
      container: host,
      elements: [
        ...NODES.map((n) => ({ data: { ...n, deg: deg.get(n.id) ?? 1, color: t0.c[n.group % t0.c.length] } })),
        ...EDGES.map(([s, t], i) => ({ data: { id: `e${i}`, source: s, target: t } })),
      ],
      style: buildStyle(t0),
      layout: layoutOpts(),
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;

    // Hover tooltip.
    cy.on("mouseover", "node", (e) => {
      const n = e.target;
      const r = host.getBoundingClientRect();
      const p = n.renderedPosition();
      setTip({ x: p.x, y: p.y, text: `${n.data("label")} · degree ${n.data("deg")}` });
      void r;
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => (prev ? { ...prev, x: p.x, y: p.y } : prev));
    });
    cy.on("mouseout", "node", () => setTip(null));

    // Click → isolate neighbourhood; background → clear.
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
      cy.resize(); // clears the label texture cache so font-size changes re-raster
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    // The container often has no height yet at init (Storybook/centered timing),
    // which piles the graph in a corner — resize + fit whenever it changes size.
    let fitRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(fitRaf);
      fitRaf = requestAnimationFrame(() => {
        cy.resize();
        cy.fit(undefined, 24);
      });
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(fitRaf);
      ro.disconnect();
      mo.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restyle when styling controls change (label/node size, edges, …). Re-apply
  // the stylesheet AND force a re-raster so font-size visibly changes the glyph
  // (cytoscape caches label textures by their previous size otherwise).
  React.useEffect(() => {
    const cy = cyRef.current;
    const el = hostRef.current;
    if (!cy || !el) return;
    const tk = readTokens(el);
    cy.batch(() => cy.nodes().forEach((n) => n.data("color", tk.c[(n.data("group") as number) % tk.c.length])));
    cy.style(buildStyle(tk) as cytoscape.Stylesheet[]);
    cy.resize();
  }, [buildStyle]);

  // Hide nodes below the min-degree threshold.
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

  // Re-run layout when the layout or its physics change, then fit to view.
  React.useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const l = cy.layout(layoutOpts());
    l.one("layoutstop", () => cy.fit(undefined, 24));
    l.run();
  }, [layoutOpts]);

  const isForce = layout === "force";

  return (
    <ChartCard
      title={title}
      description={description}
      exportData={NODES.map((n) => ({ id: n.id, label: n.label, group: n.group }))}
    >
      <ChartControls>
        <SegmentedControl options={LAYOUTS} value={layout} onChange={setLayout} ariaLabel="Layout" />
        <SegmentedControl options={EDGE_STYLES} value={edgeStyle} onChange={setEdgeStyle} ariaLabel="Edges" />
        <div className="flex items-center gap-2">
          <Switch id="nw-deg" checked={sizeByDegree} onCheckedChange={setSizeByDegree} />
          <Label htmlFor="nw-deg" className="text-xs text-muted-foreground">Size by degree</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="nw-lbl" checked={labels} onCheckedChange={setLabels} />
          <Label htmlFor="nw-lbl" className="text-xs text-muted-foreground">Labels</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="nw-arr" checked={arrows} onCheckedChange={setArrows} />
          <Label htmlFor="nw-arr" className="text-xs text-muted-foreground">Arrows</Label>
        </div>
      </ChartControls>

      <ChartControls>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Gravity</Label>
          <Slider value={[gravity]} onValueChange={([v]) => setGravity(v)} min={0} max={100} step={5} className="w-28" disabled={!isForce} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Link distance</Label>
          <Slider value={[linkDist]} onValueChange={([v]) => setLinkDist(v)} min={10} max={140} step={5} className="w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Node size</Label>
          <Slider value={[nodeSize]} onValueChange={([v]) => setNodeSize(v)} min={14} max={42} step={2} className="w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Label size</Label>
          <Slider value={[labelSize]} onValueChange={([v]) => setLabelSize(v)} min={9} max={24} step={1} className="w-20" disabled={!labels} />
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
            if (cy) { cy.elements().removeClass("faded hl"); cy.layout(layoutOpts()).run(); cy.fit(undefined, 24); }
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
