import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Diagram, buildDiagram } from "@/components/diagram";

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
      <Diagram intent={intent} nodes={nodes} edges={edges} showGrade height={340} />
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
  title: "Diagram/Linter",
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
