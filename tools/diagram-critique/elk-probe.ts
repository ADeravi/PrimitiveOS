// elk-probe.ts — headless layout regression check for <Diagram>.
//
// Runs the REAL ELK engine over canonical diagram fixtures using the exact
// pure sizing + option set the component imports (components/diagram/layout.ts),
// then asserts the fundamentals the eye reads first: uniform box widths and a
// straight, aligned spine. No browser, no screenshots — just geometry.
//
//   npx -y tsx tools/diagram-critique/elk-probe.ts
//
// Exits non-zero if any check fails, so it can gate CI.

import ELK from "elkjs";
import { uniformSizes, elkOptions, BOX_ROLES, LAYOUT_SPACING } from "../../components/diagram/layout";
import { lintPrimitives, TYPE, OPACITY } from "../../components/diagram/primitives";
import { planEdges, buildElkGraph, extractRoutes } from "../../components/diagram/edgePolicy";
import { lintEdges } from "../../components/diagram/edgeLint";
import { validateChart, type ChartSpec } from "../../components/charts/chartLint";
import type { DiagramKind, NodeRole, SNode } from "../../components/diagram/types";

const elk = new ELK();

interface Fixture {
  name: string;
  kind: DiagramKind;
  nodes: (SNode & { role: NodeRole })[];
  edges: [string, string][];
  /** node ids that must be collinear on the cross-axis (the trunk). */
  spine?: string[];
  /** [parent, leftChild, rightChild] that must fan symmetrically. */
  symmetric?: [string, string, string];
}

const FIXTURES: Fixture[] = [
  {
    name: "flowchart", kind: "flow",
    nodes: [
      { id: "s", label: "Receive request", role: "start" },
      { id: "v", label: "Validate input", role: "process" },
      { id: "d", label: "Valid?", role: "decision" },
      { id: "p", label: "Process & persist", role: "process" },
      { id: "n", label: "Return error", role: "io" },
      { id: "e", label: "Respond 200", role: "end" },
    ],
    edges: [["s", "v"], ["v", "d"], ["d", "p"], ["d", "n"], ["p", "e"], ["n", "e"]],
    spine: ["s", "v", "d", "e"],
    symmetric: ["d", "p", "n"],
  },
  {
    name: "org-tree", kind: "tree",
    nodes: ["Head of Research", "Methods", "Synthesis", "Fieldwork", "Quant", "Modelling", "Coding", "Writing", "Recruiting"]
      .map((label, i) => ({ id: "t" + i, label, role: "node" as NodeRole })),
    edges: [["t0", "t1"], ["t0", "t2"], ["t0", "t3"], ["t1", "t4"], ["t1", "t5"], ["t2", "t6"], ["t2", "t7"], ["t3", "t8"]],
  },
  {
    name: "state", kind: "state",
    nodes: [
      { id: "draft", label: "Draft", role: "state" }, { id: "review", label: "In review", role: "state" },
      { id: "revise", label: "Revising", role: "state" }, { id: "approved", label: "Approved", role: "state" },
      { id: "published", label: "Published", role: "state" },
    ],
    edges: [["draft", "review"], ["review", "revise"], ["revise", "review"], ["review", "approved"], ["approved", "published"]],
    spine: ["review", "approved", "published"], // the trunk; Draft/Revising legitimately flank it (both feed In review)
  },
  {
    name: "entity-relationship", kind: "er",
    nodes: [
      { id: "author", label: "Author", role: "entity", attrs: ["id", "name", "orcid"] },
      { id: "paper", label: "Paper", role: "entity", attrs: ["id", "title", "year"] },
      { id: "venue", label: "Venue", role: "entity", attrs: ["id", "name"] },
      { id: "topic", label: "Topic", role: "entity", attrs: ["id", "label"] },
    ],
    edges: [["author", "paper"], ["paper", "venue"], ["paper", "topic"]],
  },
];

