import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { buildDiagram } from "@/components/diagram";
import type { DView } from "@/components/diagram";

// Renders the pipeline's OWN laid-out result (positions from the bundled
// dependency-free layout), so the picture matches the report beside it. This is
// the network god-layer — distinct from the structured <Diagram> family.
function NetworkPreview({ view }: { view: DView }) {
  const pos = new Map(view.nodes.map((n) => [n.id, n]));
  return (
    <svg
      viewBox="0 0 640 420" width="100%" role="img" aria-label="linter result"
      style={{ height: 340, border: "1px solid var(--border)", borderRadius: 10, background: "var(--background)" }}
    >
      {view.edges.map((e, i) => {
        const a = pos.get(e.source), b = pos.get(e.target);
        if (!a || !b) return null;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth={1} opacity={0.7} />;
      })}
      {view.nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={Math.max(5, (n.w || 16) / 2)} fill="var(--primary)" opacity={0.85} stroke="var(--background)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

const CLEAN_N = [
  { id: "a", label: "Cognition", group: 0 }, { id: "b", label: "Memory", group: 1 },
  { id: "c", label: "Attention", group: 2 }, { id: "d", label: "Encoding", group: 0 },
  { id: "e", label: "Hippocampus", group: 1 }, { id: "f", label: "Salience", group: 2 },
];
const CLEAN_E = [["a", "b"], ["a", "c"], ["a", "d"], ["b", "e"], ["c", "f"]].map(([source, target]) => ({ source, target }));

const MESSY_N = Array.from({ length: 16 }, (_, i) => ({ id: "m" + i, label: "Concept " + i, group: i % 9 }));
const MESSY_E = (() => { const e: { source: string; target: string }[] = []; for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) if (((i * 7 + j * 13) % 10) / 10 < 0.5) e.push({ source: "m" + i, target: "m" + j }); return e; })();

function Report({ intent = "explore", nodes = CLEAN_N, edges = CLEAN_E }: { intent?: string; nodes?: typeof CLEAN_N; edges?: typeof CLEAN_E }) {
  const built = React.useMemo(() => buildDiagram({ intent, nodes, edges, palette: { maxColors: 5 } }), [intent, nodes, edges]);
  const mono = { fontFamily: "var(--font-mono, ui-monospace, monospace)" } as const;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, width: 780, color: "var(--foreground)" }}>
      <NetworkPreview view={built.view} />
      <aside style={{ fontSize: 12, lineHeight: 1.5 }}>
        <div style={{ ...mono, fontWeight: 700 }}>
          {built.contract} · {built.grade} · {built.score.toFixed(2)} {built.passed ? "✓ pass" : "✗ best-effort"}
        </div>
        <h4 style={{ margin: "12px 0 4px" }}>Correction rounds</h4>
        <ol style={{ ...mono, margin: 0, paddingLeft: 18 }}>
          {built.rounds.map((r, i) => (
            <li key={i}>{r.phase}: {r.contract} {r.grade} [{r.violations.join(", ") || "clean"}]</li>
          ))}
        </ol>
        <h4 style={{ margin: "12px 0 4px" }}>Disclosures</h4>
        {built.notes.length ? (
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted-foreground)" }}>
            {built.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>none — passed clean.</span>
        )}
      </aside>
    </div>
  );
}

const meta: Meta<typeof Report> = {
  title: "Nests/Diagrams/Linter",
  component: Report,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The readability gate, exposed. Each example feeds a graph through the full pipeline and shows the contract chosen, the score/grade, every correction round, and the disclosures — so the rules are inspectable, not just asserted.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type S = StoryObj<typeof Report>;

export const Clean: S = { name: "Clean graph", args: { intent: "explore", nodes: CLEAN_N, edges: CLEAN_E } };
export const Messy: S = { name: "Messy graph (watch it correct)", args: { intent: "explore", nodes: MESSY_N, edges: MESSY_E } };
