import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Diagram } from "@/components/diagram";

// ---- sample data ----------------------------------------------------------
const BASE = [
  { id: "h1", label: "Cognition", group: 0 }, { id: "h2", label: "Memory systems", group: 1 },
  { id: "h3", label: "Attention", group: 2 }, { id: "a1", label: "Working memory", group: 0 },
  { id: "a2", label: "Encoding", group: 0 }, { id: "a3", label: "Retrieval", group: 0 },
  { id: "b1", label: "Hippocampus", group: 1 }, { id: "b2", label: "Consolidation", group: 1 },
  { id: "b3", label: "Forgetting", group: 1 }, { id: "c1", label: "Salience", group: 2 },
  { id: "c2", label: "Top-down control", group: 2 }, { id: "c3", label: "Distraction", group: 2 },
  { id: "d1", label: "Sleep", group: 1 }, { id: "d2", label: "Reward", group: 2 },
];
const EDGES = [
  ["h1", "h2"], ["h1", "h3"], ["h2", "h3"], ["h1", "a1"], ["h1", "a2"], ["h1", "a3"],
  ["a1", "a2"], ["a2", "a3"], ["h2", "b1"], ["h2", "b2"], ["h2", "b3"], ["b1", "b2"],
  ["b2", "b3"], ["h3", "c1"], ["h3", "c2"], ["h3", "c3"], ["c1", "c2"], ["c2", "c3"],
  ["b2", "d1"], ["d1", "a2"], ["c1", "d2"], ["d2", "h1"], ["a3", "b3"],
].map(([source, target]) => ({ source, target }));

const TREE_N = Array.from({ length: 9 }, (_, i) => ({ id: "t" + i, label: "Node " + i, group: 0 }));
const TREE_E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 8]].map(([a, b]) => ({ source: "t" + a, target: "t" + b }));

const MANY = Array.from({ length: 16 }, (_, i) => ({ id: "m" + i, label: "Concept " + i, group: i % 9 }));
const DENSE = (() => { const e: { source: string; target: string }[] = []; for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) if (((i * 7 + j * 13) % 10) / 10 < 0.5) e.push({ source: "m" + i, target: "m" + j }); return e; })();

const DATED = BASE.map((n, i) => ({ ...n, year: 1995 + i * 2 }));

const meta: Meta<typeof Diagram> = {
  title: "Diagram/Overview",
  component: Diagram,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A **guardrail** component. Props are *meaning only* — `intent`, `nodes`, `edges`. There is no position/style/colour prop, so a bad diagram can't be expressed. Internally it runs the god-layer pipeline (pick the right idiom → lay out → score readability → auto-correct) and renders only a view that passes, disclosing when it had to simplify. See **Diagram › Policies** for the rules it enforces.",
      },
    },
  },
  tags: ["autodocs"],
  args: { showGrade: true, height: 380 },
};
export default meta;
type S = StoryObj<typeof Diagram>;

export const Explore: S = {
  name: "Explore (force)",
  args: { intent: "explore", nodes: BASE, edges: EDGES },
};

export const Flow: S = {
  name: "Flow (→ hierarchy)",
  args: { intent: "flow", nodes: TREE_N, edges: TREE_E },
};

export const Dense: S = {
  name: "Dense data (→ matrix)",
  parameters: { docs: { description: { story: "Intent is `explore`, but the data is dense — the picker overrides to a matrix instead of a hairball, and says so." } } },
  args: { intent: "explore", nodes: MANY, edges: DENSE },
};

export const Timeline: S = {
  name: "Time (→ timeline)",
  args: { intent: "time", nodes: DATED, edges: EDGES },
};

export const AutoCorrected: S = {
  name: "Messy input, auto-corrected",
  parameters: { docs: { description: { story: "Sixteen nodes across nine colour groups with dense edges. The component caps the palette, thins labels, picks a readable idiom, and discloses the reductions — all from meaning-only props." } } },
  args: { intent: "explore", nodes: MANY, edges: DENSE },
};

export const Plain: S = {
  name: "Without grade badge",
  args: { intent: "explore", nodes: BASE, edges: EDGES, showGrade: false },
};
