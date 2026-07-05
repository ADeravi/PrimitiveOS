import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { planEdges } from "@/components/diagram/edgePolicy";
import type { NodeRole, SNode, SEdge } from "@/components/diagram/types";

// Living documentation for the EDGE policy — the same model as the chart/diagram
// policies, for routing. Canonical source: components/diagram/EDGE-POLICIES.md.

const wrap: React.CSSProperties = { maxWidth: 860, color: "var(--foreground)", fontFamily: "var(--font-sans, inherit)", lineHeight: 1.55, fontSize: 14 };
const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, margin: "0 0 4px" };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: "22px 0 6px" };
const lead: React.CSSProperties = { color: "var(--muted-foreground)", margin: "0 0 8px" };
const code: React.CSSProperties = { fontFamily: "var(--font-mono, ui-monospace, monospace)", background: "var(--muted)", padding: "1px 5px", borderRadius: 4, fontSize: 12.5 };
const card: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", background: "var(--card, var(--background))" };
const th: React.CSSProperties = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" };
const tdc: React.CSSProperties = { padding: "6px 8px", borderBottom: "1px solid var(--border)", verticalAlign: "top" };

const FAN: [string, string, string][] = [
  ["chain (1→1)", "bottom → top", "≤1"],
  ["split (1→2)", "the two sides → each child's top", "≤2"],
  ["fan-out (1→many)", "bottom → each child's top", "≤2"],
  ["merge (n→1)", "bottom → shared top", "≤2"],
  ["decision · primary", "bottom (straight pass-through)", "≤1"],
  ["decision · secondary", "the near side", "≤2"],
];

const RULES: [string, string][] = [
  ["route.crossesNode (error)", "a connector passing through a node it doesn't touch"],
  ["route.cornersOverBudget", "more bends than the fan allows — a noisier path than needed"],
  ["route.manyCrossings", "edge crossings beyond a small budget — reorder siblings or split the view"],
];

function Policies() {
  return (
    <article style={wrap}>
      <h1 style={h1}>Edge policies — routing as one verifiable rule set</h1>
      <p style={lead}>Edges share the policy model: <strong>one ruleset → one engine → one verifier</strong>. <span style={code}>planEdges</span> assigns each edge a fixed ELK <em>port side</em> from its fan-out + direction; ELK routes orthogonally to those vertices and returns exact bend points; <span style={code}>lintEdges</span> scores the polylines. Full text + citations in <span style={code}>components/diagram/EDGE-POLICIES.md</span>.</p>

      <h2 style={h2}>The routing rules</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead><tr><th style={th}>Fan</th><th style={th}>Out → in</th><th style={th}>Corner budget</th></tr></thead>
        <tbody>{FAN.map(([a, b, c]) => <tr key={a}><td style={tdc}><strong>{a}</strong></td><td style={tdc}>{b}</td><td style={tdc}>{c}</td></tr>)}</tbody>
      </table>

      <h2 style={h2}>What lintEdges enforces</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead><tr><th style={th}>Rule</th><th style={th}>Catches</th></tr></thead>
        <tbody>{RULES.map(([a, b]) => <tr key={a}><td style={tdc}><span style={code}>{a}</span></td><td style={tdc}>{b}</td></tr>)}</tbody>
      </table>
      <p style={{ ...lead, marginTop: 10 }}>Geometry is axis-aligned (ELK orthogonal), so the checks are exact. Verified headless: <span style={code}>npm run lint:policies</span>.</p>
    </article>
  );
}

// live readout — planEdges is pure (no ELK), so the port plan renders here.
const FLOW_N: (SNode & { role: NodeRole })[] = [
  { id: "s", label: "Receive", role: "start" }, { id: "v", label: "Validate", role: "process" },
  { id: "d", label: "Valid?", role: "decision" }, { id: "p", label: "Persist", role: "process" },
  { id: "n", label: "Error", role: "io" }, { id: "e", label: "Respond", role: "end" },
];
const FLOW_E: SEdge[] = [
  { source: "s", target: "v" }, { source: "v", target: "d" },
  { source: "d", target: "p", kind: "yes" }, { source: "d", target: "n", kind: "no" },
  { source: "p", target: "e" }, { source: "n", target: "e" },
];
const SPLIT_N: (SNode & { role: NodeRole })[] = [
  { id: "a", label: "Team", role: "node" }, { id: "b", label: "Design", role: "node" }, { id: "c", label: "Eng", role: "node" },
];
const SPLIT_E: SEdge[] = [{ source: "a", target: "b" }, { source: "a", target: "c" }];

function PlanTable({ title, nodes, edges }: { title: string; nodes: (SNode & { role: NodeRole })[]; edges: SEdge[] }) {
  const roleOf = (id: string) => nodes.find((n) => n.id === id)!.role;
  const plans = planEdges("flow", nodes, edges, roleOf);
  return (
    <div style={{ ...card, marginBottom: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
        <thead><tr><th style={th}>Edge</th><th style={th}>Fan</th><th style={th}>Source port</th><th style={th}>Target port</th><th style={th}>Budget</th><th style={th}>Style</th></tr></thead>
        <tbody>{plans.map((p) => (
          <tr key={p.index}>
            <td style={tdc}>{p.source} → {p.target}</td>
            <td style={tdc}>{p.fan}</td>
            <td style={tdc}>{p.sourceSide}</td>
            <td style={tdc}>{p.targetSide}</td>
            <td style={tdc}>{p.budget}</td>
            <td style={tdc}>{p.dashed ? "dashed" : "solid"}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Planner() {
  return (
    <article style={wrap}>
      <h1 style={h1}>The edge planner, exposed</h1>
      <p style={lead}><span style={code}>planEdges</span> is pure — these are the exact port sides ELK is told to route to. A decision passes through (primary out the bottom, secondary out the side); a 1→2 split leaves the two sides.</p>
      <PlanTable title="Flowchart (decision pass-through)" nodes={FLOW_N} edges={FLOW_E} />
      <PlanTable title="Org split (1→2 leaves the sides)" nodes={SPLIT_N} edges={SPLIT_E} />
    </article>
  );
}

const meta: Meta = { title: "Nests/Diagrams/Edge Policies", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

export const Policies_: S = { name: "Policies (the model)", render: () => <Policies /> };
export const Planner_: S = { name: "Planner (live port plan)", render: () => <Planner /> };
