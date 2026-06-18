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
import { uniformSizes, elkOptions, BOX_ROLES } from "../../components/diagram/layout";
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

async function main() {
  let failed = 0;
  for (const fx of FIXTURES) {
    const { name, checks } = await probe(fx);
    console.log(`\n${name}`);
    for (const c of checks) {
      console.log(`  ${c.pass ? "✓" : "✗"} ${c.label.padEnd(20)} ${c.detail}`);
      if (!c.pass) failed++;
    }
  }
  console.log(failed === 0 ? "\nAll layout checks passed." : `\n${failed} layout check(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
