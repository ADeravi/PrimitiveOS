// elk-sweep.ts — empirical tuning. Run each candidate ELK layered option against
// the stress fixtures and measure total corners / crossings / node-hits, so we
// adopt only the settings that PROVABLY reduce clutter. Run:
//   npx -y tsx tools/diagram-critique/elk-sweep.ts

import ELK from "elkjs";
import { uniformSizes } from "../../components/diagram/layout";
import { planEdges, buildElkGraph, extractRoutes } from "../../components/diagram/edgePolicy";
import { lintEdges } from "../../components/diagram/edgeLint";
import type { DiagramKind, NodeRole, SNode } from "../../components/diagram/types";

const elk = new ELK();

interface Fx { name: string; kind: DiagramKind; nodes: (SNode & { role: NodeRole })[]; edges: [string, string][] }
const F: Fx[] = [
  { name: "flow", kind: "flow", nodes: [
    { id: "s", label: "Receive request", role: "start" }, { id: "v", label: "Validate input", role: "process" },
    { id: "d", label: "Valid?", role: "decision" }, { id: "p", label: "Process & persist", role: "process" },
    { id: "n", label: "Return error", role: "io" }, { id: "e", label: "Respond 200", role: "end" }],
    edges: [["s","v"],["v","d"],["d","p"],["d","n"],["p","e"],["n","e"]] },
  { name: "tree-wide", kind: "tree", nodes: ["Root","A","B","C","D","E","F"].map((l,i)=>({id:"w"+i,label:l,role:"node" as NodeRole})),
    edges: [["w0","w1"],["w0","w2"],["w0","w3"],["w0","w4"],["w0","w5"],["w0","w6"]] },
  { name: "state-cyclic", kind: "state", nodes: [
    {id:"a",label:"Idle",role:"state"},{id:"b",label:"Running",role:"state"},{id:"c",label:"Paused",role:"state"},{id:"z",label:"Stopped",role:"state"}],
    edges: [["a","b"],["b","c"],["c","b"],["b","a"],["b","z"]] },
  { name: "er-hub", kind: "er", nodes: ["User","Order","Item","Payment","Address","Coupon"].map((l,i)=>({id:"e"+i,label:l,role:"entity" as NodeRole,attrs:["id","name"]})),
    edges: [["e0","e1"],["e1","e2"],["e1","e3"],["e0","e4"],["e1","e5"]] },
  { name: "swimlane", kind: "swimlane", nodes: [
    {id:"a",label:"Submit",role:"start",lane:"Customer"},{id:"b",label:"Screen",role:"process",lane:"Support"},
    {id:"c",label:"Escalate?",role:"decision",lane:"Support"},{id:"d",label:"Fix",role:"process",lane:"Engineering"},
    {id:"e",label:"Verify",role:"process",lane:"QA"},{id:"f",label:"Close",role:"end",lane:"Customer"}],
    edges: [["a","b"],["b","c"],["c","d"],["c","f"],["d","e"],["e","f"]] },
  { name: "disconnected", kind: "flow", nodes: [
    {id:"x",label:"Ingest",role:"start"},{id:"y",label:"Store",role:"end"},
    {id:"p",label:"Poll",role:"start"},{id:"q",label:"Transform",role:"process"},{id:"r",label:"Sink",role:"end"}],
    edges: [["x","y"],["p","q"],["q","r"]] },
];

// candidate deltas merged onto the base layoutOptions
const CANDIDATES: Record<string, Record<string, string>> = {
  "baseline": {},
  "unnecessaryBendpoints": { "elk.layered.unnecessaryBendpoints": "true" },
  "favorStraightEdges": { "elk.layered.nodePlacement.favorStraightEdges": "true" },
  "edgeStraightening": { "elk.layered.nodePlacement.bk.edgeStraightening": "IMPROVE_STRAIGHTNESS" },
  "mergeEdges": { "elk.layered.mergeEdges": "true" },
  "separateComponents": { "elk.separateConnectedComponents": "true", "elk.spacing.componentComponent": "40" },
  "wrapping": { "elk.layered.wrapping.strategy": "SINGLE_EDGE" },
  "highDegreeNodes": { "elk.layered.highDegreeNodes.treatment": "true", "elk.layered.highDegreeNodes.threshold": "3" },
  "cycleBreaking=DEPTH_FIRST": { "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST" },
  "combo(bend+straight+merge)": { "elk.layered.unnecessaryBendpoints": "true", "elk.layered.nodePlacement.favorStraightEdges": "true", "elk.layered.mergeEdges": "true" },
};

async function measure(fx: Fx, delta: Record<string, string>) {
  const roleOf = (id: string) => fx.nodes.find((n) => n.id === id)!.role;
  const sizes = uniformSizes(fx.nodes, (n) => roleOf(n.id));
  const plans = planEdges(fx.kind, fx.nodes, fx.edges.map(([s, t]) => ({ source: s, target: t })), roleOf);
  const laneOrder = [...new Set(fx.nodes.map((n) => n.lane).filter(Boolean) as string[])];
  const partitionOf = fx.kind === "swimlane" ? (id: string) => Math.max(0, laneOrder.indexOf(fx.nodes.find((n) => n.id === id)?.lane ?? "")) : undefined;
  const graph = buildElkGraph(fx.kind, fx.nodes.map((n) => n.id), (id) => sizes.get(id)!, plans, partitionOf) as { layoutOptions: Record<string, string> };
  Object.assign(graph.layoutOptions, delta);
  const res = await elk.layout(graph as never);
  const { boxes, routes } = extractRoutes(res);
  const m = lintEdges(plans, routes, boxes).metrics;
  return { corners: m.corners, crossings: m.crossings, hits: m.nodeHits };
}

async function main() {
  console.log("candidate".padEnd(28), "corners", "crossings", "nodeHits", "  (totals across stress matrix)");
  const base = { corners: 0, crossings: 0, hits: 0 };
  for (const [name, delta] of Object.entries(CANDIDATES)) {
    let c = 0, x = 0, h = 0;
    for (const fx of F) { const r = await measure(fx, delta); c += r.corners; x += r.crossings; h += r.hits; }
    if (name === "baseline") { base.corners = c; base.crossings = x; base.hits = h; }
    const dC = c - base.corners, dX = x - base.crossings;
    const tag = name === "baseline" ? "" : `  Δcorners ${dC >= 0 ? "+" : ""}${dC}, Δcross ${dX >= 0 ? "+" : ""}${dX}${h > base.hits ? "  ⚠ +nodeHits" : ""}`;
    console.log(name.padEnd(28), String(c).padStart(7), String(x).padStart(9), String(h).padStart(8), tag);
  }
}
main();
