import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Diagram } from "@/components/diagram";
import type { SNode, SEdge } from "@/components/diagram";

// The structured diagram family: box-and-arrow idioms where POSITION encodes
// structure (sequence, hierarchy, containment) — not a measured value. Each
// story passes meaning only (kind + typed nodes + typed edges); the engine owns
// the layout, routing and theming.

// ── flowchart ────────────────────────────────────────────────────────────────
const FLOW_N: SNode[] = [
  { id: "s", label: "Receive request", role: "start" },
  { id: "v", label: "Validate input", role: "process" },
  { id: "d", label: "Valid?", role: "decision" },
  { id: "p", label: "Process & persist", role: "process" },
  { id: "n", label: "Return error", role: "io" },
  { id: "e", label: "Respond 200", role: "end" },
];
const FLOW_E: SEdge[] = [
  { source: "s", target: "v" },
  { source: "v", target: "d" },
  { source: "d", target: "p", label: "yes", kind: "yes" },
  { source: "d", target: "n", label: "no", kind: "no" },
  { source: "p", target: "e" },
  { source: "n", target: "e" },
];

// ── org / tree ───────────────────────────────────────────────────────────────
const TREE_N: SNode[] = [
  { id: "ceo", label: "Head of Research" },
  { id: "eng", label: "Methods" }, { id: "des", label: "Synthesis" }, { id: "ops", label: "Fieldwork" },
  { id: "e1", label: "Quant" }, { id: "e2", label: "Modelling" },
  { id: "d1", label: "Coding" }, { id: "d2", label: "Writing" },
  { id: "o1", label: "Recruiting" },
];
const TREE_E: SEdge[] = [
  ["ceo", "eng"], ["ceo", "des"], ["ceo", "ops"],
  ["eng", "e1"], ["eng", "e2"], ["des", "d1"], ["des", "d2"], ["ops", "o1"],
].map(([source, target]) => ({ source, target }));

// ── state machine ────────────────────────────────────────────────────────────
const STATE_N: SNode[] = [
  { id: "draft", label: "Draft", initial: true },
  { id: "review", label: "In review" },
  { id: "revise", label: "Revising" },
  { id: "approved", label: "Approved" },
  { id: "published", label: "Published", final: true },
];
const STATE_E: SEdge[] = [
  { source: "draft", target: "review", label: "submit" },
  { source: "review", target: "revise", label: "changes" },
  { source: "revise", target: "review", label: "resubmit" },
  { source: "review", target: "approved", label: "accept" },
  { source: "approved", target: "published", label: "release" },
];

// ── ER ───────────────────────────────────────────────────────────────────────
const ER_N: SNode[] = [
  { id: "author", label: "Author", role: "entity", attrs: ["id", "name", "orcid"] },
  { id: "paper", label: "Paper", role: "entity", attrs: ["id", "title", "year"] },
  { id: "venue", label: "Venue", role: "entity", attrs: ["id", "name"] },
  { id: "topic", label: "Topic", role: "entity", attrs: ["id", "label"] },
];
const ER_E: SEdge[] = [
  { source: "author", target: "paper", label: "writes", card: "1..*", kind: "relation" },
  { source: "paper", target: "venue", label: "published in", card: "*..1", kind: "relation" },
  { source: "paper", target: "topic", label: "tagged", card: "*..*", kind: "relation" },
];

// ── swimlane ─────────────────────────────────────────────────────────────────
const LANE_N: SNode[] = [
  { id: "req", label: "Raise request", role: "start", lane: "Requester" },
  { id: "tri", label: "Triage", role: "process", lane: "Reviewer" },
  { id: "ok", label: "Approve?", role: "decision", lane: "Reviewer" },
  { id: "do", label: "Implement", role: "process", lane: "Owner" },
  { id: "done", label: "Close", role: "end", lane: "Requester" },
];
const LANE_E: SEdge[] = [
  { source: "req", target: "tri" },
  { source: "tri", target: "ok" },
  { source: "ok", target: "do", label: "yes", kind: "yes" },
  { source: "ok", target: "done", label: "no", kind: "no" },
  { source: "do", target: "done" },
];

const meta: Meta<typeof Diagram> = {
  title: "Diagram/Overview",
  component: Diagram,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A **guardrail** component for the *structured* diagram family — flowcharts, org/tree, state machines, ER, swimlanes. Props are *meaning only* (`intent` or `kind`, typed `nodes`, typed `edges`); there is no position, colour or routing prop, so an overlapping or mis-routed diagram can't be expressed. The engine normalises the data, picks the idiom, lays it out with ELK (layered, orthogonal) and draws role-based boxes with right-angle connectors and edge labels. Sequence diagrams use the dedicated **SequenceDiagram** component. See **Diagram › Policies** for the rules it enforces.",
      },
    },
  },
  tags: ["autodocs"],
  args: { showGrade: true, height: 460 },
};
export default meta;
type S = StoryObj<typeof Diagram>;

export const Flowchart: S = {
  name: "Flowchart (intent: flow)",
  args: { intent: "flow", nodes: FLOW_N, edges: FLOW_E },
};

export const OrgTree: S = {
  name: "Org / tree (intent: hierarchy)",
  args: { intent: "hierarchy", nodes: TREE_N, edges: TREE_E },
};

export const StateMachine: S = {
  name: "State machine (intent: state)",
  args: { intent: "state", nodes: STATE_N, edges: STATE_E },
};

export const EntityRelationship: S = {
  name: "Entity–relationship (intent: er)",
  args: { intent: "er", nodes: ER_N, edges: ER_E },
};

export const Swimlane: S = {
  name: "Swimlane (intent: swimlane)",
  parameters: { docs: { description: { story: "Lane assignments ride on each node (`lane`); the engine flows the process left-to-right. (Lane bands are a work-in-progress visual layer.)" } } },
  args: { intent: "swimlane", nodes: LANE_N, edges: LANE_E },
};

// ── similarity (distance-true / MDS) ─────────────────────────────────────────
const SIM_N: SNode[] = Array.from({ length: 12 }, (_, i) => ({ id: "s" + i, label: "Concept " + i }));
const SIM_E: SEdge[] = [
  [0, 1], [1, 2], [0, 2], [2, 3],     // community A
  [4, 5], [5, 6], [4, 6], [6, 7],     // community B
  [8, 9], [9, 10], [8, 10], [10, 11], // community C
  [3, 4], [7, 8],                     // two bridges
].map(([a, b]) => ({ source: "s" + a, target: "s" + b }));

export const Similarity: S = {
  name: "Similarity (distance-true / MDS)",
  parameters: { docs: { description: { story: "The one idiom where distance MEANS similarity (Tenet 2): graph distances are embedded by stress majorisation (MDS), so near = related. Edges fade back, only hubs are labelled, and a stress score discloses how trustworthy the distances are." } } },
  args: { kind: "similarity", nodes: SIM_N, edges: SIM_E },
};