async function probe(fx: Fixture) {
  const roleOf = (n: SNode) => (fx.nodes.find((x) => x.id === n.id)!.role);
  const sizes = uniformSizes(fx.nodes, roleOf);
  const opts = Object.fromEntries(Object.entries(elkOptions(fx.kind)).map(([k, v]) => [k, String(v)]));
  const horizontal = fx.kind === "er" || fx.kind === "swimlane";
  const graph = {
    id: "root", layoutOptions: opts,
    children: fx.nodes.map((n) => ({ id: n.id, ...sizes.get(n.id)! })),
    edges: fx.edges.map(([s, t], i) => ({ id: "e" + i, sources: [s], targets: [t] })),
  };
  const res = await elk.layout(graph as never);
  const by: Record<string, { x: number; y: number; width: number; height: number }> =
    Object.fromEntries((res.children ?? []).map((c) => [c.id, c as never]));
  const cross = (id: string) => horizontal
    ? Math.round(by[id].y + by[id].height / 2)
    : Math.round(by[id].x + by[id].width / 2);

  const checks: { label: string; pass: boolean; detail: string }[] = [];

  // 1 — every box role shares one width
  const boxW = [...new Set(fx.nodes.filter((n) => BOX_ROLES.has(roleOf(n))).map((n) => sizes.get(n.id)!.w))];
  checks.push({ label: "uniform box width", pass: boxW.length <= 1, detail: `widths: ${boxW.join(", ") || "n/a"}` });

  // 2 — the spine is collinear
  if (fx.spine) {
    const xs = fx.spine.map(cross);
    checks.push({ label: "straight spine", pass: new Set(xs).size === 1, detail: `${fx.spine.join(",")} → ${xs.join(", ")}` });
  }

  // 3 — decision branches fan symmetrically about the parent
  if (fx.symmetric) {
    const [pId, lId, rId] = fx.symmetric;
    const pc = cross(pId), l = pc - cross(lId), r = cross(rId) - pc;
    checks.push({ label: "symmetric branches", pass: Math.abs(l - r) <= 2, detail: `left ${l} vs right ${r}` });
  }

  return { name: fx.name, checks };
}

// edge-routing pass: plan ports → ELK orthogonal route → lint the polylines
async function probeEdges(fx: Fixture) {
  const roleOfId = (id: string) => fx.nodes.find((x) => x.id === id)!.role;
  const sizes = uniformSizes(fx.nodes, (n) => roleOfId(n.id));
  const plans = planEdges(fx.kind, fx.nodes, fx.edges.map(([s, t]) => ({ source: s, target: t })), roleOfId);
  const graph = buildElkGraph(fx.kind, fx.nodes.map((n) => n.id), (id) => sizes.get(id)!, plans);
  const res = await elk.layout(graph as never);
  const { boxes, routes } = extractRoutes(res);
  return lintEdges(plans, routes, boxes);
}

async function main() {
  let failed = 0;

  // primitives: every spatial constant on the Carbon scale, type on the ramp,
  // opacity from the reserved set (catches a magic number creeping back in).
  const prim = lintPrimitives({
    spacing: Object.values(LAYOUT_SPACING),
    typeSize: [TYPE.title.size, TYPE.nodeLabel.size, TYPE.edgeLabel.size],
    opacity: Object.values(OPACITY),
  });
  console.log("primitives");
  console.log(`  ${prim.pass ? "✓" : "✗"} ${"on Carbon scales".padEnd(20)} spacing/type/opacity`);
  if (!prim.pass) { failed++; prim.violations.forEach((v) => console.log(`      · ${v.detail}`)); }

  // charts: the same gate covers the chart linter — an honest spec passes, a
  // dishonest one (3-D, non-zero baseline, 9 colours) is caught.
  const GOOD: ChartSpec = {
    chart: "bar", encoding: { x: "region", y: "rev", color: "region" },
    data: { fields: [{ name: "region", type: "categorical" }, { name: "rev", type: "quantitative" }], categories: 4 },
    options: { baseline: 0, title: "Revenue concentrates in the top regions", palette: { type: "categorical", colors: ["#0072B2", "#009E73", "#CC79A7", "#56B4E9"] }, background: "#ffffff" },
  };
  const BAD: ChartSpec = {
    chart: "bar", encoding: { color: "region" },
    data: { fields: [{ name: "region", type: "categorical" }], categories: 9 },
    options: { baseline: 50, threeD: true, palette: { type: "categorical", colors: ["#fff", "#eee", "#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777"] }, background: "#ffffff" },
  };
  const g = validateChart(GOOD), bad = validateChart(BAD);
  const chartsOk = g.pass && !bad.pass;
  console.log("charts");
  console.log(`  ${chartsOk ? "✓" : "✗"} ${"chartLint good vs bad".padEnd(20)} good ${g.grade}, bad ${bad.grade} (${bad.violations.filter((v) => v.severity === "error").length} errors)`);
  if (!chartsOk) failed++;

  for (const fx of FIXTURES) {
    const { name, checks } = await probe(fx);
    console.log(`\n${name}`);
    for (const c of checks) {
      console.log(`  ${c.pass ? "✓" : "✗"} ${c.label.padEnd(20)} ${c.detail}`);
      if (!c.pass) failed++;
    }
    const el = await probeEdges(fx);
    const m = el.metrics;
    const noHits = m.nodeHits === 0;
    console.log(`  ${noHits ? "✓" : "✗"} ${"edges clear of nodes".padEnd(20)} ${m.edges} edges, ${m.corners} corners, ${m.crossings} crossings → ${el.grade}`);
    if (!noHits) { failed++; el.violations.filter((v) => v.severity === "error").forEach((v) => console.log(`      · ${v.detail}`)); }
  }
  console.log(failed === 0 ? "\nAll layout + edge checks passed." : `\n${failed} check(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
