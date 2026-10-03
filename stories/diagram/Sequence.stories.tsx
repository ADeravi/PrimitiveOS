import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SequenceDiagram } from "@/components/diagram";
import type { SNode, SEdge } from "@/components/diagram";

// Sequence / interaction diagram. Not a graph layout: participants are columns,
// lifelines run top-to-bottom, messages are ordered horizontal arrows. The
// engine fixes the geometry so it's always aligned; the caller supplies meaning
// only (participants + ordered messages). Rendered as themed SVG.

const PARTICIPANTS: SNode[] = [
  { id: "user", label: "User" },
  { id: "app", label: "App" },
  { id: "api", label: "API" },
  { id: "db", label: "Database" },
];

const MESSAGES: SEdge[] = [
  { source: "user", target: "app", label: "submit form" },
  { source: "app", target: "api", label: "POST /save" },
  { source: "api", target: "db", label: "INSERT row" },
  { source: "db", target: "api", label: "ok", kind: "return" },
  { source: "api", target: "app", label: "201 Created", kind: "return" },
  { source: "app", target: "app", label: "show toast" },
  { source: "app", target: "user", label: "confirmation", kind: "return" },
];

const meta: Meta<typeof SequenceDiagram> = {
  title: "Diagram/Sequence",
  component: SequenceDiagram,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Interaction over time. Participants become columns; messages are ordered top-to-bottom. Solid arrows are calls, dashed open arrows are returns/async. Self-messages loop on a single lifeline. Pure DS-token-themed SVG — re-themes with the Design Layer.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type S = StoryObj<typeof SequenceDiagram>;

export const RequestFlow: S = {
  name: "Request / response",
  args: { participants: PARTICIPANTS, messages: MESSAGES },
};
