import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Diagram } from "@/components/diagram";
import type { SNode, SEdge } from "@/components/diagram";

// Isolation stress tests — adversarial topologies an AI might push at the
// guardrail. The point: the caller supplies ONLY meaning (nodes + edges + intent)
// and the system produces an acceptable visual with no hand-tuning. These mirror
// the headless probe fixtures (tools/diagram-critique/elk-probe.ts), which already
// verifies the geometry (uniform sizing, ports, corner budgets, no edge crosses a
// node). Use these stories to confirm the *visual* outcome (colour, labels,
// balance) is acceptable too.

const meta: Meta<typeof Diagram> = {
  title: "Diagram/Stress Tests",
  component: Diagram,
  parameters: {
    layout: "centered",
    docs: { description: { component: "Hard, varied diagrams fed as pure meaning. If any renders poorly, it's a policy gap to fix in the guardrail — not something the caller should work around. Geometry is verified headlessly by `npm run lint:policies`." } },
  },
  tags: ["autodocs"],
  args: { showGrade: true, height: 460 },
};
export default meta;
type S = StoryObj<typeof Diagram>;

// flow · 3-way decision + 3→1 merge
const TW_N: SNode[] = [
  { id: "s", label: "Start", role: "start" }, { id: "d", label: "Route?", role: "decision" },
  { id: "a", label: "Path A", role: "process" }, { id: "b", label: "Path B", role: "process" },
  { id: "c", label: "Path C", role: "process" }, { id: "e", label: "Done", role: "end" },
];
const TW_E: SEdge[] = [
  { source: "s", target: "d" },
  { source: "d", target: "a", label: "a" }, { source: "d", target: "b", label: "b" }, { source: "d", target: "c", label: "c" },
  { source: "a", target: "e" }, { source: "b", target: "e" }, { source: "c", target: "e" },
];
export const ThreeWayDecision: S = { name: "Flow · 3-way decision + merge", args: { intent: "flow", nodes: TW_N, edges: TW_E } };

// flow · long chain + long labels
const LC_N: SNode[] = ["Authenticate the incoming request", "Validate and normalise payload", "Check authorisation scope", "Persist to the primary store", "Emit domain event to the bus", "Return the serialised response"]
  .map((label, i) => ({ id: "n" + i, label, role: i === 0 ? "start" : i === 5 ? "end" : "process" }));
const LC_E: SEdge[] = [0, 1, 2, 3, 4].map((i) => ({ source: "n" + i, target: "n" + (i + 1) }));
export const LongChain: S = { name: "Flow · long chain + long labels", args: { intent: "flow", nodes: LC_N, edges: LC_E } };

// tree · wide (1→6)
const WT_N: SNode[] = ["Root", "A", "B", "C", "D", "E", "F"].map((label, i) => ({ id: "w" + i, label }));
const WT_E: SEdge[] = [1, 2, 3, 4, 5, 6].map((i) => ({ source: "w0", target: "w" + i }));
export const WideTree: S = { name: "Tree · wide (1→6)", args: { intent: "hierarchy", nodes: WT_N, edges: WT_E } };

// tree · deep (4 levels)
const DT_N: SNode[] = ["L0", "L1a", "L1b", "L2a", "L2b", "L3a", "L3b"].map((label, i) => ({ id: "d" + i, label }));
const DT_E: SEdge[] = [["d0", "d1"], ["d0", "d2"], ["d1", "d3"], ["d1", "d4"], ["d3", "d5"], ["d3", "d6"]].map(([source, target]) => ({ source, target }));
export const DeepTree: S = { name: "Tree · deep (4 levels)", args: { intent: "hierarchy", nodes: DT_N, edges: DT_E } };

// state · multi-cycle
const MC_N: SNode[] = [
  { id: "a", label: "Idle", role: "state", initial: true }, { id: "b", label: "Running", role: "state" },
  { id: "c", label: "Paused", role: "state" }, { id: "z", label: "Stopped", role: "state", final: true },
];
const MC_E: SEdge[] = [
  { source: "a", target: "b", label: "run" }, { source: "b", target: "c", label: "pause" },
  { source: "c", target: "b", label: "resume" }, { source: "b", target: "a", label: "reset" }, { source: "b", target: "z", label: "stop" },
];
export const MultiCycleState: S = { name: "State · multi-cycle", args: { intent: "state", nodes: MC_N, edges: MC_E } };

// er · 6 entities (hub)
const HE_N: SNode[] = ["User", "Order", "Item", "Payment", "Address", "Coupon"].map((label, i) => ({ id: "e" + i, label, role: "entity", attrs: ["id", "name"] }));
const HE_E: SEdge[] = [["e0", "e1"], ["e1", "e2"], ["e1", "e3"], ["e0", "e4"], ["e1", "e5"]].map(([source, target]) => ({ source, target, kind: "relation" }));
export const HubER: S = { name: "ER · 6 entities (hub)", args: { intent: "er", nodes: HE_N, edges: HE_E } };

// swimlane · 4 lanes + cross-lane
const SL_N: SNode[] = [
  { id: "a", label: "Submit", role: "start", lane: "Customer" }, { id: "b", label: "Screen", role: "process", lane: "Support" },
  { id: "c", label: "Escalate?", role: "decision", lane: "Support" }, { id: "d", label: "Fix", role: "process", lane: "Engineering" },
  { id: "e", label: "Verify", role: "process", lane: "QA" }, { id: "f", label: "Close", role: "end", lane: "Customer" },
];
const SL_E: SEdge[] = [
  { source: "a", target: "b" }, { source: "b", target: "c" },
  { source: "c", target: "d", label: "yes", kind: "yes" }, { source: "c", target: "f", label: "no", kind: "no" },
  { source: "d", target: "e" }, { source: "e", target: "f" },
];
export const FourLaneSwimlane: S = { name: "Swimlane · 4 lanes + cross-lane", args: { intent: "swimlane", nodes: SL_N, edges: SL_E } };

// flow · disconnected components
const DC_N: SNode[] = [
  { id: "x", label: "Ingest", role: "start" }, { id: "y", label: "Store", role: "end" },
  { id: "p", label: "Poll", role: "start" }, { id: "q", label: "Transform", role: "process" }, { id: "r", label: "Sink", role: "end" },
];
const DC_E: SEdge[] = [{ source: "x", target: "y" }, { source: "p", target: "q" }, { source: "q", target: "r" }];
export const Disconnected: S = {
  name: "Flow · disconnected components",
  parameters: { docs: { description: { story: "Two independent components in one diagram — they should pack side by side without their edges tangling." } } },
  args: { intent: "flow", nodes: DC_N, edges: DC_E },
};

// provenance · AI-inferred elements carry the --rose accent (Tenet 9)
const PR_N: SNode[] = [
  { id: "q", label: "User query", role: "start" },
  { id: "r", label: "Retrieved doc", role: "process" },
  { id: "g", label: "Generated answer", role: "process", inferred: true },
  { id: "o", label: "Response", role: "end" },
];
const PR_E: SEdge[] = [
  { source: "q", target: "r" },
  { source: "r", target: "g", label: "infers", inferred: true },
  { source: "g", target: "o" },
];
export const Provenance: S = {
  name: "Provenance · AI-inferred in --rose (Tenet 9)",
  parameters: { docs: { description: { story: "AI-derived node and edge marked with the **--rose** provenance accent (dashed), so inference is never mistaken for asserted fact — converging the brand's provenance token with the edge policy." } } },
  args: { intent: "flow", nodes: PR_N, edges: PR_E },
};
