import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Diagram } from "@/components/diagram";
import type { SNode, SEdge } from "@/components/diagram";

// Grouping & Proximity — the layer that makes *position* mean something. Distance
// and arrangement are read before labels, so the engine controls them: tight
// communities + clear gaps (proximity = relatedness), confirmed by common-region
// enclosure (hulls / lane bands). The shared layer drives both families.

// ── communities (force + hulls) ──────────────────────────────────────────────
const C: SNode[] = [
  // group A — methods
  { id: "a1", label: "Sampling", group: "Methods" }, { id: "a2", label: "Coding", group: "Methods" },
  { id: "a3", label: "Reliability", group: "Methods" }, { id: "a4", label: "Bias", group: "Methods" },
  // group B — theory
  { id: "b1", label: "Cognition", group: "Theory" }, { id: "b2", label: "Memory", group: "Theory" },
  { id: "b3", label: "Attention", group: "Theory" }, { id: "b4", label: "Salience", group: "Theory" },
  // group C — application
  { id: "c1", label: "Onboarding", group: "Application" }, { id: "c2", label: "Retention", group: "Application" },
  { id: "c3", label: "Nudges", group: "Application" },
];
const CE: SEdge[] = [
  ["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a1", "a4"], ["a1", "a3"],
  ["b1", "b2"], ["b2", "b3"], ["b3", "b4"], ["b1", "b3"], ["b1", "b4"],
  ["c1", "c2"], ["c2", "c3"], ["c1", "c3"],
  ["a2", "b1"], // method ↔ theory bridge
  ["b3", "c3"], // theory ↔ application bridge
].map(([source, target]) => ({ source, target }));

// ── grouped flowchart (hull enclosure over phases) ───────────────────────────
const F: SNode[] = [
  { id: "s", label: "Receive", role: "start", group: "Intake" },
  { id: "v", label: "Validate", role: "process", group: "Intake" },
  { id: "d", label: "Valid?", role: "decision", group: "Core" },
  { id: "p", label: "Persist", role: "process", group: "Core" },
  { id: "n", label: "Error", role: "io", group: "Core" },
  { id: "e", label: "Respond", role: "end", group: "Exit" },
];
const FE: SEdge[] = [
  { source: "s", target: "v" }, { source: "v", target: "d" },
  { source: "d", target: "p", label: "yes", kind: "yes" }, { source: "d", target: "n", label: "no", kind: "no" },
  { source: "p", target: "e" }, { source: "n", target: "e" },
];

// ── swimlane (lane bands = ordered common region) ────────────────────────────
const LANE: SNode[] = [
  { id: "req", label: "Raise request", role: "start", lane: "Requester" },
  { id: "tri", label: "Triage", role: "process", lane: "Reviewer" },
  { id: "ok", label: "Approve?", role: "decision", lane: "Reviewer" },
  { id: "do", label: "Implement", role: "process", lane: "Owner" },
  { id: "done", label: "Close", role: "end", lane: "Requester" },
];
const LANE_E: SEdge[] = [
  { source: "req", target: "tri" }, { source: "tri", target: "ok" },
  { source: "ok", target: "do", label: "yes", kind: "yes" }, { source: "ok", target: "done", label: "no", kind: "no" },
  { source: "do", target: "done" },
];

const meta: Meta<typeof Diagram> = {
  title: "Nests/Diagrams/Grouping & Proximity",
  component: Diagram,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Position, distance and grouping are meaning, not decoration. This layer detects communities, lays them out so intra-group distance < inter-group gap (proximity = relatedness), and confirms the grouping with **common region** — soft convex-hull blobs or swimlane bands (the strongest grouping cue after a drawn line). The same shared module powers the network/force idioms and the structured box-and-arrow ones, and feeds the proximity checks in **Diagram › Linter**.",
      },
    },
  },
  tags: ["autodocs"],
  args: { showGrade: true, height: 480 },
};
export default meta;
type S = StoryObj<typeof Diagram>;

export const Communities: S = {
  name: "Communities (cluster + hulls)",
  parameters: { docs: { description: { story: "Three communities; edges are dense within, sparse between, with two labelled bridges. fcose pulls each community tight; the hulls make the grouping explicit so it doesn't rely on the reader guessing from distance alone." } } },
  args: { kind: "cluster", nodes: C, edges: CE },
};

export const GroupedFlow: S = {
  name: "Grouped flowchart (phase hulls)",
  parameters: { docs: { description: { story: "A normal flowchart, with a `group` per phase. The box-and-arrow structure carries the sequence; the hulls add a second, non-conflicting grouping channel (enclosure) to show the phases." } } },
  args: { kind: "flow", nodes: F, edges: FE },
};

export const Swimlane: S = {
  name: "Swimlane (lane bands)",
  parameters: { docs: { description: { story: "Ordered groups become lanes: rank flows left-to-right (x), responsibility is fixed top-to-bottom (y). One positional encoding per axis — no accidental proximity across lanes." } } },
  args: { kind: "swimlane", nodes: LANE, edges: LANE_E },
};
